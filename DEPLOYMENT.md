# Production Deployment Guide

This guide covers deploying the Smart Step website to production.

## Prerequisites

- Production server with Node.js 18+ and PHP 8.2+
- Domain name configured
- SSL certificate
- MySQL or PostgreSQL database
- SMTP email service

## Frontend Deployment

### Option 1: Static Hosting (Recommended)

Deploy to services like **Vercel**, **Netlify**, or **Cloudflare Pages**.

#### Vercel Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Build the project:**
```bash
npm run build
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Configure environment variables in Vercel dashboard:**
   - `GEMINI_API_KEY`: Your Gemini API key

#### Netlify Deployment

1. **Build configuration** (create `netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy via Netlify CLI or Git integration**

### Option 2: Traditional Web Server

#### Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

#### Apache Configuration

```apache
<VirtualHost *:443>
    ServerName smartstep.ly
    DocumentRoot /var/www/smartstep/dist

    <Directory /var/www/smartstep/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Handle SPA routing
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /
            RewriteRule ^index\.html$ - [L]
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule . /index.html [L]
        </IfModule>
    </Directory>

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
</VirtualHost>
```

#### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name smartstep.ly;
    root /var/www/smartstep/dist;
    index index.html;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

---

## Backend Deployment

### 1. Server Setup

#### Install Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2 and extensions
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-sqlite3 php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install MySQL
sudo apt install mysql-server
```

### 2. Configure Database

```bash
# Log into MySQL
sudo mysql

# Create database and user
CREATE DATABASE smartstep;
CREATE USER 'smartstep_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON smartstep.* TO 'smartstep_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Deploy Backend Code

```bash
# Clone repository
cd /var/www
git clone <repository-url> smartstep-backend
cd smartstep-backend/backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Set up environment
cp .env.example .env
nano .env
```

### 4. Configure Production Environment

Edit `.env` with production settings:

```env
APP_NAME="Smart Step"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.smartstep.ly

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smartstep
DB_USERNAME=smartstep_user
DB_PASSWORD=strong_password_here

# Mail (Example with SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_FROM_ADDRESS="noreply@smartstep.ly"
MAIL_FROM_NAME="Smart Step"

# Security
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true

# CORS (Allow your frontend domain)
SANCTUM_STATEFUL_DOMAINS=smartstep.ly,www.smartstep.ly
SESSION_DOMAIN=.smartstep.ly
```

### 5. Run Migrations and Optimize

```bash
# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 6. Set Permissions

```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/smartstep-backend

# Set correct permissions
sudo chmod -R 755 /var/www/smartstep-backend
sudo chmod -R 775 /var/www/smartstep-backend/backend/storage
sudo chmod -R 775 /var/www/smartstep-backend/backend/bootstrap/cache
```

### 7. Configure Web Server

#### Nginx Configuration for Laravel

```nginx
server {
    listen 443 ssl http2;
    server_name api.smartstep.ly;
    root /var/www/smartstep-backend/backend/public;
    index index.php;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 8. Setup Process Manager (Optional but Recommended)

For queue workers and scheduled tasks:

```bash
# Install Supervisor
sudo apt install supervisor

# Create supervisor config
sudo nano /etc/supervisor/conf.d/smartstep-worker.conf
```

**Worker Configuration:**
```ini
[program:smartstep-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/smartstep-backend/backend/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/smartstep-backend/backend/storage/logs/worker.log
```

```bash
# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start smartstep-worker:*
```

### 9. Setup Cron for Scheduled Tasks

```bash
# Edit crontab
sudo crontab -e

# Add this line
* * * * * cd /var/www/smartstep-backend/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## Production Checklist

### Security
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Use strong `APP_KEY`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set secure session cookies
- [ ] Enable rate limiting
- [ ] Use strong database passwords
- [ ] Configure CSP headers
- [ ] Keep dependencies updated

### Performance
- [ ] Enable caching (config, routes, views)
- [ ] Enable Gzip compression
- [ ] Configure CDN for static assets
- [ ] Optimize images
- [ ] Enable browser caching
- [ ] Use production database (MySQL/PostgreSQL)
- [ ] Configure queue workers

### Monitoring
- [ ] Set up error tracking (Sentry, Bugsnag)
- [ ] Configure application logging
- [ ] Set up uptime monitoring
- [ ] Configure database backups
- [ ] Set up performance monitoring

### Email
- [ ] Configure production SMTP
- [ ] Test email delivery
- [ ] Set correct FROM address
- [ ] Configure email templates

### Database
- [ ] Run migrations
- [ ] Create database backups
- [ ] Set up backup automation
- [ ] Configure proper indexes

---

## Continuous Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/smartstep-backend
            git pull origin main
            cd backend
            composer install --optimize-autoloader --no-dev
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
```

---

## Rollback Procedure

If deployment fails:

### Frontend Rollback
```bash
# Vercel
vercel rollback

# Or manual rollback - deploy previous commit
git checkout <previous-commit>
npm run build
# Deploy dist/ folder
```

### Backend Rollback
```bash
# SSH to server
cd /var/www/smartstep-backend
git log --oneline  # Find previous commit
git checkout <previous-commit-hash>
cd backend
composer install --optimize-autoloader --no-dev
php artisan migrate:rollback  # If needed
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Environment-Specific Configuration

### Staging Environment

Create a staging environment for testing before production:

1. Set up separate server/subdomain (e.g., staging.smartstep.ly)
2. Use separate database
3. Configure `.env` with staging settings
4. Deploy and test thoroughly

### Development Environment

See main [README.md](../README.md) for development setup.

---

## Support and Troubleshooting

### Common Production Issues

**"500 Internal Server Error"**
- Check Laravel logs: `tail -f storage/logs/laravel.log`
- Verify file permissions
- Check PHP error logs

**"CORS Error"**
- Verify `SANCTUM_STATEFUL_DOMAINS` in `.env`
- Check frontend is using correct API URL

**"Database connection failed"**
- Verify database credentials
- Ensure database server is running
- Check firewall rules

---

For development setup, see the main [README.md](../README.md).
