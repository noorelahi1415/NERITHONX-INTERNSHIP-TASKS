#!/bin/bash

# -----------------------------
# Gitea Volume Backup Script
# -----------------------------

# Volume Name
VOLUME_NAME="day03-task-gitea-postgres-deployment_gitea_data"

# Timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Directories
BACKUP_DIR="./backups"
LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/backup.log"

# Create directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Get volume mount point automatically
VOLUME_PATH=$(docker volume inspect "$VOLUME_NAME" --format '{{ .Mountpoint }}')

# Backup filename
BACKUP_FILE="$BACKUP_DIR/gitea_backup_$TIMESTAMP.tar.gz"

echo "=================================="
echo "Stopping Docker Compose..."
docker compose down

echo "Backing up volume..."

if sudo tar -czf "$BACKUP_FILE" -C "$VOLUME_PATH" .
then
    echo "$(date): Backup SUCCESS - $BACKUP_FILE" >> "$LOG_FILE"
    echo "Backup completed successfully."
else
    echo "$(date): Backup FAILED" >> "$LOG_FILE"
    echo "Backup failed."
fi

echo "Starting Docker Compose..."
docker compose up -d

echo "Done!"
