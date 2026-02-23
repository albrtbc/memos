# Changelog

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
