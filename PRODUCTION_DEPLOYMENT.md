# Production Deployment Guide - AISim Nursing Assistant

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Security Checklist](#security-checklist)
3. [Environment Setup](#environment-setup)
4. [Deployment Steps](#deployment-steps)
5. [HIPAA Compliance](#hipaa-compliance)
6. [Mobile Optimization](#mobile-optimization)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: v16.0.0 or higher
- **NPM**: v8.0.0 or higher
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 1GB free space
- **OS**: Linux (Ubuntu 20.04+), Windows Server 2016+, or macOS

### Required Services
- Google Gemini API Key (with proper quota)
- SSL/TLS Certificate (for HTTPS)
- Reverse Proxy (Nginx or Apache recommended)
- Process Manager (PM2 recommended)

### Optional but Recommended
- Database (PostgreSQL for future data persistence)
- Redis (for session storage and caching)
- Monitoring service (Sentry, DataDog, or New Relic)
- Load balancer (for high availability)

---

## Security Checklist

### Before Deployment
- [ ] Change all default passwords and secrets
- [ ] Generate strong SESSION_SECRET (min 32 characters)
- [ ] Replace example API keys with production keys
- [ ] Configure CORS to allow only production domains
- [ ] Enable HTTPS/SSL (required for medical data)
- [ ] Review and test rate limiting settings
- [ ] Configure firewall rules
- [ ] Set up backup systems
- [ ] Enable audit logging
- [ ] Configure secure headers (already included via Helmet)

### HIPAA Compliance Requirements
- [ ] Enable encryption at rest and in transit
- [ ] Implement user authentication (future enhancement)
- [ ] Set up audit logging with 7-year retention
- [ ] Ensure PHI data is properly protected
- [ ] Configure automatic session timeouts
- [ ] Implement data backup and disaster recovery
- [ ] Create incident response plan
- [ ] Document all security measures
- [ ] Conduct security audit
- [ ] Sign Business Associate Agreements (BAA)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd aisim-nursing-assistant
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Configure Environment
```bash
# Copy production environment template
cp .env.production .env

# Edit .env with production values
nano .env
```

### Required Environment Variables
```bash
# Server
NODE_ENV=production
PORT=3000
APP_VERSION=1.0.0

# API Keys (CRITICAL - Replace with real keys)
GOOGLE_GEMINI_API_KEY=your_production_api_key_here

# CORS (Add your production domains)
CORS_ORIGIN=https://your-domain.com
CORS_WHITELIST=https://your-domain.com

# Security
SESSION_SECRET=your_strong_secret_here

# HIPAA Compliance
ENABLE_AUDIT_LOGGING=true
AUDIT_LOG_RETENTION_DAYS=2555
DATA_ENCRYPTION_ENABLED=true
```

---

## Deployment Steps

### Option 1: PM2 (Recommended)

#### Install PM2
```bash
npm install -g pm2
```

#### Start Application
```bash
# Using production server
pm2 start server.production.js --name aisim-nursing

# Or using ecosystem file
pm2 start ecosystem.config.js --env production
```

#### Configure Auto-Restart on Boot
```bash
pm2 startup
pm2 save
```

#### Monitor Application
```bash
pm2 status
pm2 logs aisim-nursing
pm2 monit
```

### Option 2: Docker

#### Build Docker Image
```bash
docker build -t aisim-nursing:latest .
```

#### Run Container
```bash
docker run -d \
  --name aisim-nursing \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  aisim-nursing:latest
```

### Option 3: Systemd Service

Create service file: `/etc/systemd/system/aisim-nursing.service`
```ini
[Unit]
Description=AISim Nursing Assistant
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/aisim-nursing-assistant
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.production.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable aisim-nursing
sudo systemctl start aisim-nursing
sudo systemctl status aisim-nursing
```

---

## Nginx Configuration

### SSL/HTTPS Setup (Required for Production)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/aisim-nursing-access.log;
    error_log /var/log/nginx/aisim-nursing-error.log;

    # Proxy Configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service worker (no cache)
    location /service-worker.js {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

---

## HIPAA Compliance

### Data Protection
1. **Encryption in Transit**: HTTPS/TLS 1.2+ (configured in Nginx)
2. **Encryption at Rest**: Enable in production environment
3. **Access Control**: Implement authentication (future enhancement)
4. **Audit Logging**: Enabled by default, stores in `/logs/combined.log`

### Audit Log Management
```bash
# View audit logs
tail -f logs/combined.log | grep AUDIT

# Archive logs (recommended monthly)
tar -czf logs-archive-$(date +%Y%m).tar.gz logs/
```

### Data Retention
- Audit logs: 7 years (2555 days) as per HIPAA
- Error logs: 1 year minimum
- Access logs: 6 months minimum

---

## Mobile Optimization

### Progressive Web App (PWA)
The app is configured as a PWA with:
- Service Worker for offline capability
- Web App Manifest for installation
- Optimized for mobile devices
- Touch-friendly UI (44px minimum touch targets)
- Responsive design for all screen sizes

### Testing Mobile Optimization
1. Use Chrome DevTools Device Toolbar
2. Test on real devices (iOS and Android)
3. Run Lighthouse audit for mobile score
4. Test on various screen sizes (320px to 1920px)

### Performance Optimizations
- Compression enabled (gzip/brotli)
- Static asset caching
- Lazy loading images
- Minified CSS/JS
- CDN for fonts

---

## Monitoring & Maintenance

### Health Checks
```bash
# Check application health
curl https://your-domain.com/api/health

# Check metrics
curl https://your-domain.com/api/metrics
```

### Log Management
```bash
# View real-time logs
pm2 logs aisim-nursing --lines 100

# View error logs
tail -f logs/error.log

# View combined logs
tail -f logs/combined.log
```

### Performance Monitoring
- CPU usage: `pm2 monit`
- Memory usage: Check via PM2 or system tools
- Response times: Monitor via access logs
- Error rates: Check error logs

### Backup Strategy
1. **Database backups**: Daily (when implemented)
2. **Configuration backups**: Weekly
3. **Log backups**: Monthly
4. **Test restoration**: Quarterly

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs aisim-nursing --err

# Check environment variables
printenv | grep NODE_ENV

# Verify Node.js version
node --version

# Check port availability
netstat -tuln | grep 3000
```

### High Memory Usage
```bash
# Restart application
pm2 restart aisim-nursing

# Check memory usage
pm2 list
pm2 show aisim-nursing
```

### SSL Certificate Issues
```bash
# Verify certificate
openssl s_client -connect your-domain.com:443

# Check certificate expiry
openssl x509 -in cert.pem -text -noout
```

### Rate Limiting Too Strict
Edit `.env`:
```bash
RATE_LIMIT_MAX_REQUESTS=200  # Increase from 100
CHART_LIMIT_MAX_REQUESTS=20  # Increase from 10
```

---

## Production Checklist

### Before Going Live
- [ ] All environment variables configured
- [ ] SSL/HTTPS enabled and tested
- [ ] Firewall rules configured
- [ ] Backups configured and tested
- [ ] Monitoring enabled
- [ ] Error tracking configured
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] HIPAA compliance verified
- [ ] Documentation completed
- [ ] Team trained on operations

### Post-Deployment
- [ ] Monitor logs for errors
- [ ] Check performance metrics
- [ ] Verify SSL certificate auto-renewal
- [ ] Test backup restoration
- [ ] Review audit logs
- [ ] Update documentation
- [ ] Schedule security reviews

---

## Support & Maintenance

### Regular Maintenance Tasks
- **Daily**: Review error logs
- **Weekly**: Check health metrics, review audit logs
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Security audit, backup testing
- **Annually**: HIPAA compliance review, SSL certificate renewal

### Update Procedure
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install --production

# Restart application
pm2 restart aisim-nursing --update-env
```

### Emergency Rollback
```bash
# Revert to previous version
git checkout <previous-commit-hash>
npm install --production
pm2 restart aisim-nursing
```

---

## Contact & Resources

- **Documentation**: See README.md
- **Architecture**: See OPTIMIZED_ARCHITECTURE.md
- **Quick Start**: See QUICK_START.md
- **Troubleshooting**: See TROUBLESHOOTING.md

**Remember**: This application handles protected health information (PHI). Always follow HIPAA guidelines and your organization's security policies.
