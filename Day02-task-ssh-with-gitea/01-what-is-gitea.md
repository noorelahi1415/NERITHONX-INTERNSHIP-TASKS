# What is Gitea

Gitea is a lightweight, self-hostable Git service — similar to GitHub or GitLab, but designed to run on minimal resources (even a Raspberry Pi). It provides repository hosting, issue tracking, pull requests, CI integration, and user/team management, without depending on a third-party cloud provider.

## Purpose

Gitea exists for teams and individuals who want full control over their Git infrastructure — source code, history, and access — without relying on an external SaaS platform.

## Use Cases

- **Self-hosted internal Git server:** Companies host their own Gitea instance instead of using GitHub/GitLab, keeping source code fully on internal infrastructure.
- **Air-gapped / restricted environments:** Organizations with strict compliance or network isolation requirements (e.g. government, defense, finance) that cannot use public cloud Git hosting.
- **Lightweight CI/CD source of truth:** Paired with Gitea Actions or external CI runners for build/deploy pipelines.
- **Learning and internal DevOps practice:** Running Gitea locally (via Docker) to practice Git server administration, SSH-based access control, and repository management — exactly how this task was approached.
- **Small teams / personal projects:** A lighter alternative to running a full GitLab instance, which is resource-heavy by comparison.

## Why It's Relevant to DevOps

Understanding Gitea (or any self-hosted Git server) reinforces how source control integrates into a full DevOps pipeline — version control, SSH-based authentication, CI/CD triggers, and access management — all of which are foundational before working with managed services like AWS CodeCommit or GitHub Actions in production.
