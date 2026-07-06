#!/bin/bash

# -----------------------------
# Gitea Volume Restore Script
# -----------------------------

if [ $# -ne 1 ]
then
    echo "Usage:"
    echo "./restore.sh backups/<backup-file>.tar.gz"
    exit 1
fi

VOLUME_NAME="day03-task-gitea-postgres-deployment_gitea_data"

BACKUP_FILE="$1"

VOLUME_PATH=$(docker volume inspect "$VOLUME_NAME" --format '{{ .Mountpoint }}')

echo "Stopping Docker Compose..."
docker compose down

echo "Removing old data..."

sudo rm -rf ${VOLUME_PATH:?}/*

echo "Restoring backup..."

sudo tar -xzf "$BACKUP_FILE" -C "$VOLUME_PATH"

echo "Starting Docker Compose..."

docker compose up -d

echo "Restore completed successfully."
