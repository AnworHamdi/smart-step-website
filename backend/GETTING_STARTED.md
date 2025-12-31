# Getting Started with Laravel Headless CMS

A comprehensive guide to installing, configuring, and using the Laravel Headless CMS.

## 📑 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [First Steps](#first-steps)
- [Authentication](#authentication)
- [Working with Resources](#working-with-resources)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## Prerequisites

### System Requirements

- **PHP:** 8.2 or higher with extensions:
  - OpenSSL
  - PDO
  - Mbstring
  - Tokenizer
  - XML
  - Ctype
  - JSON
  - BCMath
  - Fileinfo
- **Database:** MySQL 8.0+ or MariaDB 10.3+
- **Composer:** 2.x or higher
- **Node.js:** 18+ and npm (for asset compilation)
- **Web Server:** Apache 2.4+ or Nginx 1.18+

### Recommended Tools

- **Postman** or **Insomnia** for API testing
- **Git** for version control
- **Redis** for caching (optional but recommended)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/laravel-headless-cms.git
cd laravel-headless-cms
```

### Step 2: Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### Step 3: Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 4: Database Setup

Edit `.env` with your database credentials:

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=headless_cms
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

Create the database:

```bash
mysql -u root -p
CREATE DATABASE headless_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 5: Run Migrations and Seeders

```bash
# Run all migrations
php artisan migrate

# Seed the database with sample data and default users
php artisan db:seed
```

This will create:
- 3 default users (admin, creator, member)
- 5 categories
- 10 tags
- 25 sample items
- Roles and permissions

### Step 6: Install OAuth2 Keys

```bash
php artisan passport:install
```

Save the Client ID and Secret shown in the output (you'll need these for password grant authentication).

### Step 7: Start Development Server

```bash
php artisan serve
```

Your API is now running at `http://localhost:8000`!

---

## Configuration

### Essential Environment Variables

```bash
# Application
APP_NAME="Laravel Headless CMS"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# SSL Verification
APP_VERIFY_SSL=false  # Set to true in production

# Rate Limiting (requests per minute)
RATE_LIMIT_ADMIN=1000
RATE_LIMIT_CREATOR=100
RATE_LIMIT_MEMBER=60
RATE_LIMIT_GUEST=30

# API Logging
API_LOGGING_ENABLED=true
API_LOG_CHANNEL=daily
API_SLOW_THRESHOLD=1000  # milliseconds

# Mail Configuration (for password reset)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@headlesscms.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Optional: Redis Configuration

For better performance in production:

```bash
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

---

## First Steps

### 1. Test the API

```bash
curl http://localhost:8000/api/v2/items \
  -H "Accept: application/vnd.api+json"
```

You should see an authentication error - this is expected!

### 2. Access API Documentation

Visit `http://localhost:8000/docs/api` in your browser to see the interactive API documentation powered by Scramble.

### 3. Login and Get Access Token

```bash
curl -X POST http://localhost:8000/api/v2/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jsonapi.com",
    "password": "secret"
  }'
```

Response:
```json
{
  "token_type": "Bearer",
  "expires_in": 31536000,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "refresh_token": "def50200..."
}
```

Save the `access_token` for subsequent requests.

---

## Authentication

### Login

```bash
POST /api/v2/login
Content-Type: application/json

{
  "email": "admin@jsonapi.com",
  "password": "secret"
}
```

### Register New User

```bash
POST /api/v2/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "password_confirmation": "secure_password"
}
```

### Logout

```bash
POST /api/v2/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get Profile

```bash
GET /api/v2/me
Authorization: Bearer YOUR_ACCESS_TOKEN
Accept: application/vnd.api+json
```

### Update Profile

```bash
PATCH /api/v2/me
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "users",
    "id": "1",
    "attributes": {
      "name": "Updated Name",
      "email": "admin@jsonapi.com"
    }
  }
}
```

### Password Reset

#### Request Reset:
```bash
POST /api/v2/password-forgot
Content-Type: application/json

{
  "email": "admin@jsonapi.com"
}
```

#### Reset with Token:
```bash
POST /api/v2/password-reset
Content-Type: application/json

{
  "email": "admin@jsonapi.com",
  "token": "reset_token_from_email",
  "password": "new_password",
  "password_confirmation": "new_password"
}
```

---

## Working with Resources

### Items

#### List All Items

```bash
GET /api/v2/items
Authorization: Bearer YOUR_ACCESS_TOKEN
Accept: application/vnd.api+json
```

#### Get Single Item

```bash
GET /api/v2/items/1
Authorization: Bearer YOUR_ACCESS_TOKEN
Accept: application/vnd.api+json
```

#### Create Item

```bash
POST /api/v2/items
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "items",
    "attributes": {
      "name": "My New Article",
      "excerpt": "Short description",
      "description": "Full article content",
      "status": "published",
      "is_on_homepage": true,
      "date_at": "2025-01-15"
    },
    "relationships": {
      "category": {
        "data": { "type": "categories", "id": "1" }
      },
      "tags": {
        "data": [
          { "type": "tags", "id": "1" },
          { "type": "tags", "id": "2" }
        ]
      }
    }
  }
}
```

#### Update Item

```bash
PATCH /api/v2/items/1
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "items",
    "id": "1",
    "attributes": {
      "name": "Updated Title",
      "status": "draft"
    }
  }
}
```

#### Delete Item

```bash
DELETE /api/v2/items/1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Categories

