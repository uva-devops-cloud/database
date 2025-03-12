# StudentPortal Database

This repository contains database schema and migrations for the StudentPortal application.

## Local Development

### Prerequisites
- Docker and Docker Compose
- Flyway CLI (optional, can use Docker version)

### Testing Locally
```bash
# Start the database
docker-compose up -d

# Run migrations
./scripts/test-locally.sh