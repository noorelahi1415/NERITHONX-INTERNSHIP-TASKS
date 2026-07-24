# 🌍 WanderLust — Dockerized Travel Listing Platform with Nginx and TLS

<p align="center">
  <strong>A full-stack travel listing application containerized with Docker and secured behind an Nginx HTTPS reverse proxy.</strong>
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express.js-5-000000?logo=express&logoColor=white">
  <img alt="MongoDB Atlas" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white">
  <img alt="Nginx" src="https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639?logo=nginx&logoColor=white">
  <img alt="TLS" src="https://img.shields.io/badge/TLS-HTTPS-success">
</p>

---

## Overview

WanderLust is a full-stack travel accommodation platform where users can:

- Register, sign in, and sign out.
- Create, view, edit, and delete property listings.
- Upload listing images to Cloudinary.
- Store listings, users, reviews, sessions, and map coordinates in MongoDB Atlas.
- Convert locations into geographic coordinates with Mapbox geocoding.
- View listing locations on interactive maps.
- Add reviews and ratings.
- Search and filter listings by category.

The DevOps implementation adds:

- A production-ready Docker image.
- Docker Compose orchestration.
- Application health checks.
- Nginx as the only public entry point.
- HTTP-to-HTTPS redirection.
- TLS certificates for local HTTPS.
- WebSocket upgrade headers.
- Gzip compression.
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, and HSTS.

---

## Table of Contents

- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Application Readiness Changes](#application-readiness-changes)
- [Dockerfile](#dockerfile)
- [Docker Compose](#docker-compose)
- [Nginx Reverse Proxy](#nginx-reverse-proxy)
- [TLS Certificates](#tls-certificates)
- [Run the Project](#run-the-project)
- [Validation Tests](#validation-tests)
- [MongoDB Atlas, Cloudinary, and Mapbox](#mongodb-atlas-cloudinary-and-mapbox)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Useful Commands](#useful-commands)

---

## Architecture

```mermaid
flowchart LR
    U[User Browser] -->|HTTP :80| N[Nginx Container]
    U -->|HTTPS :443| N
    N -->|HTTP redirect to HTTPS| U
    N -->|Private Docker network\napp:8080| A[WanderLust Node.js Container]
    A --> M[(MongoDB Atlas)]
    A --> C[Cloudinary]
    A --> X[Mapbox APIs]
```

### Request flow

```text
Browser
   |
   | HTTP :80  -> 301 redirect
   | HTTPS :443
   v
Nginx
   |- TLS termination
   |- gzip compression
   |- security headers
   |- proxy headers
   |- WebSocket upgrade compatibility
   v
WanderLust app:8080
   |- MongoDB Atlas
   |- Cloudinary
   |- Mapbox
```

Only Nginx publishes ports to the host. The Node.js application remains private on the Docker network.

---

## Technology Stack

| Layer | Tools |
|---|---|
| Frontend | HTML, CSS, Bootstrap, JavaScript, EJS |
| Backend | Node.js, Express.js |
| Architecture | MVC |
| Database | MongoDB Atlas, Mongoose |
| Authentication | Passport.js, Passport Local, Express Session |
| Session Store | `connect-mongo` |
| Image Storage | Cloudinary |
| File Uploads | Multer, Multer Storage Cloudinary |
| Maps | Mapbox SDK and Mapbox GL |
| Validation | Joi |
| Containerization | Docker |
| Orchestration | Docker Compose |
| Reverse Proxy | Nginx |
| TLS | OpenSSL |

---

## Project Structure

```text
WanderLust/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── .npmrc
├── .env                 # private; never commit
├── .env.example         # safe template
├── app.js
├── package.json
├── package-lock.json
├── cloudConfig.js
├── middleware.js
├── schema.js
│
├── controllers/
│   ├── listings.js
│   ├── reviews.js
│   └── users.js
│
├── models/
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── routes/
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── views/
│   ├── includes/
│   ├── layouts/
│   ├── listings/
│   ├── users/
│   └── error.ejs
│
├── public/
│   ├── CSS/
│   ├── JS/
│   └── images/
│       └── placeholder.svg
│
├── scripts/
│   └── replace-invalid-listing-images.js
│
├── nginx/
│   ├── conf.d/
│   │   └── wanderlust.conf
│   └── certs/
│       ├── wanderlust.crt
│       ├── wanderlust.key
│       ├── wanderlust-local-ca.crt
│       └── wanderlust-local-ca.key
│
├── init/
│   ├── data.js
│   └── index.js
│
└── utils/
    ├── ExpressError.js
    └── wrapAsync.js
```

> `wanderlust-local-ca.key` and `wanderlust.key` are private keys. Never commit or share them.

---

## Prerequisites

Install the following tools:

- Git
- Docker Engine
- Docker Compose plugin
- OpenSSL
- A MongoDB Atlas account
- A Cloudinary account
- A Mapbox account

Verify local tools:

```bash
docker --version
docker compose version
openssl version
git --version
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=production
PORT=8080

ATLASDB_URL=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/wanderlust
SECRET=replace-with-a-long-random-session-secret

MAP_TOKEN=your-mapbox-access-token

CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
```

Generate a secure session secret:

```bash
openssl rand -base64 32
```

Create `.env.example` for contributors:

```env
NODE_ENV=production
PORT=8080
ATLASDB_URL=
SECRET=
MAP_TOKEN=
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
```

### Important

- Never commit `.env`.
- Never print secrets in screenshots or public logs.
- Add your current IP address to the MongoDB Atlas Network Access list.
- URL-encode special characters in MongoDB usernames or passwords.

---

## Application Readiness Changes

Before containerizing, the Node.js application was prepared for Docker and Nginx.

### 1. Production start script

In `package.json`:

```json
{
  "scripts": {
    "start": "node app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### 2. Environment-based port

In `app.js`:

```js
const PORT = process.env.PORT || 8080;
```

### 3. Listen on all container interfaces

```js
app.listen(PORT, "0.0.0.0", () => {
    console.log(`WanderLust is listening on port ${PORT}`);
});
```

### 4. Trust one reverse proxy

```js
app.set("trust proxy", 1);
```

This allows Express to correctly understand:

- The original HTTPS protocol.
- The original client IP.
- Secure cookies behind Nginx.

### 5. Health endpoint

```js
app.get("/health", (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;

    res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? "healthy" : "unhealthy",
        service: "wanderlust",
        database: databaseConnected ? "connected" : "disconnected",
    });
});
```

### 6. Secure session cookie

```js
cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
}
```

### 7. Start only after MongoDB connects

```js
async function startServer() {
    try {
        await mongoose.connect(process.env.ATLASDB_URL);
        console.log("Connected to MongoDB");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`WanderLust is listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Application startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
```

---

## Dockerfile

Create `Dockerfile` in the project root:

```dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

# Required because multer-storage-cloudinary@4 declares a Cloudinary v1 peer dependency,
# while this project uses the Cloudinary v2 SDK.
RUN npm ci --omit=dev --legacy-peer-deps

COPY --chown=node:node . .

ENV PORT=8080

EXPOSE 8080

USER node

HEALTHCHECK --interval=30s \
    --timeout=5s \
    --start-period=30s \
    --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/health || exit 1

CMD ["npm", "start"]
```

### `.dockerignore`

```dockerignore
node_modules
npm-debug.log*
.git
.gitignore
.env
Dockerfile
.dockerignore
docker-compose.yml
README.md
.DS_Store
Thumbs.db
nginx/certs
```

### `.npmrc`

The project may also include:

```ini
legacy-peer-deps=true
```

This keeps local and Docker dependency installation behavior consistent.

---

## Docker Compose

The main Compose setup uses the prebuilt image:

```text
noorum/wanderlust-app:latest
```

Create `docker-compose.yml`:

```yaml
name: wanderlust

services:
  app:
    image: noorum/wanderlust-app:latest
    pull_policy: never

    env_file:
      - .env

    expose:
      - "8080"

    restart: unless-stopped
    init: true

    networks:
      wanderlust-proxy-network:
        aliases:
          - app

  nginx:
    image: nginx:alpine

    depends_on:
      app:
        condition: service_healthy

    ports:
      - "80:80"
      - "443:443"

    volumes:
      - ./nginx/conf.d/wanderlust.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/certs/wanderlust.crt:/etc/nginx/certs/wanderlust.crt:ro
      - ./nginx/certs/wanderlust.key:/etc/nginx/certs/wanderlust.key:ro

    restart: unless-stopped

    networks:
      - wanderlust-proxy-network

networks:
  wanderlust-proxy-network:
    name: wanderlust-proxy-network
    driver: bridge
```

### Why MongoDB is not a Compose service

This project uses MongoDB Atlas:

```text
WanderLust container -> Internet -> MongoDB Atlas
```

Therefore, a local `mongo` service is not required. Adding one without changing `ATLASDB_URL` would create a second unused database.

### Build the image locally instead

Replace the app image section with:

```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile
  image: noorum/wanderlust-app:latest
```

Then run:

```bash
docker compose up -d --build
```

---

## Nginx Reverse Proxy

Create `nginx/conf.d/wanderlust.conf`:

```nginx
upstream wanderlust_backend {
    server app:8080;
    keepalive 16;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

# HTTP -> HTTPS
server {
    listen 80;
    listen [::]:80;

    server_name localhost 127.0.0.1;
    server_tokens off;

    return 301 https://$host$request_uri;
}

# HTTPS reverse proxy
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name localhost 127.0.0.1;
    server_tokens off;

    ssl_certificate     /etc/nginx/certs/wanderlust.crt;
    ssl_certificate_key /etc/nginx/certs/wanderlust.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    client_max_body_size 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=300" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_min_length 1024;
    gzip_comp_level 5;

    gzip_types
        text/plain
        text/css
        text/xml
        application/json
        application/javascript
        application/xml
        application/xml+rss
        image/svg+xml;

    location / {
        proxy_pass http://wanderlust_backend;

        proxy_http_version 1.1;
        proxy_redirect off;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # WebSocket upgrade compatibility
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
```

### WebSocket note

WanderLust currently does not run a WebSocket server. The upgrade headers are included for task compliance and future real-time features. No separate WebSocket port is required.

---

## TLS Certificates

Two local certificate approaches are supported.

### Option A — Quick self-signed certificate

This satisfies the Nginx TLS task but browsers will display `ERR_CERT_AUTHORITY_INVALID`.

```bash
mkdir -p nginx/certs

openssl req \
  -x509 \
  -nodes \
  -newkey rsa:2048 \
  -sha256 \
  -days 365 \
  -keyout nginx/certs/wanderlust.key \
  -out nginx/certs/wanderlust.crt \
  -subj "/C=PK/ST=Khyber Pakhtunkhwa/L=Peshawar/O=WanderLust/OU=DevOps/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
  -addext "keyUsage=digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=serverAuth"
```

### Option B — Local CA signed certificate

This removes the browser warning after the local CA is trusted.

#### 1. Create the local CA

```bash
openssl genrsa \
  -out nginx/certs/wanderlust-local-ca.key \
  4096

openssl req \
  -x509 \
  -new \
  -sha256 \
  -days 3650 \
  -key nginx/certs/wanderlust-local-ca.key \
  -out nginx/certs/wanderlust-local-ca.crt \
  -subj "/C=PK/ST=Khyber Pakhtunkhwa/L=Peshawar/O=WanderLust/OU=DevOps/CN=WanderLust Local CA" \
  -addext "basicConstraints=critical,CA:TRUE,pathlen:0" \
  -addext "keyUsage=critical,keyCertSign,cRLSign" \
  -addext "subjectKeyIdentifier=hash"
```

#### 2. Create the localhost key and CSR

```bash
openssl genrsa \
  -out nginx/certs/wanderlust.key \
  2048

openssl req \
  -new \
  -key nginx/certs/wanderlust.key \
  -out nginx/certs/wanderlust.csr \
  -subj "/C=PK/ST=Khyber Pakhtunkhwa/L=Peshawar/O=WanderLust/OU=DevOps/CN=localhost"
```

#### 3. Create the certificate extensions

```bash
cat > nginx/certs/localhost.ext <<'CERT'
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:localhost,IP:127.0.0.1
authorityKeyIdentifier=keyid,issuer
subjectKeyIdentifier=hash
CERT
```

#### 4. Sign the server certificate

```bash
openssl x509 \
  -req \
  -in nginx/certs/wanderlust.csr \
  -CA nginx/certs/wanderlust-local-ca.crt \
  -CAkey nginx/certs/wanderlust-local-ca.key \
  -CAcreateserial \
  -out nginx/certs/wanderlust.crt \
  -days 365 \
  -sha256 \
  -extfile nginx/certs/localhost.ext
```

#### 5. Local Docker permissions

```bash
chmod 755 nginx nginx/certs
chmod 644 nginx/certs/wanderlust.crt
chmod 644 nginx/certs/wanderlust.key
chmod 644 nginx/certs/wanderlust-local-ca.crt
chmod 600 nginx/certs/wanderlust-local-ca.key
```

> `644` on the server key is only a local-lab workaround for bind-mount permission issues. In production, use strict ownership, Docker secrets, or a managed certificate service.

#### 6. Trust the CA on Ubuntu

```bash
sudo cp nginx/certs/wanderlust-local-ca.crt \
  /usr/local/share/ca-certificates/wanderlust-local-ca.crt

sudo update-ca-certificates
```

#### 7. Trust the CA in Chrome/Chromium on Linux

Install the NSS tool:

```bash
sudo apt update
sudo apt install -y libnss3-tools
```

Close Chrome:

```bash
pkill -f 'google-chrome|chrome|chromium' || true
```

Select the NSS database:

```bash
if [ -d "$HOME/.pki/nssdb" ]; then
    NSSDB="$HOME/.pki/nssdb"
else
    NSSDB="$HOME/.local/share/pki/nssdb"
fi

mkdir -p "$NSSDB"

if [ ! -f "$NSSDB/cert9.db" ]; then
    certutil -d sql:"$NSSDB" -N --empty-password
fi
```

Import the CA certificate:

```bash
certutil \
  -d sql:"$NSSDB" \
  -A \
  -t "C,," \
  -n "WanderLust Local CA" \
  -i nginx/certs/wanderlust-local-ca.crt
```

Verify:

```bash
certutil -d sql:"$NSSDB" -L
```

Import only `wanderlust-local-ca.crt` as an authority. Do not import a `.key` file, and do not use the Personal Certificates section.

---

## Run the Project

### 1. Clone

```bash
git clone <YOUR_REPOSITORY_URL>
cd WanderLust-project-devops-impllimentation-main
```

Always run Compose commands from the directory containing `docker-compose.yml`.

### 2. Create `.env`

```bash
cp .env.example .env
nano .env
```

### 3. Confirm the prebuilt image exists

```bash
docker image inspect noorum/wanderlust-app:latest >/dev/null && \
echo "WanderLust image found"
```

To pull it when hosted publicly:

```bash
docker pull noorum/wanderlust-app:latest
```

When `pull_policy: never` is enabled, Compose requires the image to exist locally.

### 4. Validate Compose

```bash
docker compose config
docker compose config --services
```

Expected services:

```text
app
nginx
```

### 5. Start

```bash
docker compose up -d --force-recreate
```

### 6. Check status

```bash
docker compose ps
```

Expected result:

```text
app      Up (healthy)   8080/tcp
nginx    Up             0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 7. Open the application

```text
https://localhost/listings
```

---

## Validation Tests

### Application health

```bash
docker compose logs --tail=50 app
docker compose ps app
```

Expected logs:

```text
Connected to MongoDB
WanderLust is listening on port 8080
```

### Nginx syntax

```bash
docker compose exec nginx nginx -t
```

### Docker DNS

```bash
docker compose run --rm --no-deps nginx getent hosts app
```

### Nginx-to-app connectivity

```bash
docker compose run --rm --no-deps nginx \
  wget -qO- http://app:8080/health
```

### HTTP redirect

```bash
curl -I http://localhost
```

Expected:

```text
HTTP/1.1 301 Moved Permanently
Location: https://localhost/
```

### HTTPS

When using an untrusted self-signed certificate:

```bash
curl -kI https://localhost/listings
```

When the local CA is trusted:

```bash
curl -I https://localhost/listings
```

Expected:

```text
HTTP/1.1 200 OK
```

### Certificate subject and issuer

```bash
echo | openssl s_client \
  -connect localhost:443 \
  -servername localhost \
  2>/dev/null | \
openssl x509 -noout -subject -issuer
```

Expected:

```text
subject=... CN=localhost
issuer=... CN=WanderLust Local CA
```

### Certificate chain

```bash
openssl s_client \
  -connect localhost:443 \
  -servername localhost \
  -CAfile nginx/certs/wanderlust-local-ca.crt \
  </dev/null 2>/dev/null | \
grep "Verify return code"
```

Expected:

```text
Verify return code: 0 (ok)
```

### Security headers

```bash
curl -skI https://localhost/listings | \
grep -Ei "x-frame-options|x-content-type-options|strict-transport-security"
```

Expected:

```text
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=300
```

### Gzip

```bash
curl -sk \
  -H "Accept-Encoding: gzip" \
  -D - \
  https://localhost/listings \
  -o /dev/null | \
grep -Ei "content-encoding|vary"
```

Expected:

```text
Content-Encoding: gzip
Vary: Accept-Encoding
```

### Secure session cookie

```bash
curl -skI https://localhost/listings | grep -i set-cookie
```

Expected attributes:

```text
HttpOnly; Secure; SameSite=Lax
```

---

## MongoDB Atlas, Cloudinary, and Mapbox

### MongoDB Atlas

MongoDB stores:

- Users
- Listings
- Reviews
- Sessions
- Image URLs and filenames
- Map coordinates

The actual image file is not stored in MongoDB.

Check the active database name safely:

```bash
docker compose exec app node -e '
const mongoose = require("mongoose");
(async () => {
  await mongoose.connect(process.env.ATLASDB_URL);
  console.log("Database:", mongoose.connection.name);
  await mongoose.disconnect();
})().catch(console.error);
'
```

View data in Atlas:

```text
MongoDB Atlas -> Database -> Browse Collections -> wanderlust -> listings
```

### Cloudinary

Cloudinary stores the actual listing image. MongoDB stores the resulting delivery URL:

```json
{
  "image": {
    "url": "https://res.cloudinary.com/.../image/upload/...",
    "filename": "wanderlust_DEV/..."
  }
}
```

Correct `cloudConfig.js`:

```js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "wanderlust_DEV",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
});

module.exports = { cloudinary, storage };
```

Use Multer validation to reject PDFs, videos, and unsupported file types.

### Mapbox

Mapbox is used to:

1. Receive a location entered by the user.
2. Geocode it into longitude and latitude.
3. Store the coordinates as GeoJSON in MongoDB.
4. Render the listing location on an interactive map.

Example geometry:

```json
{
  "type": "Point",
  "coordinates": [71.5249, 34.0151]
}
```

GeoJSON uses this coordinate order:

```text
[longitude, latitude]
```

---

## Troubleshooting

### 1. `npm ERR! ERESOLVE could not resolve`

Example:

```text
multer-storage-cloudinary@4.0.0 requires cloudinary ^1.21.0
project uses cloudinary 2.x
```

Fix:

```dockerfile
RUN npm ci --omit=dev --legacy-peer-deps
```

Or add:

```ini
legacy-peer-deps=true
```

This is a compatibility workaround. Test Cloudinary uploads after installation.

---

### 2. Container is healthy but the site is unavailable

Check the host/container port mapping.

Correct temporary direct mapping:

```yaml
ports:
  - "8081:8080"
```

With Nginx, remove the app `ports` section and use:

```yaml
expose:
  - "8080"
```

---

### 3. `service "mongo" is not running`

The project uses MongoDB Atlas, not a local MongoDB Compose service.

Run database checks through the app container:

```bash
docker compose exec app node -e 'console.log(process.env.ATLASDB_URL ? "Mongo URL set" : "Missing")'
```

---

### 4. Listing exists but its image is broken

Inspect the MongoDB record. A PDF URL cannot render in an `<img>` tag.

Bad example:

```text
https://res.cloudinary.com/.../file.pdf
```

Fixes:

- Correct `allowed_formats` spelling.
- Add Multer MIME validation.
- Upload a JPG, PNG, or WEBP image.
- Add a local placeholder fallback.

---

### 5. `host not found in upstream "app:8080"`

Cause:

- Nginx and the app are on different networks.
- The app was started as a standalone container.
- The Compose service does not have the `app` alias.

Fix:

```yaml
networks:
  wanderlust-proxy-network:
    aliases:
      - app
```

Recreate the stack:

```bash
docker compose down --remove-orphans
docker rm -f wanderlust-app wanderlust-nginx 2>/dev/null || true
docker network rm wanderlust-proxy-network 2>/dev/null || true
docker compose up -d --force-recreate
```

Verify:

```bash
docker compose run --rm --no-deps nginx getent hosts app
```

---

### 6. `cannot load certificate key ... Permission denied`

For the local lab:

```bash
chmod 755 nginx nginx/certs
chmod 644 nginx/certs/wanderlust.key
chmod 644 nginx/certs/wanderlust.crt
```

Production alternatives:

- Docker secrets
- Read-only secret mounts with controlled ownership
- A cloud certificate manager
- Let’s Encrypt

---

### 7. Browser displays `ERR_CERT_AUTHORITY_INVALID`

This is expected for a directly self-signed server certificate.

Fix:

1. Create a local CA.
2. Sign the localhost certificate with it.
3. Trust `wanderlust-local-ca.crt` in Ubuntu and the browser.
4. Never import a `.key` file.

Verify the active certificate:

```bash
echo | openssl s_client -connect localhost:443 -servername localhost 2>/dev/null | \
openssl x509 -noout -subject -issuer
```

---

### 8. Chrome asks for a certificate password

You selected the wrong import area or file.

Correct file:

```text
nginx/certs/wanderlust-local-ca.crt
```

Import it as a trusted authority. Do not import:

```text
wanderlust.key
wanderlust-local-ca.key
wanderlust.crt
```

On Linux, use `certutil` as shown in the TLS section.

---

### 9. `no configuration file provided: not found`

You ran Compose from the wrong directory.

```bash
cd /path/to/WanderLust-project-devops-impllimentation-main
ls docker-compose.yml
docker compose config
```

---

### 10. Nginx is restarting

Inspect logs:

```bash
docker compose ps -a
docker compose logs --tail=100 nginx
```

Since `exec` cannot enter a restarting container, test with:

```bash
docker compose run --rm --no-deps nginx nginx -t
```

---

### 11. Nginx says the mounted config is read-only

Example:

```text
can not modify /etc/nginx/conf.d/default.conf (read-only file system?)
```

This is usually harmless because the file was intentionally mounted with `:ro`.

The fatal error, when present, appears on a later log line.

---

### 12. HTTPS seems to disappear in Chrome

Press:

```text
Ctrl + L
```

Chrome may hide the scheme in the shortened address display. Verify with:

```bash
curl -I https://localhost/listings
```

A red “Not secure” label means the certificate is untrusted, not that HTTPS is absent.

---

## Security Notes

- Do not commit `.env`.
- Do not commit private keys.
- Do not expose the Node.js app port when Nginx is enabled.
- Keep `NODE_ENV=production` for secure cookies behind HTTPS.
- Keep `app.set("trust proxy", 1)` when one trusted Nginx proxy is used.
- Use a short HSTS duration for local testing.
- Do not use `includeSubDomains` or `preload` on localhost.
- Replace local certificates with Let’s Encrypt or a managed certificate in production.
- Consider removing the `X-Powered-By` header:

```js
app.disable("x-powered-by");
```

- `X-Frame-Options` and `X-Content-Type-Options` are useful baseline headers. A production deployment should also consider a carefully tested Content Security Policy.

### `.gitignore`

```gitignore
.env
node_modules/
npm-debug.log*
.DS_Store
Thumbs.db
nginx/certs/*.key
nginx/certs/*.csr
nginx/certs/*.srl
nginx/certs/*.ext
```

A public CA certificate may be committed if desired, but private keys must never be committed.

---

## Useful Commands

### Start

```bash
docker compose up -d
```

### Start and recreate

```bash
docker compose up -d --force-recreate
```

### Build from source

```bash
docker compose up -d --build
```

### Status

```bash
docker compose ps
```

### Logs

```bash
docker compose logs -f app
docker compose logs -f nginx
```

### Stop

```bash
docker compose down
```

Avoid this unless you intentionally want to delete volumes:

```bash
docker compose down -v
```

### Validate Nginx and reload

```bash
docker compose exec nginx nginx -t && \
docker compose exec nginx nginx -s reload
```

### Inspect Docker network

```bash
docker network inspect wanderlust-proxy-network
```

### Check images

```bash
docker images | grep wanderlust
```

### Check active services

```bash
docker compose config --services
```

---

## Completion Checklist

- [x] Node.js application containerized
- [x] Production start command added
- [x] Environment-based port configuration
- [x] MongoDB Atlas connected
- [x] Cloudinary image upload configured
- [x] Mapbox geocoding and map rendering configured
- [x] Authentication and MongoDB session store configured
- [x] Docker health check added
- [x] Docker Compose network configured
- [x] Existing Docker image supported
- [x] Nginx reverse proxy added
- [x] HTTP redirected to HTTPS
- [x] TLS certificate configured
- [x] Local CA trust workflow documented
- [x] WebSocket upgrade headers configured
- [x] Gzip enabled
- [x] `X-Frame-Options` configured
- [x] `X-Content-Type-Options` configured
- [x] HSTS configured
- [x] Common deployment issues documented

---

## Final URLs

```text
HTTP redirect:     http://localhost
Secure home:       https://localhost
Listings:          https://localhost/listings
Health endpoint:   https://localhost/health
```

---

## Author

**Noor Elahi**  
DevOps and Full-Stack Engineering Learner

---

## License

This project is provided for learning and portfolio purposes. Add a formal license file before distributing or accepting external contributions.
