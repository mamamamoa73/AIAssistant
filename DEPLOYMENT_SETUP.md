# Deployment Setup: Amazon Listing Optimizer

This document outlines the containerization setup using Docker, a local development environment configuration using `docker-compose.yml`, and strategies for CI/CD and cloud deployment for the Amazon Listing Optimizer application.

## 1. Dockerization

Containerization with Docker is used to package the frontend and backend applications with their dependencies, ensuring consistency across different environments.

### 1.1. Backend Dockerfile (`backend/Dockerfile`)

*   **Purpose:** To create a Docker image for the Python FastAPI backend application.
*   **Key Stages:**
    1.  **Base Image:** Uses `python:3.9-slim` for a lightweight Python environment.
    2.  **Working Directory:** Sets `/app` as the working directory inside the container.
    3.  **Copy Dependencies:** Copies `requirements.txt` into the container.
    4.  **Install Dependencies:** Installs Python packages using `pip install --no-cache-dir -r requirements.txt` to keep the image lean. Includes an upgrade for `pip` itself.
    5.  **Copy Application Code:** Copies the `backend/app` directory (containing the FastAPI application source) into `/app/app` within the image.
    6.  **Expose Port:** Exposes port `8000`, which is the default port Uvicorn will run on.
    7.  **CMD (Command):** Specifies the default command to run when the container starts: `uvicorn app.main:app --host 0.0.0.0 --port 8000`. This makes the Uvicorn server accessible from outside the container.

### 1.2. Frontend Dockerfile (`frontend/Dockerfile`)

*   **Purpose:** To build the React frontend application and serve it using Nginx. This is a multi-stage build to keep the final image small.
*   **Key Stages:**
    1.  **Build Stage (aliased as `builder`):**
        *   **Base Image:** Uses `node:18-alpine` for a lean Node.js environment for building the React app.
        *   **Working Directory:** Sets `/app`.
        *   **Copy Dependencies:** Copies `package.json` and `package-lock.json`.
        *   **Install Dependencies:** Uses `npm ci` for a clean and reproducible installation of Node.js packages.
        *   **Copy Application Code:** Copies all frontend source code into the image.
        *   **Build Application:** Runs `npm run build` (as defined in `package.json`) to generate static production assets (HTML, CSS, JS). The output is typically in a `/app/dist` directory.
    2.  **Serve Stage:**
        *   **Base Image:** Uses `nginx:1.25-alpine`, a lightweight Nginx image.
        *   **Copy Build Artifacts:** Copies the static files generated in the `builder` stage (from `/app/dist`) into Nginx's default web server directory (`/usr/share/nginx/html`).
        *   **Copy Nginx Configuration:** Copies a custom `nginx.conf` (from `frontend/nginx.conf`) into `/etc/nginx/conf.d/default.conf`. This configuration file is crucial for serving a Single Page Application (SPA) like React, typically by ensuring all routes are directed to `index.html` to be handled by client-side routing.
        *   **Expose Port:** Exposes port `80`, the default HTTP port for Nginx.
        *   **CMD (Command):** Starts Nginx in the foreground: `nginx -g 'daemon off;'`.

### 1.3. Frontend Nginx Configuration (`frontend/nginx.conf`)

*   **Purpose:** To configure Nginx to correctly serve the React SPA.
*   **Key Settings:**
    *   `listen 80;`: Nginx listens on port 80.
    *   `root /usr/share/nginx/html;`: Sets the document root where static files are located.
    *   `index index.html index.htm;`: Defines default files to serve.
    *   `location / { try_files $uri $uri/ /index.html; }`: This is the critical part for SPAs. If a requested file or directory (`$uri` or `$uri/`) is not found on the server, it serves `index.html` instead. This allows React Router (or any client-side router) to handle the routing logic for different paths.
    *   Includes commented-out examples for setting cache headers and enabling Gzip compression for optimization.

## 2. `docker-compose.yml` for Local Development

