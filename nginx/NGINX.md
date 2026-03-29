# Nginx Setup Guide

## Architecture

- `api.example.com` � Express API Server (`:8080`)
- `webhook.example.com/:id` � Express API Server (`:8080/webhook/:id`)
- `ws.example.com` � WebSocket Server (`:8082`)

## Installation

```bash
# Install Nginx
sudo apt update
sudo apt install nginx -y

# Check installation
nginx -v
```

## Setup Steps

### 1. Copy Configuration

```bash
# Copy our config to Nginx
sudo cp nginx/nginx.conf /etc/nginx/sites-available/buzz8n

# Create symlink
sudo ln -s /etc/nginx/sites-available/buzz8n /etc/nginx/sites-enabled/

# Remove default config (optional)
sudo rm /etc/nginx/sites-enabled/default
```

### 2. Update Main Nginx Config

Edit `/etc/nginx/nginx.conf` and ensure these settings exist in the `http` block:

```nginx
http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # Buffer sizes
    client_body_buffer_size 16K;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml
    application/xml;

    # Include site configs
    include /etc/nginx/sites-enabled/*;
}
```

### 3. Update Domain Names

In `/etc/nginx/sites-available/buzz8n`, replace `example.com` with your actual domain:

```bash
sudo nano /etc/nginx/sites-available/buzz8n

# Change:
# api.example.com � api.yourdomain.com
# webhook.example.com � webhook.yourdomain.com
# ws.example.com � ws.yourdomain.com
```

### 4. Test & Reload

```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

## DNS Configuration

Point these subdomains to your server IP:

```text
A    api.yourdomain.com      → YOUR_SERVER_IP
A    webhook.yourdomain.com  → YOUR_SERVER_IP
A    ws.yourdomain.com       → YOUR_SERVER_IP
```

## SSL Setup (Optional - Recommended)

Follow the official Certbot instructions for your OS:
**<https://certbot.eff.org/instructions>**

Quick setup for Ubuntu/Debian:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificates (run for each subdomain)
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d webhook.yourdomain.com
sudo certbot --nginx -d ws.yourdomain.com

# Or get all at once
sudo certbot --nginx -d api.yourdomain.com -d webhook.yourdomain.com -d ws.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

> **Note**: Certbot will automatically modify your Nginx config to add SSL certificates
> and create HTTP→HTTPS redirects.

## Testing

```bash
# Test API
curl http://api.yourdomain.com/api/v1/health

# Test Webhook
curl http://webhook.yourdomain.com/123

# Test WebSocket (requires wscat)
npm install -g wscat
wscat -c ws://ws.yourdomain.com
```

## Logs

```bash
# View API logs
sudo tail -f /var/log/nginx/api.access.log
sudo tail -f /var/log/nginx/api.error.log

# View Webhook logs
sudo tail -f /var/log/nginx/webhook.access.log

# View WebSocket logs
sudo tail -f /var/log/nginx/ws.access.log

# View all errors
sudo tail -f /var/log/nginx/*error.log
```

## Troubleshooting

```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check configuration syntax
sudo nginx -t

# Check ports
sudo netstat -tulpn | grep nginx
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :8082

# Check if services are running
ps aux | grep node
```

## Common Issues

**502 Bad Gateway**: Backend servers (8080/8082) are not running

```bash
# Start your Express and WS servers
pnpm start
```

**Connection Refused**: Check if Nginx is listening on port 80

```bash
sudo netstat -tulpn | grep :80
```

**WebSocket Connection Fails**: Ensure cookies are being sent with WS requests
