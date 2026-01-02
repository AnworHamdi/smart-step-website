# Hostinger Premium Hosting Deployment Guide for Laravel Applications

> **Based on Real Experience**: This guide documents the deployment of a Laravel 12 backend with a Vite React frontend on Hostinger Premium Shared Hosting. It includes solutions to common issues encountered during deployment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Hostinger Environment Overview](#hostinger-environment-overview)
3. [Project Structure Requirements](#project-structure-requirements)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Verification Checklist](#verification-checklist)

---

## Prerequisites

- Hostinger Premium or Business Hosting plan
- Git repository (GitHub, GitLab, or Bitbucket)
- Domain configured in Hostinger
- Local development environment with PHP 8.2+ and Node.js

---

## Hostinger Environment Overview

### Key Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| Node.js/npm | ❌ Not Available | Cannot run `npm` in build environment |
| Composer | ✅ Available | Must use specific PHP path |
| PHP CLI | ⚠️ Default is 7.4 | Must use `/opt/alt/php82/usr/bin/php` |
| SSH Terminal | ✅ Available | Access via hPanel |
| Git Deployment | ✅ Available | Auto-deploy on push |

### PHP Binary Paths

```bash
# Default (usually PHP 7.4 - will cause errors)
php

# PHP 8.1
/opt/alt/php81/usr/bin/php

# PHP 8.2 (Recommended for Laravel 12)
/opt/alt/php82/usr/bin/php

# Composer location
/usr/local/bin/composer
```

---

## Project Structure Requirements

### For Monorepo Projects (Frontend + Backend)

```
project-root/
├── backend/              # Laravel application
│   ├── public/
│   ├── app/
│   ├── .env              # Production environment (create on server)
│   └── ...
├── dist/                 # Built frontend (must be committed)
│   ├── index.html
│   └── assets/
├── .htaccess            # Root routing rules
├── composer.json        # Root bridge file (required by Hostinger)
└── .gitignore           # Must allow dist/ folder
```

### Root composer.json (Bridge File)

Hostinger's deployment detector **requires** a `composer.json` in the root. Create a minimal one:

```json
{
    "name": "your-project/website",
    "description": "Bridge file for Hostinger deployment",
    "type": "project"
}
```

> **Important**: Do NOT include scripts that call `npm` - Hostinger's build environment doesn't have Node.js.

---

## Step-by-Step Deployment

### Step 1: Prepare Your Local Build

```bash
# Build frontend locally
npm run build

# Enable dist/ folder in .gitignore (comment out the exclusion)
# dist/  <-- comment this out or remove

# Commit the built files
git add dist/
git commit -m "Add production build"
git push
```

### Step 2: Configure Hostinger Git Deployment

1. Go to **hPanel → Git → Manage Repositories**
2. Connect your Git repository
3. Select branch (usually `main`)
4. Enable **Auto Deploy**
5. Click **Deploy**

### Step 3: Configure Root .htaccess

Create `.htaccess` in your project root to route between frontend and backend:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Route API requests to Laravel backend
    RewriteCond %{REQUEST_URI} ^/(api|sanctum)
    RewriteRule ^(.*)$ backend/public/index.php [L]

    # Serve built frontend files from /dist/
    RewriteCond %{DOCUMENT_ROOT}/dist/$1 -f
    RewriteRule ^(.*)$ dist/$1 [L]

    # SPA Routing: Route everything else to dist/index.html
    RewriteCond %{REQUEST_URI} !^/backend/public
    RewriteCond %{REQUEST_FILENAME} !-f [OR]
    RewriteCond %{REQUEST_URI} ^/$
    RewriteRule ^(.*)$ dist/index.html [L]
</IfModule>

# Security: Deny access to sensitive files
<FilesMatch "^\.env|composer\.json|composer\.lock|package\.json">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### Step 4: Backend Setup via SSH Terminal

Access the Hostinger Terminal via **hPanel → Advanced → Terminal**.

```bash
# Navigate to backend directory
cd backend

# Install dependencies using PHP 8.2
/opt/alt/php82/usr/bin/php /usr/local/bin/composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Generate application key
/opt/alt/php82/usr/bin/php artisan key:generate

# Run migrations
/opt/alt/php82/usr/bin/php artisan migrate --force

# Seed database (if needed)
/opt/alt/php82/usr/bin/php artisan db:seed --force

# Cache configuration
/opt/alt/php82/usr/bin/php artisan config:cache
/opt/alt/php82/usr/bin/php artisan route:cache
/opt/alt/php82/usr/bin/php artisan view:cache
```

### Step 5: Create Production .env

Create `backend/.env` on the server (not committed to Git):

```env
APP_NAME="Your App Name"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# For Passport/Sanctum
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

> **Critical**: Values with spaces (like `APP_NAME`) must be in quotes!

---

## Common Issues & Solutions

### Issue 1: "npm: command not found" (Error 127)

**Cause**: Hostinger build environment doesn't have Node.js/npm.

**Solution**: 
- Remove any npm scripts from root `composer.json`
- Build frontend locally and commit `dist/` folder

### Issue 2: ParseError with PHP Union Types (`|`)

**Error**: `syntax error, unexpected '|', expecting variable`

**Cause**: Default PHP CLI is 7.4, but Laravel 12 requires 8.2+.

**Solution**: Always use the explicit PHP 8.2 path:
```bash
/opt/alt/php82/usr/bin/php artisan ...
```

### Issue 3: Database Connection Error with "https" in host

**Error**: `getaddrinfo for https failed`

**Cause**: `DB_HOST` set to `https://...` instead of just the hostname.

**Solution**: Use only the host without protocol:
```env
DB_HOST=127.0.0.1
```

### Issue 4: .env Parse Error with Whitespace

**Error**: `Encountered unexpected whitespace at [App Na]`

**Cause**: Values containing spaces are not quoted.

**Solution**: Quote values with spaces:
```env
APP_NAME="Smart Step"
```

### Issue 5: Blank Page / Wrong index.html Served

**Error**: Browser tries to load `.tsx` files directly.

**Cause**: Root `index.html` (development) served instead of `dist/index.html`.

**Solution**: Update `.htaccess` to prioritize `dist/` folder (see Step 3).

### Issue 6: API Returns 401 Unauthorized for Public Content

**Cause**: All API routes protected by auth middleware.

**Solution**: 
1. Move public routes outside `auth:api` middleware group
2. Update policies to allow `?User $user` (nullable) for public read access

### Issue 7: Frontend Requests Going to Wrong URL

**Error**: `ERR_NAME_NOT_RESOLVED` for `https://api/v2/...`

**Cause**: `VITE_API_URL` set incorrectly during build.

**Solution**: Set `VITE_API_URL=` (empty) for relative paths, not `/`.

---

## Post-Deployment Configuration

### After Each Git Push

If you've changed backend files, run via Terminal:

```bash
cd backend
/opt/alt/php82/usr/bin/php artisan config:cache
/opt/alt/php82/usr/bin/php artisan route:cache
```

### For New Database Migrations

```bash
cd backend
/opt/alt/php82/usr/bin/php artisan migrate --force
```

### Pro Tip: Create an Alias

Run this once per SSH session for convenience:

```bash
alias php='/opt/alt/php82/usr/bin/php'
alias artisan='/opt/alt/php82/usr/bin/php artisan'
```

Then use normally:
```bash
artisan migrate --force
```

---

## Verification Checklist

- [ ] Website loads at `https://yourdomain.com`
- [ ] No console errors in browser DevTools
- [ ] API endpoints return data (e.g., `/api/v2/items`)
- [ ] Static assets load correctly (CSS, JS, images)
- [ ] SPA routing works (can navigate to `/about`, `/contact`, etc.)
- [ ] Backend routes work (`/api/v2/settings`)
- [ ] SSL certificate is active

---

## Quick Reference Commands

```bash
# Full backend setup
cd backend
/opt/alt/php82/usr/bin/php /usr/local/bin/composer install --no-dev --optimize-autoloader --ignore-platform-reqs
/opt/alt/php82/usr/bin/php artisan key:generate
/opt/alt/php82/usr/bin/php artisan migrate --force
/opt/alt/php82/usr/bin/php artisan db:seed --force
/opt/alt/php82/usr/bin/php artisan config:cache
/opt/alt/php82/usr/bin/php artisan route:cache

# Clear all caches
/opt/alt/php82/usr/bin/php artisan cache:clear
/opt/alt/php82/usr/bin/php artisan config:clear
/opt/alt/php82/usr/bin/php artisan route:clear
/opt/alt/php82/usr/bin/php artisan view:clear
```

---

*Last Updated: January 2026*
*Based on Smart Step (smartstep.ly) deployment experience*
