# Day 04 – Repository Mirroring in Gitea

## Objective

The objective of this task is to understand and configure **Repository Mirroring** in Gitea by creating a mirror of a public GitHub repository. This task also helps in understanding the difference between **Pull Mirror** and **Push Mirror**, along with their practical use cases.

---

## Environment

* Operating System: Ubuntu 25.xx
* Version Control System: Git
* Git Server: Gitea
* Source Repository: GitHub

---

## Repository Used

Public GitHub Repository:

```text
https://github.com/traefik/traefik.git
```

---

## Work Completed

### Step 1: Created Day 04 Task Directory

Created a dedicated directory for the Day 04 internship task.

```bash
mkdir Day04-repository-mirroring
cd Day04-repository-mirroring
```

---

### Step 2: Initialized Git Repository

Initialized the project as a Git repository.

```bash
git init
```

---

### Step 3: Created Documentation

Created a README file to document the task progress and learning.

```bash
touch README.md
```

---

### Step 4: Connected the Local Repository to GitHub

Configured the remote GitHub repository.

```bash
git remote add origin <your-github-repository-url>
```

---

### Step 5: Committed and Pushed the Project

Added the project files, created the initial commit, and pushed them to GitHub.

```bash
git add .
git commit -m "Day 04 - Initial repository setup"
git branch -M main
git push -u origin main
```

---

## Learning Objectives

During this task, I learned the following concepts:

* What Gitea is and why organizations use it.
* The purpose of repository mirroring.
* The difference between Pull Mirror and Push Mirror.
* How GitHub repositories can be synchronized with Gitea.
* How repository synchronization works automatically based on a configured interval.

---

## Pull Mirror

A Pull Mirror allows Gitea to periodically fetch changes from another Git repository.

**Flow:**

```text
GitHub
   │
   ▼
Gitea
```

### Use Cases

* Keeping an internal copy of an open-source project.
* Maintaining backups of external repositories.
* Synchronizing repositories for internal development.

---

## Push Mirror

A Push Mirror automatically sends changes from Gitea to another Git repository whenever new commits are pushed.

**Flow:**

```text
Gitea
   │
   ▼
GitHub
```

### Use Cases

* Maintaining backups.
* Publishing internal repositories to GitHub.
* Synchronizing repositories across multiple Git servers.

---

## Current Progress

* Day 04 project directory created.
* Local Git repository initialized.
* Project pushed to GitHub.
* Studied the concepts of Gitea, Pull Mirror, and Push Mirror.
* Identified the public repository that will be mirrored in Gitea.

---

## Next Steps

The remaining work includes:

1. Configure a Pull Mirror in Gitea.
2. Set the synchronization interval to **1 hour**.
3. Perform a manual synchronization.
4. Verify that the branches in Gitea match the branches in the GitHub repository.
5. Capture screenshots and document the complete implementation.
