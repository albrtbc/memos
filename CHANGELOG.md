# Changelog

## [0.33.0](https://github.com/albrtbc/memos/compare/v0.32.0...v0.33.0) (2026-02-24)


### Features

* persist map zoom level on server via Location protobuf field ([58f2fae](https://github.com/albrtbc/memos/commit/58f2fae5f601227d2fbd5565297e87935c51592e))

## [0.32.0](https://github.com/albrtbc/memos/compare/v0.31.0...v0.32.0) (2026-02-24)


### Features

* add altitude support to location across API, store and frontend ([05f43a6](https://github.com/albrtbc/memos/commit/05f43a6e70266351003880c975cd9596bc35f17c))

## [0.31.0](https://github.com/albrtbc/memos/compare/v0.30.0...v0.31.0) (2026-02-24)


### Features

* add address search to location picker via Nominatim forward geocoding ([e7ebeb5](https://github.com/albrtbc/memos/commit/e7ebeb57370ea0f1477d92287a978c4cb05dc0ca))


### Bug Fixes

* **ui:** prevent editor toolbar buttons from overflowing in masonry mode ([f038fe8](https://github.com/albrtbc/memos/commit/f038fe8d88ee4c063a5af8e57ee6928daa0ff7e9))

## [0.30.0](https://github.com/albrtbc/memos/compare/v0.29.0...v0.30.0) (2026-02-24)


### Features

* embed inline Leaflet map for memo locations with per-memo zoom persistence ([1776143](https://github.com/albrtbc/memos/commit/1776143ef351ad2cd3f7a93b0c65f9987b06edc8))

## [0.29.0](https://github.com/albrtbc/memos/compare/v0.28.2...v0.29.0) (2026-02-24)


### Features

* add Ctrl+M global shortcut to focus memo editor ([3410fea](https://github.com/albrtbc/memos/commit/3410feae84568a9f1c077b8072a2737d5fd4e111))
* **ui:** style hashtags as rounded pill chips in memo content ([591c631](https://github.com/albrtbc/memos/commit/591c63154a7d40d3c40f0826c79f71e2de837b24))

## [0.28.2](https://github.com/albrtbc/memos/compare/v0.28.1...v0.28.2) (2026-02-23)


### Bug Fixes

* invalidate memo detail cache after editing from detail page ([a01f6ba](https://github.com/albrtbc/memos/commit/a01f6ba3bcccb68558f1b335d550496e5ab4eef4))

## [0.28.1](https://github.com/albrtbc/memos/compare/v0.28.0...v0.28.1) (2026-02-23)


### Bug Fixes

* **ci:** chain Docker and binary builds from Release Please ([b616005](https://github.com/albrtbc/memos/commit/b6160053231ab689e3329cff93ce58073da88ca2))

## [0.28.0](https://github.com/albrtbc/memos/compare/v0.27.0...v0.28.0) (2026-02-23)


### Features

* auto-embed Reddit posts in memos ([a73569b](https://github.com/albrtbc/memos/commit/a73569bd3bea021d5a30f7769b5bd805a9eb1ee3))
* auto-embed Twitter/X posts in memos ([e93c400](https://github.com/albrtbc/memos/commit/e93c40065a703e9bc3f6f75b4f8e90e495bd1449))
* auto-embed YouTube links in memos and update CODEOWNERS ([500cf3c](https://github.com/albrtbc/memos/commit/500cf3c4c809a0fe7f3ca1cc4d00d33358a3c31a))
* **ui:** move pin and edit actions to hover icons on memo header ([ce946c2](https://github.com/albrtbc/memos/commit/ce946c27943f99cb9fb045318e18f21db13c362c))

## [0.27.0](https://github.com/albrtbc/memos/compare/v0.26.2...v0.27.0) (2026-02-23)

Custom fork based on [usememos/memos](https://github.com/usememos/memos) v0.26.2.

### Features

* **editor:** flatten toolbar into inline icon buttons with slash commands ([72371b5](https://github.com/albrtbc/memos/commit/72371b52))
* search wildcards, Escape to clear filters, Ctrl+K to focus search ([0e809dd](https://github.com/albrtbc/memos/commit/0e809dde))
* search memos by attachment filename via content.contains() ([0d6781e](https://github.com/albrtbc/memos/commit/0d6781ea))
* **web:** add global drag-and-drop file upload ([9a887e7](https://github.com/albrtbc/memos/commit/9a887e72))

### Bug Fixes

* avoid truncating memo batch attachments ([ff3e4c5](https://github.com/albrtbc/memos/commit/ff3e4c5c))
* **web:** fix spurious logout on page reload with expired access token ([9ecd7b8](https://github.com/albrtbc/memos/commit/9ecd7b87))
* **web:** fix explore page showing private tags and improve stats hook ([03c30b8](https://github.com/albrtbc/memos/commit/03c30b8c))
* **web:** make MonthNavigator month label reactive to language changes ([1cea9b0](https://github.com/albrtbc/memos/commit/1cea9b0a))
* **store:** allow memo/attachment deletion when local file is missing ([704503e](https://github.com/albrtbc/memos/commit/704503e5))
* **web:** improve MemoEditor layout and timestamp popover styling ([17fc838](https://github.com/albrtbc/memos/commit/17fc8383))
* **webhook:** remediate SSRF vulnerability in webhook dispatcher ([150371d](https://github.com/albrtbc/memos/commit/150371d2))