Same pattern as Items:
- `GET /api/v2/categories` - List all
- `GET /api/v2/categories/1` - Get one
- `POST /api/v2/categories` - Create
- `PATCH /api/v2/categories/1` - Update
- `DELETE /api/v2/categories/1` - Delete

#### Create Category

```bash
POST /api/v2/categories
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "categories",
    "attributes": {
      "name": "Technology",
      "color": "#FF5733"
    }
  }
}
```

### Tags

Same CRUD pattern:
- `GET /api/v2/tags`
- `POST /api/v2/tags`
- `PATCH /api/v2/tags/1`
- `DELETE /api/v2/tags/1`

### Users (Admin Only)

- `GET /api/v2/users` - List all users
- `GET /api/v2/users/1` - Get user
- `POST /api/v2/users` - Create user
- `PATCH /api/v2/users/1` - Update user
- `DELETE /api/v2/users/1` - Delete user

### Roles (Admin Only)

- `GET /api/v2/roles` - List all roles
- `GET /api/v2/roles/1` - Get role with permissions

---

## Advanced Usage

### Filtering

```bash
# Filter by status
GET /api/v2/items?filter[status]=published

# Filter by multiple fields
GET /api/v2/items?filter[status]=published&filter[is_on_homepage]=true

# Filter by date
GET /api/v2/items?filter[date_at]=2025-01-01

# Search by name
GET /api/v2/items?filter[name]=Laravel
```

### Sorting

```bash
# Sort by created_at descending
GET /api/v2/items?sort=-created_at

# Sort by name ascending
GET /api/v2/items?sort=name

# Multiple sort fields
GET /api/v2/items?sort=-status,name
```

### Including Relationships

```bash
# Include user
GET /api/v2/items?include=user

# Include multiple relationships
GET /api/v2/items?include=user,category,tags

# Include nested relationships
GET /api/v2/items?include=category,tags,user.roles
```

### Pagination

```bash
# Default pagination (15 per page)
GET /api/v2/items

# Custom page size
GET /api/v2/items?page[size]=25

# Specific page
GET /api/v2/items?page[number]=2

# Combined
GET /api/v2/items?page[size]=10&page[number]=3
```

### Sparse Fieldsets

```bash
# Only get specific fields
GET /api/v2/items?fields[items]=name,status,created_at

# Multiple resource types
GET /api/v2/items?include=user&fields[items]=name,status&fields[users]=name,email
```

### Complex Queries

```bash
# Published items, sorted by date, with relationships, paginated
GET /api/v2/items
  ?filter[status]=published
  &filter[is_on_homepage]=true
  &sort=-date_at
  &include=user,category,tags
  &page[size]=10
  &fields[items]=name,excerpt,status,date_at
```

---

## Troubleshooting

### Common Issues

#### "Unauthenticated" Error

**Problem:** Missing or invalid access token

**Solution:**
```bash
# Make sure to include the Authorization header
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### "The given data was invalid" Error

**Problem:** Validation error

**Solution:** Check the error response for field-specific issues:
```json
{
  "errors": [
    {
      "status": "422",
      "title": "Validation Error",
      "detail": "The name field is required.",
      "source": {
        "pointer": "/data/attributes/name"
      }
    }
  ]
}
```

#### "Too Many Requests" (429)

**Problem:** Rate limit exceeded

**Solution:** Wait 60 seconds or authenticate for higher limits

#### Database Connection Error

**Problem:** Can't connect to database

**Solution:**
1. Verify database credentials in `.env`
2. Ensure database server is running
3. Check database exists: `CREATE DATABASE headless_cms;`

#### Passport Keys Not Found

**Problem:** OAuth2 keys missing

**Solution:**
```bash
php artisan passport:install
```

---

## Production Deployment

### Pre-Deployment Checklist

```bash
# 1. Update environment
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_VERIFY_SSL=true

# 2. Set strong application key
php artisan key:generate

# 3. Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Optimize autoloader
composer install --optimize-autoloader --no-dev

# 5. Run migrations
php artisan migrate --force

# 6. Install Passport
php artisan passport:install --force
```

### Security Configuration

```bash
# Strong rate limits
RATE_LIMIT_ADMIN=500
RATE_LIMIT_CREATOR=60
RATE_LIMIT_MEMBER=30
RATE_LIMIT_GUEST=10

# Enable logging
API_LOGGING_ENABLED=true

# SSL enforcement
APP_VERIFY_SSL=true

# Session security
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=strict
```

### Performance Optimization

```bash
# Use Redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

# Optimize database
php artisan db:seed --class=PermissionsSeeder
# Run performance migrations
php artisan migrate

# Set up queue worker
php artisan queue:work --tries=3
```

### Monitoring

Set up logging and monitoring:
- Application logs: `storage/logs/`
- API logs: Check `storage/logs/laravel-YYYY-MM-DD.log`
- Consider external monitoring (Sentry, New Relic, etc.)

---

## Next Steps

1. **Explore API Documentation:** `http://localhost:8000/docs/api`
2. **Read Feature Guide:** [FEATURES.md](FEATURES.md)
3. **Check Examples:** See [README.md](README.md#api-examples)
4. **Build Your Frontend:** Connect React, Vue, Next.js, or mobile app
5. **Customize:** Extend models, add new features, modify workflows

---

## Support

- **Issues:** Report bugs on GitHub
- **Questions:** Check documentation or open a discussion
- **Contributing:** See contribution guidelines

---

**Happy building! 🚀**
