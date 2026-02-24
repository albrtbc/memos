package server

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"runtime"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/pkg/errors"

	"github.com/usememos/memos/internal/profile"
	storepb "github.com/usememos/memos/proto/gen/store"
	apiv1 "github.com/usememos/memos/server/router/api/v1"
	"github.com/usememos/memos/server/router/fileserver"
	"github.com/usememos/memos/server/router/frontend"
	mcprouter "github.com/usememos/memos/server/router/mcp"
	"github.com/usememos/memos/server/router/rss"
	"github.com/usememos/memos/server/runner/s3presign"
	"github.com/usememos/memos/store"
)

type Server struct {
	Secret  string
	Profile *profile.Profile
	Store   *store.Store

	echoServer        *echo.Echo
	httpServer        *http.Server
	runnerCancelFuncs []context.CancelFunc
}

func NewServer(ctx context.Context, profile *profile.Profile, store *store.Store) (*Server, error) {
	s := &Server{
		Store:   store,
		Profile: profile,
	}

	echoServer := echo.New()
	echoServer.Use(middleware.Recover())
	s.echoServer = echoServer

	instanceBasicSetting, err := s.getOrUpsertInstanceBasicSetting(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get instance basic setting")
	}

	secret := "usememos"
	if !profile.Demo {
		secret = instanceBasicSetting.SecretKey
	}
	s.Secret = secret

	// Register healthz endpoint.
	echoServer.GET("/healthz", func(c *echo.Context) error {
		return c.String(http.StatusOK, "Service ready.")
	})

	// Twitter syndication proxy — bypasses CORS restriction on cdn.syndication.twimg.com.
	tweetIDPattern := regexp.MustCompile(`^\d{1,20}$`)
	echoServer.GET("/api/twitter/tweet", func(c *echo.Context) error {
		id := c.QueryParam("id")
		if !tweetIDPattern.MatchString(id) {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
		}

		endpoint, _ := url.Parse("https://cdn.syndication.twimg.com/tweet-result")
		q := endpoint.Query()
		q.Set("id", id)
		q.Set("lang", "en")
		if token := c.QueryParam("token"); token != "" {
			q.Set("token", token)
		}
		endpoint.RawQuery = q.Encode()

		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Get(endpoint.String())
		if err != nil {
			return c.JSON(http.StatusBadGateway, map[string]string{"error": "upstream request failed"})
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(io.LimitReader(resp.Body, 512*1024))
		if err != nil {
			return c.JSON(http.StatusBadGateway, map[string]string{"error": "read failed"})
		}

		c.Response().Header().Set("Cache-Control", "public, max-age=300")
		return c.JSONBlob(resp.StatusCode, body)
	})

	// TikTok oEmbed proxy — bypasses CORS restriction on tiktok.com/oembed.
	tiktokURLPattern := regexp.MustCompile(`^https?://([a-z0-9]+\.)?tiktok\.com/`)
	echoServer.GET("/api/tiktok/oembed", func(c *echo.Context) error {
		videoURL := c.QueryParam("url")
		if !tiktokURLPattern.MatchString(videoURL) {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid TikTok URL"})
		}

		endpoint, _ := url.Parse("https://www.tiktok.com/oembed")
		q := endpoint.Query()
		q.Set("url", videoURL)
		endpoint.RawQuery = q.Encode()

		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Get(endpoint.String())
		if err != nil {
			return c.JSON(http.StatusBadGateway, map[string]string{"error": "upstream request failed"})
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(io.LimitReader(resp.Body, 512*1024))
		if err != nil {
			return c.JSON(http.StatusBadGateway, map[string]string{"error": "read failed"})
		}

		c.Response().Header().Set("Cache-Control", "public, max-age=300")
		return c.JSONBlob(resp.StatusCode, body)
	})

	// Reddit JSON API proxy — bypasses CORS restriction on reddit.com.
	redditURLPattern := regexp.MustCompile(`^https?://(www\.)?reddit\.com/r/\w+/comments/\w+`)
	echoServer.GET("/api/reddit/post", func(c *echo.Context) error {
		postURL := c.QueryParam("url")
		if !redditURLPattern.MatchString(postURL) {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid Reddit URL"})
		}

		// Normalize: strip query/fragment, use old.reddit.com (more permissive with bots), append .json
		parsed, err := url.Parse(postURL)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid URL"})
		}
		parsed.Host = "old.reddit.com"
		parsed.RawQuery = ""
		parsed.Fragment = ""
		jsonURL := parsed.String() + ".json"

		req, _ := http.NewRequest("GET", jsonURL, nil)
		req.Header.Set("User-Agent", "memos/1.0 (compatible; +https://github.com/albrtbc/memos)")
		req.Header.Set("Accept", "application/json")

		// Force HTTP/1.1 — Reddit fingerprints Go's HTTP/2 SETTINGS and blocks bots.
		client := &http.Client{
			Timeout: 8 * time.Second,
			Transport: &http.Transport{
				TLSNextProto: make(map[string]func(authority string, c *tls.Conn) http.RoundTripper),
			},
			CheckRedirect: func(r *http.Request, via []*http.Request) error {
				r.Header.Set("User-Agent", "memos/1.0 (compatible; +https://github.com/albrtbc/memos)")
				r.Header.Set("Accept", "application/json")
				return nil
			},
		}
		resp, err := client.Do(req)
		if err != nil {
			return c.JSON(http.StatusBadGateway, map[string]string{"error": "upstream request failed"})
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*1024))
		if err != nil {
			return c.JSON(http.StatusBadGateway, map[string]string{"error": "read failed"})
		}

		c.Response().Header().Set("Cache-Control", "public, max-age=300")
		return c.JSONBlob(resp.StatusCode, body)
	})

	// Serve frontend static files.
	frontend.NewFrontendService(profile, store).Serve(ctx, echoServer)

	rootGroup := echoServer.Group("")

	apiV1Service := apiv1.NewAPIV1Service(s.Secret, profile, store)

	// Register HTTP file server routes BEFORE gRPC-Gateway to ensure proper range request handling for Safari.
	// This uses native HTTP serving (http.ServeContent) instead of gRPC for video/audio files.
	fileServerService := fileserver.NewFileServerService(s.Profile, s.Store, s.Secret)
	fileServerService.RegisterRoutes(echoServer)

	// Create and register RSS routes (needs markdown service from apiV1Service).
	rss.NewRSSService(s.Profile, s.Store, apiV1Service.MarkdownService).RegisterRoutes(rootGroup)
	// Register gRPC gateway as api v1.
	if err := apiV1Service.RegisterGateway(ctx, echoServer); err != nil {
		return nil, errors.Wrap(err, "failed to register gRPC gateway")
	}

	// Register MCP server.
	mcpService := mcprouter.NewMCPService(s.Store, s.Secret)
	mcpService.RegisterRoutes(echoServer)

	return s, nil
}

