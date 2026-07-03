
# SSH Connection Setup — Gitea Cloud

## SSH Config File

Location: `~/.ssh/config`

```
Host gitea.com
    HostName gitea.com
    User git
    Port 22
    IdentityFile ~/.ssh/gitea_cloud_ed25519
    IdentitiesOnly yes
    AddressFamily inet
```

```bash
chmod 600 ~/.ssh/config
```

## Explanation of Each Directive

| Directive | Purpose |
|---|---|
| `Host` | The alias/hostname pattern this config block applies to |
| `HostName` | The real server address SSH connects to |
| `User` | Git servers use a fixed `git` user for all SSH operations, regardless of your actual account |
| `Port` | Standard SSH port (22) for gitea.com |
| `IdentityFile` | Points to the specific private key to use — avoids SSH trying every key in `~/.ssh/` |
| `IdentitiesOnly yes` | Forces SSH to use only the specified key, avoiding ambiguous auth failures |
| `AddressFamily inet` | Forces IPv4 — required to fix an IPv6 connection timeout issue (see problems-faced.md) |

## Testing the Connection

```bash
ssh -T git@gitea.com
```

Expected output:
