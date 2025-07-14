#!/bin/bash

# Hassio Kohbo Deployment Script
# This script pulls the latest code from GitHub and deploys the Docker container

set -e  # Exit on any error

# Configuration
REPO_URL="https://github.com/johnkoht/hassio-kohbo.git" 
DEPLOY_DIR="$HOME/hassio-kohbo"
CONTAINER_NAME="hassio-kohbo-app"
ENV_FILE=".env.production"

echo "🚀 Starting deployment of Hassio Kohbo..."

# Check if environment file exists
if [ ! -f "$DEPLOY_DIR/$ENV_FILE" ]; then
    echo "❌ Missing environment file: $DEPLOY_DIR/$ENV_FILE"
    echo "📋 Please create it with your Home Assistant configuration:"
    echo "   REACT_APP_HASS_URL=http://your-ha-ip:8123"
    echo "   REACT_APP_HASS_TOKEN=your-token-here"
    echo "💡 See env.production.example for reference"
    exit 1
fi

echo "✅ Environment file found: $ENV_FILE"

# Create deployment directory if it doesn't exist
mkdir -p $DEPLOY_DIR

# Navigate to deployment directory
cd $DEPLOY_DIR

# Check if git repo exists
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes from GitHub..."
    git pull origin master
else
    echo "📥 Cloning repository from GitHub..."
    git clone $REPO_URL .
fi

# Stop existing container if running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "🛑 Stopping existing container..."
    docker stop $CONTAINER_NAME
fi

# Remove existing container if it exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🗑️  Removing existing container..."
    docker rm $CONTAINER_NAME
fi

# Build and start new container
echo "🔨 Building and starting new container..."
docker compose --env-file $ENV_FILE up -d --build

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
sleep 5

# Configure runtime settings
echo "🔧 Configuring runtime settings..."
source $ENV_FILE
docker exec $CONTAINER_NAME sed -i "s|HASS_URL_PLACEHOLDER|$REACT_APP_HASS_URL|g" /usr/share/nginx/html/config.js
docker exec $CONTAINER_NAME sed -i "s|HASS_TOKEN_PLACEHOLDER|$REACT_APP_HASS_TOKEN|g" /usr/share/nginx/html/config.js

# Wait for container to be healthy
echo "⏳ Waiting for container to be ready..."
sleep 10

# Check if container is running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "✅ Deployment successful! Container is running."
    echo "🌐 App is available at http://localhost:3001"
    echo "📊 Container status:"
    docker ps -f name=$CONTAINER_NAME
else
    echo "❌ Deployment failed! Container is not running."
    echo "📋 Checking logs..."
    docker logs $CONTAINER_NAME
    exit 1
fi

# Clean up old images (optional)
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo "🎉 Deployment complete!" 