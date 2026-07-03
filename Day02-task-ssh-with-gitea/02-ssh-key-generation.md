# SSH Key Generation for Gitea

## Command Used

```bash
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/gitea_cloud_ed25519
```

## Why ED25519

- Smaller key size (256-bit) with stronger security than RSA-4096
- Faster key generation, signing, and verification
- Current industry-standard default for SSH authentication; RSA is mainly kept for legacy compatibility

## Files Generated

| File | Purpose |
|---|---|
| `~/.ssh/gitea_cloud_ed25519` | Private key — stays on local machine, never shared |
| `~/.ssh/gitea_cloud_ed25519.pub` | Public key — added to Gitea account |

## Setting Correct Permissions

```bash
chmod 600 ~/.ssh/gitea_cloud_ed25519
```

Strict permissions are required — SSH will refuse to use a private key that is readable by other users on the system.

## Registering the Public Key in Gitea

```bash
cat ~/.ssh/gitea_cloud_ed25519.pub
```

Steps in Gitea:
1. Log in → Profile icon → **Settings**
2. **SSH/GPG Keys** → **Add Key**
3. Paste the public key content
4. Name it descriptively (e.g. `laptop-devops-intern`)
5. Save

## Principle

Asymmetric key authentication means the server (Gitea) only ever needs the **public** key to verify identity. The private key never leaves the local machine — the same trust model used by AWS EC2 key pairs and GitHub deploy keys.
