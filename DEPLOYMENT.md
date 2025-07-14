# Hassio Kohbo - Docker Deployment Guide

This guide will help you deploy the Hassio Kohbo dashboard as a Docker container on your VM.

## Prerequisites

- Docker and Docker Compose installed on your VM
- Git installed on your VM  
- User added to docker group: `usermod -aG docker $USER` (then logout/login)
- Your repository pushed to GitHub
- Caddy set up for reverse proxy

## Quick Deployment

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hassio-kohbo.git
cd hassio-kohbo
```

### 2. Create Environment File

On your VM, create a `.env.production` file with your Home Assistant secrets:

```bash
# Create the environment file
nano ~/hassio-kohbo/.env.production
```

Add your Home Assistant configuration:
```bash
# Your Home Assistant URL (include http:// or https://)
REACT_APP_HASS_URL=http://your-home-assistant-ip:8123

# Your Home Assistant Long-Lived Access Token
REACT_APP_HASS_TOKEN=your-long-lived-access-token-here
```

**How to get your Home Assistant token:**
1. Open Home Assistant web interface
2. Go to Profile (click your user icon)
3. Go to Security tab
4. Create a "Long-Lived Access Token"
5. Copy the token to your `.env.production` file

### 3. Update Configuration

Edit the following files with your specific settings:

**docker-compose.yml:**
```yaml
ports:
  - "3001:80"  # Change port if needed
labels:
  - "caddy=your-domain.com"  # Replace with your domain
```

**deploy.sh:**
```bash
REPO_URL="https://github.com/your-username/hassio-kohbo.git"  # Your repo URL
```

### 4. Deploy

Run the deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually with Docker Compose:
```bash
docker compose up -d --build
```

## Caddy Configuration

Add this to your Caddyfile for reverse proxy:

```caddy
your-domain.com {
    reverse_proxy localhost:3001
}
```

Or if using docker labels with Caddy:
```caddy
# Caddy will automatically pick up the labels from docker-compose.yml
```

## Container Management

### View logs
```bash
docker logs hassio-kohbo-app
```

### Stop container
```bash
docker stop hassio-kohbo-app
```

### Restart container
```bash
docker restart hassio-kohbo-app
```

### Update deployment
```bash
./deploy.sh
```

### Remove everything
```bash
docker-compose down --rmi all --volumes
```

## Environment Variables

You can customize the deployment by setting these in `docker-compose.yml`:

- `NODE_ENV`: Set to `production` for production builds
- Custom environment variables for your Home Assistant setup

## File Structure

```
hassio-kohbo/
├── Dockerfile              # Multi-stage build configuration
├── docker-compose.yml      # Container orchestration
├── nginx.conf             # Nginx web server configuration  
├── .dockerignore          # Files to exclude from Docker build
├── deploy.sh              # Automated deployment script
└── DEPLOYMENT.md          # This file
```

## Troubleshooting

### Container won't start
```bash
docker logs hassio-kohbo-app
```

### Build fails
```bash
docker-compose build --no-cache
```

### Port conflicts
Change the port in `docker-compose.yml`:
```yaml
ports:
  - "3002:80"  # Use different port
```

### Memory issues during build
Add memory limits to docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      memory: 1G
```

### Docker permission denied
If you get "permission denied" errors:
```bash
# Add user to docker group
usermod -aG docker $USER
# Then logout and login again, or:
newgrp docker
```

## Security Considerations

- The nginx configuration includes security headers
- Consider using HTTPS with Caddy (automatic with domain)
- Keep Docker and base images updated
- Use non-root user in container if needed

## Performance Optimization

The Docker setup includes:
- Multi-stage builds for smaller images
- Gzip compression in nginx
- Static asset caching
- Health checks for reliability 