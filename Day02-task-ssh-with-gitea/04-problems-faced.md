cat > 04-problems-faced.md << 'EOF'
# Problems Faced & Resolutions

## 1. Connected to Wrong Host (gitea.com vs local alias)

**Problem:** Initial clone attempt unexpectedly connected to the public `gitea.com` service instead of the intended target, triggering an unfamiliar SSH host key verification prompt.

**Cause:** Misunderstanding between a self-hosted local Gitea instance and the public Gitea Cloud service — they are entirely separate hosts with separate SSH configs.

**Resolution:** Confirmed which Gitea service was actually being used (Gitea Cloud), and configured `~/.ssh/config` specifically for `gitea.com` rather than a local alias.

## 2. SSH Connection Timing Out (IPv6 Issue)

**Problem:** `ssh -vT` and `git clone` commands hung indefinitely with no error.

**Diagnosis:** Running `ssh -vT` with verbose output revealed SSH was attempting to connect over **IPv6** first:
