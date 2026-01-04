# ANTEREON API

Cybersecurity intelligence platform for analysts, that centralizes and automates IOC (Indicators of Compromise) research from multiple threat intelligence providers, such as VirusTotal, AbuseIPDB and AlienVault OTX.

## Features

- **BYOA Model**: Bring Your Own API Key - secure AES-256-GCM encrypted storage
- **Multi-Provider**: VirusTotal, AbuseIPDB, AlienVault OTX
- **Parallel Queries**: Simultaneous API calls for faster results
- **JWT Authentication**: Secure access and refresh tokens
- **IOC Analysis**: IPs, domains, hashes, and URLs
- **Enterprise Security**: AES-256-GCM encryption for API key protection

## Tech Stack

- NestJS (Node.js + TypeScript)
- PostgreSQL + TypeORM
- JWT Authentication
- AES-256-GCM Encryption (Node.js Crypto)
- Secure API key storage and management

## Quick Start

### Prerequisites

- Node.js v22.17.0
- PostgreSQL 13+
- Docker Desktop

### Setup

1. **Configure Environment Variables**

   ```bash
   cp .env.example .env
   ```

2. **Ensure Port 5433 is Free**

   - Stop any local PostgreSQL service to avoid conflicts with Docker.

3. **Start Infrastructure**

   ```bash
   docker-compose up -d
   ```

4. **Install Dependencies**

   ```bash
   yarn install --frozen-lockfile
   ```

5. **Run Development Server**
   ```bash
   yarn start:dev
   ```

## Development

```bash
# Development
yarn start:dev

# Tests
yarn test

# Build
yarn build

```

## Documentation

Swagger API docs available at: `http://localhost:3000/api/docs`
