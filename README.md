# URL Shortener API

A robust, scalable, and professional REST API built with NestJS for shortening, managing, and tracking URLs. This project is fully containerized with Docker and follows industry best practices for code quality, testing, and observability.

![Test Status](https://img.shields.io/badge/tests-passing-brightgreen) ![License](https://img.shields.io/badge/license-UNLICENSED-blue)

## Features

- **JWT Authentication**: Secure user registration and login system.
- **URL Shortening & Management**: Full CRUD operations for both anonymous and authenticated users.
- **Public Redirection**: High-performance `GET /:shortCode` endpoint for redirection and click tracking.
- **Dependency Inversion**: Built with a decoupled architecture using token-based injection for services.
- **Interactive API Docs**: Explore and test the API with Swagger at `/api-docs`.
- **Dockerized Environment**: Run the entire application and database with a single command.
- **Observability Foundations**:
  - **Structured Logging**: Production-ready JSON logs via Pino.
  - **Health Checks**: `GET /health` endpoint for monitoring application status.
- **Fully Tested**: Comprehensive and stable test suite covering all business logic (unit and E2E).
- **Professional Tooling**: Code quality enforced by ESLint, Prettier, and Husky pre-commit hooks.

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/) (usually included with Docker Desktop)
- [Node.js](https://nodejs.org/) (v18+) and [Yarn](https://yarnpkg.com/) for local development outside Docker.

### Running the Application with Docker (Recommended)

This is the simplest way to get the entire environment up and running.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Pizzy-23/url-shorter.git
    cd url-shorter
    ```

2.  **Create your environment file:**
    Copy the example environment file and fill in your details.

    ```bash
    cp .env.example .env
    ```

    > **Important:** Make sure to set a strong, unique `JWT_SECRET`.

3.  **Build and run the containers:**

    ```bash
    docker-compose up --build
    ```

    - The API will be available at `http://localhost:3000`.
    - The interactive Swagger documentation will be at `http://localhost:3000/api-docs`.
    - To run in the background, use `docker-compose up -d --build`.

4.  **To stop the application:**
    ```bash
    docker-compose down
    ```

---

## Testing

This project has a full suite of unit tests and end-to-end tests. You can run them with:

```bash
# Run all unit tests
yarn test

# Run only service-level unit tests
yarn test:services

# Run only controller-level unit tests
yarn test:controllers

# Run only end-to-end tests
yarn test:e2e

# Run tests in watch mode
yarn test:watch

---

## Observability

This project is instrumented with the foundations for a robust observability setup, essential for operating in a production environment.

### Structured Logging

The application uses **Pino** for high-performance, structured (JSON) logging, which is ideal for production environments.

- **In Development**: Logs are formatted with `pino-pretty` for readability.
- **In Production**: Logs are output as JSON, ready for ingestion by services like Datadog, Splunk, or the ELK stack.
  The log level can be configured with the `LOG_LEVEL` environment variable.

### Metrics (Prometheus)

The application exposes a `/metrics` endpoint with metrics in the Prometheus format. Custom metrics include:

- `url_shortened_total`: Total number of URLs shortened.
- `url_redirect_total`: Total redirects, labeled by `short_code`.

### Tracing (OpenTelemetry)

Distributed tracing is implemented using the OpenTelemetry standard.

- To enable, set `OTEL_ENABLED=true`.
- To configure a backend (like Jaeger or Datadog), set the `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` variable.

---

## Future Improvements & Scaling Challenges

For a horizontally-scaled, high-throughput environment, the following challenges and improvements should be considered:

#### 1. `shortCode` Uniqueness Guarantee

- **Challenge:** In a distributed system with multiple API instances running, a race condition could occur where two instances generate the same nanoid short code simultaneously before either has saved it to the database, causing a unique constraint violation.
- **Solution:** Implement a retry-on-conflict mechanism in the service layer. For very high-scale scenarios, the best solution is a dedicated ID generation service (like Twitter's Snowflake or a simple key-value store like Redis) to provide pre-generated, guaranteed-unique short codes to the API instances.

#### 2. Cache Invalidation

- **Challenge:** To improve performance, a cache (like Redis or Memcached) would be added to store frequently accessed URLs. However, when a user updates or deletes a URL on one instance, all other instances might continue serving stale data from their local or shared cache.
- **Solution:** Implement a Pub/Sub mechanism (e.g., Redis Pub/Sub). When a URL is modified, a cache invalidation event is published. All API instances subscribe to this channel and, upon receiving an event, know to evict the specific shortCode from their cache.

#### 3. Centralized Configuration and Secrets

- **Challenge:** Managing `.env` files across multiple instances and environments is not secure or scalable. Committing secrets to a repository is a major security risk.
- **Solution:** Adopt a secret management service like **HashiCorp Vault**, **AWS Parameter Store**, or **Azure Key Vault** allow you to centralize and securely manage application configuration, injecting them into the application environment at runtime instead of relying on local files.

---

## License

This project is [UNLICENSED](./LICENSE).
```
