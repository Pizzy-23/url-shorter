# URL Shortener API

A robust, scalable, and professional REST API built with NestJS for shortening, managing, and tracking URLs. This project is fully containerized with Docker and follows industry best practices for code quality, testing, and observability.

![Test Status](https://img.shields.io/badge/tests-passing-brightgreen) ![License](https://img.shields.io/badge/license-UNLICENSED-blue)

## Features

- **JWT Authentication**: Secure user registration and login system.
- **URL Shortening**: Endpoint to shorten URLs for both anonymous and authenticated users.
- **URL Management**: Authenticated users can list, update, and soft-delete their own URLs.
- **Click Tracking**: Automatically counts every access to a shortened URL.
- **Interactive API Docs**: Explore and test the API with Swagger at `/api-docs`.
- **Dockerized Environment**: Run the entire application and database with a single command.
- **Professional Tooling**: Code quality enforced by ESLint, Prettier, and Husky pre-commit hooks.
- **Observability Ready**: Instrumented for logs, metrics, and tracing.
- **Fully Tested**: Comprehensive unit test coverage for core business logic.

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
    git clone https://github.com/your-username/url-shorter.git
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

This project has a full suite of unit tests. You can run them with:

```bash
# Run all tests
yarn test

# Run only service tests
yarn test:services

# Run only controller tests
yarn test:controllers

# Run only e2e tests
yarn test:e2e

# Run tests in watch mode
yarn test:watch
```

---

## Observability

This project is instrumented with the foundations for a robust observability setup, all controllable via environment variables.

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

- **Challenge:** A race condition could occur where two instances generate the same `shortCode` simultaneously.
- **Solution:** Implement a retry-on-conflict mechanism or, for very high scale, use a centralized ID generation service (like Twitter's Snowflake) to pre-generate unique IDs.

#### 2. Cache Invalidation

- **Challenge:** If a cache (like Redis) is added, updating or deleting a URL on one instance could lead to other instances serving stale data from their cache.
- **Solution:** Use a Pub/Sub system (like Redis Pub/Sub) for cache invalidation events, ensuring all instances clear the relevant cache key upon modification.

#### 3. Centralized Configuration

- **Challenge:** Managing `.env` files across multiple instances is not feasible.
- **Solution:** Adopt a secret management service like **HashiCorp Vault**, **AWS Parameter Store**, or **Azure Key Vault** to centralize and securely manage application configuration.

---

## License

This project is [UNLICENSED](./LICENSE).
