# Memos (Custom Fork)

<img align="right" height="96px" src="https://raw.githubusercontent.com/usememos/.github/refs/heads/main/assets/logo-rounded.png" alt="Memos" />

A custom fork of [usememos/memos](https://github.com/usememos/memos) — an open-source, self-hosted note-taking service. Forked from **v0.26.2** with additional features, bug fixes, and UX improvements.

[![Upstream](https://img.shields.io/badge/upstream-usememos%2Fmemos-blue?style=flat-square)](https://github.com/usememos/memos)
[![Base Version](https://img.shields.io/badge/base-v0.26.2-green?style=flat-square)](https://github.com/usememos/memos/releases/tag/v0.26.2)

## Changes from upstream

### Features

- **Flat editor toolbar** — All insert actions (Upload, Link Memo, Location, Todo, Code, Link, Table, Focus Mode) shown as inline icon buttons instead of a nested dropdown menu. Table button includes a column-count picker popover.
- **Search wildcards** — Support for wildcard patterns in search, Escape key to clear filters, and Ctrl+K to focus the search bar.
- **Search by attachment filename** — Find memos by searching for attached file names via `content.contains()`.
- **Global drag-and-drop upload** — Drag files anywhere onto the page to upload and attach them to the current memo.

### Bug fixes

- Fix spurious logout on page reload with expired access token
- Fix explore page showing private tags and improve stats hook
- Fix MonthNavigator month label not reacting to language changes
- Allow memo/attachment deletion when local file is missing
- Improve MemoEditor layout and timestamp popover styling
- Remediate SSRF vulnerability in webhook dispatcher
- Fix truncating memo batch attachments
- Visibility selector shows icon-only to prevent toolbar overflow

### Other

- Full project refactor and code quality improvements
- Fix CODEOWNERS configuration

## Quick start

### Docker (recommended)

```bash
docker run -d \
  --name memos \
  -p 5230:5230 \
  -v ~/.memos:/var/opt/memos \
  ghcr.io/albrtbc/memos:latest
```

### Docker Compose

```yaml
services:
  memos:
    image: ghcr.io/albrtbc/memos:latest
    container_name: memos
    ports:
      - 5230:5230
    volumes:
      - ~/.memos:/var/opt/memos
    restart: unless-stopped
```

```bash
docker compose up -d
```

Open `http://localhost:5230` and start writing.

## Deployment

This fork uses GitHub Actions to automatically build and push a Docker image to GitHub Container Registry (GHCR) on every push to `main`.

To deploy on your server:

```bash
# Pull the latest image
docker pull ghcr.io/albrtbc/memos:latest

# Restart the container
docker compose up -d
```

To update, simply `docker compose pull && docker compose up -d`.

## Upstream

For documentation, feature requests, and community support for the base project, see [usememos.com](https://usememos.com).

## License

Memos is open-source software licensed under the [MIT License](LICENSE).
