# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-26

This is the initial stable release of the URL Shortener API, featuring a complete set of functionalities for URL management and user authentication, all running in a containerized environment.

### Added

- **Docker Environment**: Full local development environment orchestrated with Docker Compose, including the NestJS application and a PostgreSQL database.
- **User Authentication**: Complete authentication system using JWT, with endpoints for user registration (`/auth/register`) and login (`/auth/login`).
- **URL Management**: Core functionality for shortening URLs, with specific endpoints for authenticated users to list, update, and soft-delete their links.
- **Click Tracking**: Automatic click counting for every redirected URL.
- **Code Quality Tools**: Integrated ESLint, Prettier, Husky, and lint-staged to enforce code style and quality automatically on pre-commit.
- **API Documentation**: Interactive API documentation available via Swagger UI at `/api-docs`.
- **Unit Tests**: Comprehensive unit test coverage for all services and controllers.

### Changed

- **Codebase Standardization**: Refactored the entire codebase to English for better maintainability and collaboration.
- **Path Aliases**: Implemented path aliases (e.g., `@/user/user.service`) for cleaner, more robust imports.

### Removed

- Default end-to-end tests in favor of focused unit tests.