*   **Purpose:** To define and run the multi-container application (backend, frontend, and optional database) for a consistent and easy-to-set-up local development environment.
*   **Services:**
    *   **`backend`:**
        *   **Build:** Uses the `backend/Dockerfile`.
        *   **Ports:** Maps port `8000` on the host to `8000` in the container.
        *   **Volumes:** Mounts the local `./backend` directory to `/app` in the container. This allows for live reloading of the backend code during development (when Uvicorn is run with `--reload`).
        *   **`env_file`:** Loads environment variables from `./backend/.env`, which should contain API keys and other configurations.
        *   **`PYTHONPATH`:** Sets `PYTHONPATH=/app` to ensure Python can find modules correctly given the project structure.
    *   **`frontend`:**
        *   **Build:** Uses the `frontend/Dockerfile`.
        *   **Ports:** Maps port `3000` on the host to `80` in the container (as Nginx serves on port 80 within its container).
        *   **`depends_on: - backend`:** Ensures the backend service is started before the frontend service.
        *   **Volumes (Commented Out for Production Image):** The current setup builds a production-like Nginx image. For live reloading of frontend code during development, the `Dockerfile` and `docker-compose.yml` would need to be adjusted to run Vite's dev server directly within the container, and volumes would mount `frontend/src` and `frontend/public`. The current setup is better for testing the final build artifact.
    *   **`db` (PostgreSQL - Optional for current MVP):**
        *   **Image:** Uses the official `postgres:15-alpine` image.
        *   **Ports:** Maps port `5432` on the host to `5432` in the container.
        *   **Volumes:** Creates a named volume `postgres_data` to persist PostgreSQL database data across container restarts.
        *   **Environment Variables:** Sets `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` using values from the host's environment (or defaults if not set there), allowing customization via a root `.env` file if desired for Compose-level environment variables.
        *   **Healthcheck:** Includes a basic health check to verify if the PostgreSQL server is ready.
*   **Volumes:** Defines a top-level named volume `postgres_data` for database persistence.

## 3. CI/CD Strategy Outline

A Continuous Integration/Continuous Deployment (CI/CD) pipeline automates the testing and deployment process.

*   **Tool Suggestion:** GitHub Actions.
*   **Workflow Triggers:**
    *   Push to `main` branch (for production/staging deployment).
    *   Pull requests targeting the `main` branch (for running tests and checks before merging).
*   **Key Stages:**
    1.  **Lint & Test (for both Frontend and Backend):**
        *   **Checkout Code:** Get the latest version of the code.
        *   **Set up Environments:** Initialize appropriate Python (for backend) and Node.js (for frontend) environments.
        *   **Install Dependencies:** Install dependencies for both backend (`pip install -r requirements.txt`) and frontend (`npm ci`).
        *   **Run Linters:** Execute linters to enforce code style and catch errors (e.g., Flake8/Black for Python, ESLint/Prettier for Frontend).
        *   **Run Tests:**
            *   Backend: Execute unit and integration tests using `pytest`.
            *   Frontend: Execute unit and component integration tests using `vitest` (or `jest`).
    2.  **Build Docker Images:**
        *   If tests pass, build the Docker images for the frontend and backend services using their respective `Dockerfile`s.
    3.  **Push to Container Registry:**
        *   Tag the built images (e.g., with the commit SHA, version number, or `latest`).
        *   Push the tagged images to a container registry (e.g., Docker Hub, AWS Elastic Container Registry (ECR), Google Artifact Registry, GitHub Container Registry).
    4.  **Deploy (Conceptual - details depend on chosen platform):**
        *   **Trigger:** Can be manual (e.g., after a successful build on `main`) or automated.
        *   **Steps:**
            *   Authenticate with the cloud provider.
            *   Pull the new images from the container registry to the deployment target.
            *   Update the running services to use the new images (e.g., update ECS task definition, Kubernetes deployment, Cloud Run service revision).
            *   Perform health checks on the newly deployed version.
            *   (Optional) Run smoke tests.
            *   (Optional) Implement strategies like blue/green or canary deployments for safer rollouts.

## 4. Cloud Deployment Strategy Outline

This section outlines general considerations for deploying the application to a cloud platform.

*   **Platform Suggestions:**
    *   **AWS:**
        *   **ECS (Elastic Container Service) with Fargate:** Serverless container orchestration. Good for running containers without managing underlying EC2 instances.
        *   **Elastic Beanstalk (with Docker):** PaaS offering that can simplify deployment and management if you prefer a more abstracted environment.
    *   **Google Cloud:**
        *   **Cloud Run:** Serverless platform to run stateless containers. Highly scalable and cost-effective.
        *   **GKE (Google Kubernetes Engine):** Managed Kubernetes service for more complex microservice architectures or if Kubernetes expertise exists.
    *   **Azure:**
        *   **Azure Container Apps:** Similar to Cloud Run, for serverless containers.
        *   **AKS (Azure Kubernetes Service):** Managed Kubernetes service.
    *   **PaaS (Platform as a Service):**
        *   **Heroku:** Easy to use, good for rapid deployment, handles much of the infrastructure.
        *   **Render:** Similar to Heroku, offers good developer experience.

