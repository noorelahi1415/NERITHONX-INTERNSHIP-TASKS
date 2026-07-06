# Day 04 — Backing Up and Restoring Gitea (Simple Guide)

**Project:** NERITHONX Internship — Week 1, Day 4
**Tools:** Bash, Docker, Docker Compose, tar

---

## What This Guide Is About

We're running Gitea (our own private GitHub) inside Docker. Today's job is simple to say, but important to get right:

> Write a script that backs up Gitea's data. Write another script that restores it. Then prove it actually works by deleting everything and bringing it back.

This guide explains everything in plain language — what each thing is, why we do it, and what could go wrong. No assumed knowledge.

---

## Table of Contents

1. [Why Do We Even Need Backups?](#1-why-do-we-even-need-backups)
2. [What Is a Docker Volume?](#2-what-is-a-docker-volume)
3. [Finding Our Gitea Volume](#3-finding-our-gitea-volume)
4. [What Is `tar` and Why Use It?](#4-what-is-tar-and-why-use-it)
5. [The Backup Script — `backup.sh`](#5-the-backup-script--backupsh)
6. [The Restore Script — `restore.sh`](#6-the-restore-script--restoresh)
7. [Testing It: Backup → Delete → Restore](#7-testing-it-backup--delete--restore)
8. [Common Problems and Fixes](#8-common-problems-and-fixes)
9. [What We Learned](#9-what-we-learned)

---

## 1. Why Do We Even Need Backups?

Think of it like this: your Gitea server holds every repository, every user account, every SSH key anyone has added. If that data disappears — a mistake, a crashed disk, an accidental `rm -rf` — it's all gone. Not "hard to get back." Gone.

A backup is just a copy of that data, saved somewhere safe, taken at a specific point in time. If something breaks, you go back to that copy instead of starting from zero.

**But here's the part people skip:** a backup you've never actually tested isn't a real backup. It's a guess. Plenty of companies have discovered — during a real emergency — that their "backup" was empty, broken, or didn't match what they thought it was. That's why this task doesn't stop at writing the scripts. It makes you delete real data and prove the restore works.

---

## 2. What Is a Docker Volume?

Normally, anything a Docker container writes disappears the moment you delete that container. A **volume** is Docker's way of keeping data safe outside the container, so you can delete and recreate the container as many times as you want, and the data stays put.

Our `docker-compose.yml` has this:

```yaml
volumes:
  gitea_data:
  postgres_data:
```

Simple names. But Docker doesn't use these names directly on your disk — it adds your project folder name in front. So if your folder is called `day03-task-gitea-postgres-deployment`, Docker actually creates:

```
day03-task-gitea-postgres-deployment_gitea_data
day03-task-gitea-postgres-deployment_postgres_data
```

That's why the first thing we do is ask Docker directly what the real name is, instead of guessing.

---

## 3. Finding Our Gitea Volume

Run this to see all your volumes:

```bash
docker volume ls
```

You'll see something like:

```
DRIVER    VOLUME NAME
local     day03-task-gitea-postgres-deployment_gitea_data
local     day03-task-gitea-postgres-deployment_postgres_data
```

Now find out exactly where that volume lives on your computer:

```bash
docker volume inspect day03-task-gitea-postgres-deployment_gitea_data
```

You'll get something like:

```
"Mountpoint": "/var/lib/docker/volumes/day03-task-gitea-postgres-deployment_gitea_data/_data"
```

That path is where all of Gitea's real files actually sit. That's what we're going to back up.

**Good habit:** instead of typing this path by hand into our script (and getting it wrong if we ever move to a new machine), we'll have the script ask Docker for this path automatically, every time. More on that below.

---

## 4. What Is `tar` and Why Use It?

`tar` is a simple Linux tool that takes a bunch of files and folders and squashes them into one single file. Add compression, and that file also gets smaller.

```bash
tar -czf backup.tar.gz -C /path/to/data .
```

Here's what each part means:

| Part | Meaning |
|---|---|
| `c` | Create a new archive |
| `z` | Compress it (gzip) |
| `f backup.tar.gz` | Save it with this filename |
| `-C /path/to/data` | Go into this folder first |
| `.` | Grab everything in that folder |

**Why `-C` matters:** it makes the paths inside the backup *relative* instead of the full computer path. That way, when you restore the backup later — maybe onto a different volume, or a different machine — it just drops the files where you tell it to, instead of trying to recreate some exact original path that might not exist anymore.

To pull the files back out later, it's the same idea in reverse:

```bash
tar -xzf backup.tar.gz -C /path/to/restore
```

`x` means extract instead of create. Everything else works the same way.

---

## 5. The Backup Script — `backup.sh`

### What it needs to do

1. Stop Gitea (so nothing is being written while we copy it)
2. Find out where the volume actually lives
3. Compress it into a file with today's date/time in the name
4. Write down whether it worked or not
5. Start Gitea back up

### The script

```bash
#!/bin/bash

# Name of our Gitea volume
VOLUME_NAME="day03-task-gitea-postgres-deployment_gitea_data"

# Today's date and time, used in the filename
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Where backups and logs go
BACKUP_DIR="./backups"
LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/backup.log"

mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Ask Docker where the volume really lives — don't guess
VOLUME_PATH=$(docker volume inspect "$VOLUME_NAME" --format '{{ .Mountpoint }}')

BACKUP_FILE="$BACKUP_DIR/gitea_backup_$TIMESTAMP.tar.gz"

echo "Stopping Gitea..."
docker compose down

echo "Backing up data..."
if sudo tar -czf "$BACKUP_FILE" -C "$VOLUME_PATH" .
then
    echo "$(date): Backup SUCCESS - $BACKUP_FILE" >> "$LOG_FILE"
    echo "Backup done."
else
    echo "$(date): Backup FAILED" >> "$LOG_FILE"
    echo "Backup failed."
fi

echo "Starting Gitea again..."
docker compose up -d

echo "All done!"
```

### Why each part matters (in plain words)

- **`TIMESTAMP`** — so every backup gets its own unique name, and you never accidentally overwrite an older one.
- **`VOLUME_PATH=$(docker volume inspect ...)`** — instead of typing the path ourselves and risking a typo (or the path being different on another machine), we let Docker tell us. This is the single best habit in this whole script.
- **`docker compose down` before backing up** — Gitea has to be fully stopped first. If we copied the files while Gitea was still running and writing to them, we might grab a file mid-write and end up with a broken backup. Stopping first guarantees a clean, complete copy.
- **`if ... then ... else`** — checks whether `tar` actually succeeded, instead of just assuming it did. If it fails, we want to know.
- **Logging with `>>`** — every attempt, success or fail, gets written down with a timestamp. If something goes wrong overnight and nobody's watching, the log tells the story later.

---

## 6. The Restore Script — `restore.sh`

### What it needs to do

1. Take a backup filename as input
2. Stop Gitea
3. Delete whatever's currently in the volume
4. Unpack the backup into that now-empty spot
5. Start Gitea back up

### The script

```bash
#!/bin/bash

if [ $# -ne 1 ]
then
    echo "Usage: ./restore.sh backups/<backup-file>.tar.gz"
    exit 1
fi

VOLUME_NAME="day03-task-gitea-postgres-deployment_gitea_data"
BACKUP_FILE="$1"

VOLUME_PATH=$(docker volume inspect "$VOLUME_NAME" --format '{{ .Mountpoint }}')

echo "Stopping Gitea..."
docker compose down

echo "Removing old data..."
sudo rm -rf "${VOLUME_PATH:?}"/*

echo "Restoring backup..."
sudo tar -xzf "$BACKUP_FILE" -C "$VOLUME_PATH"

echo "Starting Gitea again..."
docker compose up -d

echo "Restore complete."
```

### Why each part matters

- **`if [ $# -ne 1 ]`** — makes sure you actually gave the script a backup file to use. If you forgot, it stops and tells you, instead of doing something wrong silently.
- **`"${VOLUME_PATH:?}"`** — this is the most important safety net in the whole project. If `VOLUME_PATH` were ever accidentally empty, the line `rm -rf "$VOLUME_PATH"/*` would quietly become `rm -rf /*` — which deletes your *entire computer's* files, not just the volume. Adding `:?` tells Bash: "if this variable is empty, stop immediately with an error instead of running the command." Always use this trick before any `rm -rf` that depends on a variable.
- **Deleting before restoring** — we can't just dump new files on top of old ones; leftover files from before could conflict with the restored ones. Clearing the folder first keeps things clean.

---

## 7. Testing It: Backup → Delete → Restore

This is the part that actually proves everything works. Don't skip it.

**Step 1 — Make a backup**
```bash
chmod +x backup.sh restore.sh
./backup.sh
```

**Step 2 — Check it's really there**
```bash
ls backups
```

**Step 3 — Pretend disaster strikes: delete everything**
```bash
docker compose down
sudo rm -rf /var/lib/docker/volumes/day03-task-gitea-postgres-deployment_gitea_data/_data/*
```

**Step 4 — Confirm it's actually gone**
```bash
sudo ls /var/lib/docker/volumes/day03-task-gitea-postgres-deployment_gitea_data/_data
```
Nothing should print out. Empty folder.

**Step 5 — Bring it back**
```bash
./restore.sh backups/gitea_backup_<your-timestamp>.tar.gz
```

**Step 6 — Check everything's really back**
```bash
docker compose ps
```
Then open `http://localhost:3000` in your browser. Your repos, your admin login, everything should be exactly as it was.

If all of that works, your backup system is proven, not just assumed.

---

## 8. Common Problems and Fixes

| Problem | Why it happens | Fix |
|---|---|---|
| "No such volume" error | The volume name in the script doesn't match the real one | Run `docker volume ls` and copy the exact name shown |
| Backup file is tiny (a few KB) | Something went wrong finding the volume path | Run `docker volume inspect` yourself and check the Mountpoint looks right |
| "Permission denied" during backup | Docker's files are owned by a different user than you | That's why we use `sudo` — it's expected, not a bug |
| Restore says "Usage: ./restore.sh ..." even though you gave a file | Typo in the path, or running from the wrong folder | Use the path exactly as it appears in `ls backups`, e.g. `backups/gitea_backup_....tar.gz` |
| Gitea looks broken after restore | Containers started before the restore fully finished | Run `docker compose down`, check the files are really there with `ls`, then `docker compose up -d` again |

---

## 9. What We Learned

- Docker volumes keep your data safe even when containers get deleted — but you have to know where they really live.
- Never guess a file path — ask the tool (`docker volume inspect`) instead of hardcoding it.
- Always stop an app before backing up its data, so you don't grab a half-written file.
- A backup script should tell you clearly if it failed — don't just assume success.
- Before deleting anything with a variable in the path, guard it with `${VAR:?}` so an empty variable can never turn into a disaster.
- A backup is only real once you've actually tested it by deleting data and restoring it successfully.

---

*End of guide.*
