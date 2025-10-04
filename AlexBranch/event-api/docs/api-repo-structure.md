# API Repository Structure

This document explains how the **event-api** project is organized and what each part of the repository does.

---

## Repository Overview

```
event-api/
├── __tests__/            # Unit and integration tests
├── coverage/             # Code coverage reports (auto-generated)
├── dlq/                  # Dead Letter Queue logs (invalid events)
├── docs/                 # Documentation files (schemas, structure, CI)
├── logs/                 # Valid event logs (e.g., clicks.log)
├── schemas/              # JSON Schemas for request validation
├── .editorconfig         # Code style settings
├── .gitignore            # Files and folders ignored by Git
├── package.json          # Dependencies and project metadata
├── package-lock.json     # Locked versions for reproducible installs
└── server.js             # Main API server
```

---

## Folder Details

### `__tests__/`

Contains Jest tests for the API:

* `/health` endpoint
* `/events/click` endpoint (valid, invalid, duplicate tests)
* `/telemetry` endpoint and auth checks
* Idempotency and DLQ tests

### `coverage/`

Auto-generated test coverage reports.
Ignored by Git but useful for development.

### `dlq/`

Stores invalid event data and schema validation errors in `dlq.log`.
Each entry includes the invalid payload and timestamp.

### `docs/`

Holds all documentation such as:

* `event-schema.md`
* `telemetry-schema.md`
* `api-repo-structure.md` (this file)

### `logs/`

Contains logs for successfully processed click events in `clicks.log`.

### `schemas/`

Includes JSON Schema definitions used for AJV validation:

* `clickEventSchema.json`
* `telemetryEventSchema.json`

---

## Key Files

| File                | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `.editorconfig`     | Maintains consistent code formatting                 |
| `.gitignore`        | Excludes logs, DLQ files, coverage, and dependencies |
| `package.json`      | Defines dependencies, scripts, and metadata          |
| `package-lock.json` | Locks dependency versions for consistency            |
| `server.js`         | Main entry point for the Express.js API              |

---

## Development and Testing

### Run the API

```bash
npm start
```

### Run Tests

```bash
npm test
```

### Install Dependencies

```bash
npm install
```

---

## Notes

* `node_modules/` is ignored and recreated using `npm install`.
* Log and DLQ files are ignored by Git but kept locally for structure.
* Keep documentation in `/docs` up to date when schemas or routes change.
