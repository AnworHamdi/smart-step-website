# Smart Step Website

![Smart Step Logo](./assets/smartstep-logo.png)

A bilingual (Arabic/English) corporate website for **Smart Step** - a Libyan company specializing in communications and information technology. Built with React 19, TypeScript, and a Laravel Headless CMS backend.

> **Private Project** - This repository is for internal company use only.

---

## 🌟 Key Features

### Public Website
- **Bilingual Support**: Full Arabic and English with automatic RTL layout switching
- **Modern Design**: Responsive, mobile-first UI with dark mode support
- **AI-Powered Translation**: Gemini API integration for automatic content translation
- **Contact Forms**: Customer inquiries sent directly to the dashboard

### Admin Dashboard
- **Blog Management**: Create, edit, and publish bilingual posts
- **Contact Messages**: View, reply, and archive customer messages
- **Email Subscriptions**: Manage newsletter subscribers with broadcast functionality
- **User Management**: Admin and employee roles with protected routes
- **Team Management**: Maintain "About Us" team member profiles
- **Site Settings**: Update company contact information and branding

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, React Router 7, CSS Variables |
| **Backend** | Laravel 12 Headless CMS, Laravel Passport (OAuth2), Spatie Permissions |
| **Database** | MySQL (development & production) |
| **API Format** | JSON:API v1.1 Specification |

---

## 📁 Project Structure

```
smart-step-website/
├── App.tsx                 # Main app with routing
├── components/
│   ├── auth/               # Protected route wrapper
│   ├── dashboard/          # Admin management components
│   │   ├── ManagePosts.tsx
│   │   ├── ManageMessages.tsx
│   │   ├── ManageSubscriptions.tsx
│   │   ├── ManageUsers.tsx
│   │   ├── ManageTeam.tsx
│   │   └── SiteSettings.tsx
│   ├── layout/             # Navbar, Footer, ScrollToTop
│   └── ui/                 # Reusable components (Button, Card, Icons, etc.)
├── contexts/
│   ├── AuthContext.tsx     # OAuth2 authentication state
│   ├── DataContext.tsx     # Posts, users, settings state
│   └── LanguageContext.tsx # Language/RTL switching
├── hooks/                  # useTranslation, useSeo, useGeminiTranslation
├── lib/
│   ├── apiClient.ts        # JSON:API fetch wrapper with OAuth2
│   └── translations.ts     # AR/EN translation strings
├── pages/                  # Route page components
└── backend/                # Laravel Headless CMS
    ├── app/
    │   ├── Http/Controllers/Api/V2/  # JSON:API controllers
    │   ├── Models/                    # Eloquent models
    │   ├── Notifications/             # Email notifications
    │   └── Traits/HasTranslations.php # Bilingual content trait
    ├── database/
    │   ├── migrations/     # Database schema
    │   └── seeders/        # Sample data
    └── routes/api.php      # API endpoints
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PHP 8.2+
- Composer
- MySQL or SQLite

### 1. Clone & Install

```bash
git clone "https://github.com/AnworHamdi/SmartStep.git"
cd smart-step-website

# Frontend
npm install

# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan passport:install --force
php artisan migrate --seed
cd ..
```

### 2. Configure Environment

**Frontend** (`.env.local`):
```env
GEMINI_API_KEY=your_google_ai_studio_key
```

**Backend** (`backend/.env`):
```env
DB_DATABASE=smart_step
ADMIN_EMAIL=admin@smartstep.ly
ADMIN_PASSWORD=Admin123!
```

### 3. Run Development Servers

```bash
# Terminal 1 - Frontend (localhost:3000)
npm run dev

# Terminal 2 - Backend (localhost:8000)
cd backend && php artisan serve
```

### 4. Login

- **URL**: http://localhost:3000/#/login
- **Admin**: `admin@smartstep.ly` / `Admin123!`

---

## 📡 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/contact` | Submit contact form |
| POST | `/api/v2/subscribe` | Newsletter subscription |
| GET | `/api/v2/items` | List published posts |

### Protected (requires OAuth2 token)
| Resource | Endpoints |
|----------|-----------|
| Items/Posts | CRUD at `/api/v2/items` |
| Users | CRUD at `/api/v2/users` |
| Contact Messages | `/api/v2/contact-messages`, `/{id}/reply` |
| Subscriptions | `/api/v2/subscriptions`, `/broadcast` |
| Site Settings | `/api/v2/settings` |

---

## 🧪 Development Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Production build

# Backend
php artisan serve                         # Start API server
php artisan migrate                       # Run migrations
php artisan db:seed --class=ItemsSeeder   # Seed blog posts
php artisan test                          # Run tests
```

---

## 📝 Additional Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md) - Architecture overview
- [backend/FEATURES.md](./backend/FEATURES.md) - CMS feature documentation

---

## 📧 Contact

- **Website**: https://smartstep.ly
- **Email**: info@smartstep.ly

---

© 2026 Smart Step. All rights reserved. Private and confidential.