*   **Key Considerations for any Cloud Platform:**
    *   **Database:**
        *   Use a managed database service (e.g., AWS RDS for PostgreSQL, Google Cloud SQL for PostgreSQL, Azure Database for PostgreSQL). This handles backups, patching, and scalability.
        *   Ensure the database is in the same region as the backend application for low latency and is securely networked (e.g., within a private VPC/subnet).
    *   **Networking:**
        *   **Load Balancer:** Place a load balancer in front of the backend (and potentially frontend if not using a CDN primarily) to distribute traffic, handle SSL termination, and provide a stable endpoint.
        *   **VPC/Subnets:** Deploy resources within a Virtual Private Cloud (VPC) with appropriate public and private subnets for security and isolation.
        *   **CDN (Content Delivery Network):** For the frontend static assets, use a CDN (e.g., AWS CloudFront, Google Cloud CDN, Cloudflare) to cache content closer to users, improving load times and reducing server load.
    *   **Secrets Management:**
        *   Store sensitive information like API keys (OpenAI, Amazon PAAPI, SP-API LWA credentials), database credentials, and other secrets securely.
        *   Use dedicated services like AWS Secrets Manager, Google Secret Manager, Azure Key Vault, or HashiCorp Vault. Do not hardcode secrets in application code or Docker images.
    *   **Logging & Monitoring:**
        *   **Centralized Logging:** Aggregate logs from both frontend (if applicable) and backend services into a centralized logging solution (e.g., AWS CloudWatch Logs, Google Cloud Logging, ELK stack, Datadog, Sentry).
        *   **Application Performance Monitoring (APM):** Use APM tools (e.g., Datadog, New Relic, Sentry, AWS X-Ray, Google Cloud Trace/Profiler) to monitor application performance, track errors, and identify bottlenecks.
        *   **Metrics & Alerting:** Set up key metrics (e.g., request latency, error rates, CPU/memory utilization) and alerts to be notified of issues.
    *   **Scalability:**
        *   Configure auto-scaling for containerized services based on metrics like CPU utilization or request count.
        *   Choose appropriate instance sizes/resource allocations for containers and databases.
    *   **Security:**
        *   Regularly update base Docker images and dependencies.
        *   Implement security best practices for cloud resources (e.g., least privilege IAM roles, security groups/firewall rules).
        *   Consider web application firewall (WAF) services.

This deployment setup provides a solid foundation for local development, automated CI/CD, and scalable cloud deployment, ensuring the Amazon Listing Optimizer can be reliably built, tested, and delivered.The `DEPLOYMENT_SETUP.md` file has been created successfully.

It includes:
1.  **Dockerization Details:**
    *   Explanation of `backend/Dockerfile` (Python/FastAPI with Uvicorn).
    *   Explanation of `frontend/Dockerfile` (multi-stage Node.js build with Nginx for serving).
    *   Explanation of `frontend/nginx.conf` for serving the React SPA.
2.  **`docker-compose.yml` Explanation:**
    *   Details on the `backend`, `frontend`, and optional `db` (PostgreSQL) services for local development.
    *   Covers build contexts, port mappings, volume mounts for live reloading (backend), environment file usage, and inter-service dependencies.
3.  **CI/CD Strategy Outline:**
    *   Suggests GitHub Actions as a tool.
    *   Outlines workflow triggers (push to main, PRs).
    *   Defines key stages: Lint & Test, Build Docker Images, Push to Container Registry, and Deploy (conceptual).
4.  **Cloud Deployment Strategy Outline:**
    *   Provides platform suggestions (AWS ECS/Elastic Beanstalk, Google Cloud Run/GKE, Azure Container Apps/AKS, PaaS like Heroku/Render).
    *   Lists key considerations: managed databases, networking (load balancers, VPCs, CDN), secrets management, logging & monitoring, scalability, and security.

All Docker-related files (`backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.yml`) were created in previous steps. This subtask focused on creating the comprehensive `DEPLOYMENT_SETUP.md` documentation. All requirements have been met.