func (s *Server) Start(ctx context.Context) error {
	var address, network string
	if len(s.Profile.UNIXSock) == 0 {
		address = fmt.Sprintf("%s:%d", s.Profile.Addr, s.Profile.Port)
		network = "tcp"
	} else {
		address = s.Profile.UNIXSock
		network = "unix"
	}
	listener, err := net.Listen(network, address)
	if err != nil {
		return errors.Wrap(err, "failed to listen")
	}

	// Start Echo server directly (no cmux needed - all traffic is HTTP).
	s.httpServer = &http.Server{Handler: s.echoServer}
	go func() {
		if err := s.httpServer.Serve(listener); err != nil && err != http.ErrServerClosed {
			slog.Error("failed to start echo server", "error", err)
		}
	}()
	s.StartBackgroundRunners(ctx)

	return nil
}

func (s *Server) Shutdown(ctx context.Context) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	slog.Info("server shutting down")

	// Cancel all background runners
	for _, cancelFunc := range s.runnerCancelFuncs {
		if cancelFunc != nil {
			cancelFunc()
		}
	}

	// Shutdown HTTP server.
	if s.httpServer != nil {
		if err := s.httpServer.Shutdown(ctx); err != nil {
			slog.Error("failed to shutdown server", slog.String("error", err.Error()))
		}
	}

	// Close database connection.
	if err := s.Store.Close(); err != nil {
		slog.Error("failed to close database", slog.String("error", err.Error()))
	}

	slog.Info("memos stopped properly")
}

func (s *Server) StartBackgroundRunners(ctx context.Context) {
	// Create a separate context for each background runner
	// This allows us to control cancellation for each runner independently
	s3Context, s3Cancel := context.WithCancel(ctx)

	// Store the cancel function so we can properly shut down runners
	s.runnerCancelFuncs = append(s.runnerCancelFuncs, s3Cancel)

	// Create and start S3 presign runner
	s3presignRunner := s3presign.NewRunner(s.Store)
	s3presignRunner.RunOnce(ctx)

	// Start continuous S3 presign runner
	go func() {
		s3presignRunner.Run(s3Context)
		slog.Info("s3presign runner stopped")
	}()

	// Log the number of goroutines running
	slog.Info("background runners started", "goroutines", runtime.NumGoroutine())
}

func (s *Server) getOrUpsertInstanceBasicSetting(ctx context.Context) (*storepb.InstanceBasicSetting, error) {
	instanceBasicSetting, err := s.Store.GetInstanceBasicSetting(ctx)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get instance basic setting")
	}
	modified := false
	if instanceBasicSetting.SecretKey == "" {
		instanceBasicSetting.SecretKey = uuid.NewString()
		modified = true
	}
	if modified {
		instanceSetting, err := s.Store.UpsertInstanceSetting(ctx, &storepb.InstanceSetting{
			Key:   storepb.InstanceSettingKey_BASIC,
			Value: &storepb.InstanceSetting_BasicSetting{BasicSetting: instanceBasicSetting},
		})
		if err != nil {
			return nil, errors.Wrap(err, "failed to upsert instance setting")
		}
		instanceBasicSetting = instanceSetting.GetBasicSetting()
	}
	return instanceBasicSetting, nil
}
