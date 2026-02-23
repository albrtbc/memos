# Changelog

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
