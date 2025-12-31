<!-- Copilot guidance for contributors and AI coding agents -->
# Copilot Instructions — HeadlessCMS (Laravel + JSON:API)

Purpose: give an AI coding agent the minimal, actionable knowledge to be productive in this repository.

- Big picture:
  - This is a Laravel 10 API project implementing the JSON:API spec via `laravel-json-api/laravel` (see `composer.json`).
  - API surface lives under `routes/api.php` and the JSON:API adapters/serializers/controllers under `app/JsonApi` and `app/JsonApi/V2`.
  - Domain models live in `app/Models` (e.g. `Item.php`, `Category.php`, `User.php`) and are protected by Laravel Policies in `app/Policies`.

- Key integrations & dependencies to be aware of:
  - Auth: `laravel/passport` is used for OAuth (run `php artisan passport:install` when setting up).
  - Permissions: `spatie/laravel-permission` manages roles/permissions (see `config/permission.php`).
  - JSON:API behavior is implemented with `laravel-json-api/laravel` — look at `app/JsonApi` to follow request/response flows.
  - Frontend/assets: built with `laravel-mix` (see `package.json`). Use `npm run dev` / `npm run production` for assets.

- Developer workflows / commands (explicit, runnable):
  - Install PHP deps: `composer install`
  - Install JS deps: `npm install`
  - Copy env: `cp .env.example .env` (composer's post-root-package-install also copies it automatically)
  - Generate app key: `php artisan key:generate`
  - Migrate & seed DB: `php artisan migrate --seed` (seeds create the default users/roles used in README)
  - Install Passport (OAuth): `php artisan passport:install`
  - Run tests: `php artisan test` or `vendor/bin/phpunit`
  - Assets: `npm run dev` (development) and `npm run production`
  - DO NOT use `php artisan serve` for local dev (README warns about single-threaded stalls). Use Docker/Laradock, Valet, or a proper multi-threaded server.

- Project-specific conventions / patterns
  - JSON:API resources and versioning: check `app/JsonApi` and `app/JsonApi/V2` for how resources are registered and routed — follow those patterns for new endpoints.
  - Validation: API request validation is implemented using `app/Http/Requests`. Prefer adding request classes rather than inline validation in controllers.
  - Policies: Authorization uses `app/Policies/*Policy.php` and are wired in `AuthServiceProvider.php`. When adding protected actions, create/update the corresponding policy.
  - Seeds & factories: sample data lives in `database/seeders` and `database/factories` — tests rely on these factories.
  - File uploads: image uploads are handled and stored in `public/images` and referenced by models — check controller methods that call `store()`/`Storage::putFile`.

- Where to look for examples
  - Resource/controller flow: `app/JsonApi/*` and `routes/api.php`
  - Auth + tokens example: `app/Http/Controllers/Auth/*` and `config/auth.php`
  - Role/permission usage: `app/Models/User.php` (uses `HasRoles`) and `config/permission.php`
  - Policies: `app/Policies/*.php` (e.g., `ItemPolicy.php`, `UserPolicy.php`)
  - Seeder examples: `database/seeders/*` (default users/roles)

- Testing & debugging notes
  - `phpunit.xml` sets `APP_ENV=testing` and uses `array` drivers for cache/session; tests may expect a DB — prefer an isolated test DB or SQLite in-memory if needed.
  - Use `php artisan telescope:install` only when debugging locally (Telescope is included in dev deps).

- Safety & repository rules for AI edits
  - Do not modify `vendor/` or third-party packages.
  - Avoid changing global config (like `composer.json` or `package.json`) unless the change is necessary and small — explain why in PR.
  - Preserve seed data and default credentials in README unless asked to change.

- PR / commit advice for generated changes
  - Keep changes small and focused: update or add one endpoint/feature per PR.
  - Include or update tests in `tests/Feature` or `tests/Unit` demonstrating behaviour.
  - Run `php artisan migrate --seed` and `php artisan test` locally; list commands run in PR description.

If anything here is unclear or you'd like me to expand examples (e.g., walk through adding a JSON:API resource), tell me which area to expand.
