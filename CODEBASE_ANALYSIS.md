# Smart Step Website - Codebase Analysis

**Last Updated:** 2026-01-01

## Project Overview

A bilingual (Arabic/English) business website with Laravel backend API and React frontend, featuring an admin dashboard for content management.

---

## Architecture

### Frontend (React + Vite)
- **Framework:** React 19.2 with TypeScript
- **Bundler:** Vite 6.2 with proxy configuration to Laravel
- **Styling:** CSS (custom variables) + Tailwind CSS (Zinc-950 Dark Theme)
- **Rich Text:** ReactQuill integration for blog posts
- **Routing:** React Router DOM 7.9 (HashRouter)
- **State:** React Context (Auth, Language, Data)

### Backend (Laravel)
- **Framework:** Laravel 11
- **Auth:** Sanctum (cookie-based SPA authentication)
- **Roles/Permissions:** Spatie Laravel-Permission (Super admin, Admin, Employee)
- **Media:** Spatie Laravel-Medialibrary
- **Database:** SQLite (local dev), MySQL (production)

---

## Directory Structure

```
smart-step-website/
├── App.tsx              # Main app with routing
├── index.tsx            # Entry point
├── types.ts             # TypeScript interfaces
├── vite.config.ts       # Vite config with API proxy
├── walkthrough.md       # Session walkthrough and proof of work
│
├── pages/               # 13 page components
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── HomePage.tsx
│   └── ...
│
├── components/
│   ├── dashboard/       # 11 dashboard components
│   │   ├── DashboardSidebar.tsx
│   │   ├── ManageMessages.tsx
│   │   ├── ManagePosts.tsx
│   │   ├── ManageUsers.tsx
│   │   ├── ManageTeam.tsx
│   │   ├── SiteSettings.tsx
│   │   └── ...
│   ├── ui/              # 15 UI components
│   ├── layout/          # 4 layout components
│   └── auth/            # 2 auth components
│
├── lib/
│   └── apiClient.ts     # API request functions
│
├── contexts/
│   ├── AuthContext.tsx
│   ├── LanguageContext.tsx
│   └── DataContext.tsx
│
├── hooks/               # 6 custom hooks
│
└── backend/             # Laravel application
    ├── app/
    │   ├── Http/Controllers/
    │   │   ├── AuthController.php
    │   │   ├── ContactController.php
    │   │   ├── MediaController.php
    │   │   ├── PostController.php
    │   │   ├── UserController.php
    │   │   └── ...
    │   └── Models/
    │       ├── User.php
    │       ├── Post.php
    │       ├── ContactMessage.php
    │       ├── EmailSubscription.php
    │       └── Media.php
    │
    ├── routes/api.php    # API routes
    ├── database/
    │   ├── migrations/
    │   └── seeders/
    │       ├── ContactMessageSeeder.php
    │       └── EmailSubscriptionSeeder.php
    │
    └── tests/
        ├── Feature/ExampleTest.php
        └── Unit/ExampleTest.php
```

---

## Database Models

| Model | Table | Description |
|-------|-------|-------------|
| `User` | users | Admin/employee accounts with Spatie roles |
| `Post` | posts | Blog posts with translations and media |
| `ContactMessage` | contact_messages | Contact form submissions |
| `EmailSubscription` | email_subscriptions | Newsletter subscribers |
| `Media` | media | Managed via Spatie Media Library |

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (auth required)
- `GET /api/auth/me` - Current user (auth required)

### Posts (Public read, auth+role for write)
- `GET /api/posts` - List posts
- `GET /api/posts/{id}` - Get post
- `POST /api/posts` - Create (admin|employee)
- `PUT /api/posts/{post}` - Update (admin|employee)
- `DELETE /api/posts/{post}` - Delete (admin|employee)

### Contact Messages (admin only)
- `POST /api/contact` - Submit contact form (public)
- `GET /api/contact/messages` - List messages
- `GET /api/contact/messages/{id}` - View message
- `PUT /api/contact/messages/{id}/status` - Update status
- `POST /api/contact/messages/{id}/reply` - Reply

### Users (admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/{user}` - Update user
- `DELETE /api/users/{user}` - Delete user

### Media (admin|employee)
- `GET /api/media` - List media
- `POST /api/media` - Upload
- `DELETE /api/media/{id}` - Delete

---

## Dashboard Sections

| Section | Component | Status |
|---------|-----------|--------|
| Posts | `ManagePosts.tsx` | ✅ Working (Rich Text + Media) |
| Messages | `ManageMessages.tsx` | ✅ Fixed Middleware Issues |
| Users | `ManageUsers.tsx` | ✅ Working (Super Admin Support) |
| Team | `ManageTeam.tsx` | ⚠️ Local only |
| Settings | `SiteSettings.tsx` | ✅ Working (API Key Management) |

---

## Recent Enhancements

### 1. Blog System & Media
- Integrated **ReactQuill** for rich text editing.
- Implemented **Spatie Media Library** for backend image management.
- Fixed image upload parameter mismatch between frontend and backend.

### 2. Dark Mode Overhaul
- Implemented a modern **Zinc-950** dark theme.
- Fixed visibility issues in Navbar, Hero sections, and Footer.
- Improved logo contrast with CSS filters.

### 3. Translation & Security
- Moved translation logic to backend via Gemini API.
- Masked sensitive API keys in the dashboard.
- Ensured HTML tags are preserved during auto-translation.

---

## Known Issues & Backlog

### 1. Email Subscriptions Not Fully Implemented
- Model and migration exist, but frontend/backend integration is pending.

### 2. Missing Tests
- Integration tests for API endpoints are still required.

---

## Development Commands

```bash
# Frontend
npm run dev          # Start Vite dev server (port 3000)
npm run build        # Build for production

# Backend
npm run dev:backend  # Start Laravel (port 8000)
cd backend && php artisan migrate
cd backend && php artisan db:seed

# Full stack
npm run dev:full     # Run both concurrently
```
