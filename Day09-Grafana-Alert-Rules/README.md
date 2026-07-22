# Day 9 — Grafana Alert Rules

## Alert Rules Created
1. **HighCPUUsage** — fires when average CPU usage > 80% for 2m
2. **HighMemoryUsage** — fires when memory usage > 85% for 2m
3. **LowDiskSpace** — fires when free disk space < 15% for 2m

## Contact Point
MailHog (SMTP test server) — Grafana configured with GF_SMTP_HOST=mailhog:1025

## Test Method
```bash
stress-ng --cpu 4 --timeout 180s
```
Loaded all 4 CPU cores to push average utilization above 80% threshold.

## Results
- HighCPUUsage transitioned: Normal → Pending → Firing (screenshots/firing.png)
- Firing notification received in MailHog (screenshots/firing-email.png)
- After stress ended, alert resolved: Firing → Normal (screenshots/resolved.png)
- Resolved notification received in MailHog (screenshots/resolved-email.png)
