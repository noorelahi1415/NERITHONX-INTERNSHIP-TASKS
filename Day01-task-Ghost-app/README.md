# Ghost CMS — Dockerized Deployment (Ghost 5 + MySQL 8)

A production-style, containerized deployment of **Ghost CMS** running on a custom hardened Docker image, orchestrated with **Docker Compose** alongside a **MySQL 8** database service.

This project demonstrates a self-contained, reproducible Ghost environment suitable for local development, staging, or as a foundation for a production deployment on AWS (ECS/ECR).

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Deployment](#setup--deployment)
- [SMTP Configuration](#smtp-configuration)
- [Verifying the Deployment](#verifying-the-deployment)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)
- [Notes on Production Readiness](#notes-on-production-readiness)
- [Troubleshooting](#troubleshooting)

---

## Features

- Custom Dockerfile extending the official `ghost:5` image
- Non-root container execution (`USER node`) for security hardening
- Built-in `HEALTHCHECK` with startup grace period to prevent false-negative health states
- MySQL 8 as the production-grade database backend
- SMTP-enabled transactional email (member signup, invites, password reset)
- Environment-based configuration via `.env` — no secrets committed to source control
- Single-command deployment using Docker Compose

---

## Project Structure

```
.
├── Dockerfile                   # Custom Ghost 5 image definition
├── docker-compose.yml           # Ghost + MySQL service orchestration
├── config.production.json       # Ghost production configuration (DB, SMTP, server settings)
├── .env.example                 # Template for required environment variables
├── .gitignore                   # Excludes secrets, logs, and local data from version control
└── ghost-cms-docker-implementation-report.md   # Detailed implementation write-up
```

---

## Prerequisites

Before deploying, ensure the following are installed on your machine:

| Tool | Minimum Version | Purpose |
|---|---|---|
| [Docker](https://docs.docker.com/get-docker/) | 24.x+ | Container runtime |
| [Docker Compose](https://docs.docker.com/compose/install/) | v2.x+ | Multi-container orchestration |
| Git | any recent | Cloning the repository |

---

## Setup & Deployment

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <repo-name>
```

### 2. Create your environment file

Copy the provided template and fill in your own values:

```bash
cp .env.example .env
```

Edit `.env` and set the required Ghost, MySQL, and SMTP credentials (see [Environment Variables](#environment-variables) below).

> **Note:** `.env` is excluded from version control via `.gitignore` — never commit real credentials.

### 3. Build the custom Ghost image

```bash
docker build -t <your-dockerhub-username>/ghost-custom:5 .
```

### 4. Start the stack

```bash
docker compose up -d
```

This will pull/build the Ghost and MySQL images, create the required network and volumes, and start both containers in detached mode.

### 5. Access Ghost

Once both containers report a healthy status, open:

```
http://localhost:2368
```

Ghost's admin panel is available at:

```
http://localhost:2368/ghost
```

---

## SMTP Configuration

Ghost requires a working SMTP transport to send transactional emails — member signup confirmations, staff invitations, and password reset links. Without this configured, these flows will silently fail even though the app runs correctly.

SMTP is configured in `config.production.json` under the `mail` block, with credentials pulled from environment variables rather than hardcoded:

```json
"mail": {
  "transport": "SMTP",
  "options": {
    "service": "Mailgun",
    "host": "smtp.mailgun.org",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "${MAIL_USER}",
      "pass": "${MAIL_PASS}"
    }
  }
}
```

Corresponding variables in `.env`:

```env
MAIL_USER=your-smtp-username
MAIL_PASS=your-smtp-password
```

Any standard SMTP provider works (Mailgun, SendGrid, Postmark, or **AWS SES** for a production deployment). Swap the `service` and `host` values accordingly.

**To verify SMTP is working:** create a test member sign-up on the Ghost site and confirm the confirmation email is received.

---

## Verifying the Deployment

Check that both containers are running and healthy:

```bash
docker compose ps
```

Expected output should show both services as `Up` and Ghost as `(healthy)`.

Check container logs if something looks off:

```bash
docker compose logs ghost
docker compose logs mysql
```

Confirm database connectivity from the Ghost container:

```bash
docker compose exec ghost curl -I http://localhost:2368
```

A `200 OK` response confirms Ghost is serving traffic and connected to MySQL.

---

## Environment Variables

All required variables are documented in `.env.example`. At minimum, you'll need:

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL service hostname (matches Compose service name) |
| `DB_NAME` | Ghost database name |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `MAIL_USER` | SMTP username |
| `MAIL_PASS` | SMTP password |

---

## Health Checks

The custom Dockerfile defines a `HEALTHCHECK` with a `30s` start period, giving Ghost enough time to complete its boot sequence before health status is evaluated. This prevents Docker from reporting a false `unhealthy` state during normal startup — the same principle used when configuring health checks for **AWS ECS task definitions** in production.

---

## Notes on Production Readiness

This setup is designed to map cleanly onto a production AWS deployment:

| Local Component | AWS Production Equivalent |
|---|---|
| Docker Compose | ECS Task Definitions / Services |
| Docker Hub image | Amazon ECR (Elastic Container Registry) |
| `.env` file | AWS Secrets Manager / Parameter Store |
| Docker volume (MySQL data) | Amazon RDS / EBS-backed persistent storage |
| Local health check | ECS container health checks |

---

## Troubleshooting

**Ghost container shows `unhealthy`:**
Check logs with `docker compose logs ghost` — most commonly a database connection issue or the health check firing before Ghost finished booting.

**Cannot connect to MySQL:**
Confirm `DB_HOST` in `.env` matches the MySQL service name defined in `docker-compose.yml`, not `localhost`.

**Emails not sending:**
Verify SMTP credentials in `.env` are correct and that the SMTP provider's port (usually `587` or `465`) isn't blocked by your network/firewall.

---

## Author

Noor — DevOps Engineer
