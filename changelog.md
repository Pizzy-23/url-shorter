# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-06-28

### Added

- **Public URL Redirection**: Implemented the core `GET /:shortCode` endpoint for public redirection and click tracking.
- **Dependency Inversion Principle**: Established service interface contracts (`I...Service`) to fully decouple modules and improve testability.
- **Observability Foundations**:
  - Added a `/health` endpoint for application health checks (via Terminus).
  - Integrated `nestjs-pino` for high-performance, structured JSON logging.
- **Full Test Coverage**: Completed the entire test suite, including stable unit and end-to-end tests for all features.

### Changed

- **Refactored DI to Token-Based Injection**: Updated the entire application to use string tokens for dependency injection, making the architecture more robust and scalable.
- **Improved E2E Test Isolation**: Switched to `createQueryBuilder().delete()` for database cleanup to reliably handle foreign key constraints during tests.

### Fixed

- **Circular Dependencies**: Resolved module circular dependencies by implementing a token-based injection pattern.
- **Jest & ESM Packages**: Corrected Jest configuration to properly handle ESM-only packages like `nanoid`.
- **Test Suite Stability**: Fixed all failing and flaky tests in the unit and E2E suites.

## [1.0.0] - 2025-06-26

### Added

- **Docker Environment**: Full local development environment orchestrated with Docker Compose, including the NestJS application and a PostgreSQL database.
- **User Authentication**: Complete authentication system using JWT, with endpoints for user registration (`/auth/register`) and login (`/auth/login`).
- **URL Management**: Core functionality for shortening URLs, with specific endpoints for authenticated users to list, update, and soft-delete their links.
- **Click Tracking**: Automatic click counting for every redirected URL.
- **Code Quality Tools**: Integrated ESLint, Prettier, and Husky pre-commit hooks.
- **API Documentation**: Interactive API documentation available via Swagger.
- **Initial Test Suite**: Unit and E2E test files created with initial coverage.
