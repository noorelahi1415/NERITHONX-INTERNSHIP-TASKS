# Day 04 – Gitea Volume Backup & Restore

## Overview

This project demonstrates how to implement an automated **backup and restore solution** for a Gitea deployment running with Docker Compose. The solution is built using **Bash**, **Docker Compose**, and the **tar** utility to automate the backup, restoration, and verification of persistent Docker volume data.

The implementation focuses on protecting the Gitea data volume by creating timestamped backup archives, recording backup operations in log files, and restoring the application when data loss occurs.

---

## Objectives

This project covers the following tasks:

* Create a Bash backup script (`backup.sh`).
* Stop the running Gitea environment before taking a backup.
* Archive the Gitea Docker volume with a timestamp.
* Restart the application automatically after backup.
* Log backup success and failure events.
* Create a Bash restore script (`restore.sh`).
* Restore data from any selected backup archive.
* Test a complete **Backup → Wipe → Restore** disaster recovery cycle.

---

## Technologies Used

* Bash
* Docker Compose
* Docker Named Volumes
* tar
* Linux Shell

---

## Repository Structure

```text
day03-task-gitea-postgres-deployment/
│
├── docker-compose.yml
├── .env
├── backup.sh
├── restore.sh
├── backups/
├── logs/
├── README.md
└── docs/
    └── Day04_Gitea_Volume_Backup_Restore_Guide.md
```

---

## Documentation

The complete implementation guide is available in:

**`docs/Day04_Gitea_Volume_Backup_Restore_Guide.md`**

This document explains the project from beginner to advanced level, including:

* Project overview
* Backup and disaster recovery concepts
* Docker volumes explained
* Bash scripting concepts
* Step-by-step implementation
* Explanation of every command
* Explanation of every script
* Why each step is performed
* Testing methodology
* Troubleshooting
* DevOps best practices
* Learning outcomes

The guide is written so that someone with no previous experience can understand the concepts and reproduce the complete implementation independently.

---

## Learning Outcome

After completing this project, you will understand how to:

* Work with Docker named volumes.
* Create automated backup scripts using Bash.
* Restore application data safely.
* Use `tar` for archive creation and extraction.
* Automate operational tasks using shell scripting.
* Perform disaster recovery testing.
* Apply backup and restore strategies commonly used in DevOps environments.
