import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import usePrevious from "react-use/lib/usePrevious";
import GlobalDropOverlay from "@/components/GlobalDropOverlay";
import Navigation from "@/components/Navigation";
import { GlobalDropProvider, useGlobalDropContext } from "@/contexts/GlobalDropContext";
import { useMemoFilterContext } from "@/contexts/MemoFilterContext";
import useCurrentUser from "@/hooks/useCurrentUser";
import useMediaQuery from "@/hooks/useMediaQuery";
import useNavigateTo from "@/hooks/useNavigateTo";
import { cn } from "@/lib/utils";
import { redirectOnAuthFailure } from "@/utils/auth-redirect";

const RootLayout = () => (
  <GlobalDropProvider>
    <RootLayoutInner />
  </GlobalDropProvider>
);

const RootLayoutInner = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sm = useMediaQuery("sm");
  const currentUser = useCurrentUser();
  const { removeFilter } = useMemoFilterContext();
  const pathname = useMemo(() => location.pathname, [location.pathname]);
  const prevPathname = usePrevious(pathname);
  const navigateTo = useNavigateTo();
  const { pendingFiles } = useGlobalDropContext();

  useEffect(() => {
    if (!currentUser) {
      redirectOnAuthFailure();
    }
  }, [currentUser]);

  useEffect(() => {
    // When the route changes and there is no filter in the search params, remove all filters
    if (prevPathname !== pathname && !searchParams.has("filter")) {
      removeFilter(() => true);
    }
  }, [prevPathname, pathname, searchParams, removeFilter]);

  // Navigate to home when files are dropped on a non-home page
  useEffect(() => {
    if (pendingFiles.length > 0 && pathname !== "/") {
      navigateTo("/");
    }
  }, [pendingFiles, pathname, navigateTo]);

  return (
    <div className="w-full min-h-full flex flex-row justify-center items-start sm:pl-16">
      <GlobalDropOverlay />
      {sm && (
        <div
          className={cn(
            "group flex flex-col justify-start items-start fixed top-0 left-0 select-none h-full bg-sidebar",
            "w-16 px-2",
            "border-r border-border",
          )}
        >
          <Navigation className="py-4 md:pt-6" collapsed={true} />
        </div>
      )}
      <main className="w-full h-auto grow shrink flex flex-col justify-start items-center">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
