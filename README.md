# StaffViz Back-Office Admin Portal

> **Angular 18 SPA** — Super-admin back-office panel for the [StaffViz](https://www.staffviz.com) workforce management SaaS platform. Manages company lifecycle, SaaS plans/pricing, RBAC, email templates, and sales operations.
> Live at [backoffice.staffviz.com](https://backoffice.staffviz.com)

![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![CKEditor](https://img.shields.io/badge/CKEditor-5-0287D0?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Kubernetes-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## Table of Contents
- [What is this?](#what-is-this)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Security — E2E Payload Encryption](#security--e2e-payload-encryption)
- [Authentication & Token Management](#authentication--token-management)
- [All Routes & Screens](#all-routes--screens)
- [State Management](#state-management)
- [HTTP Request System](#http-request-system)
- [Key Features](#key-features)
- [Build & Deployment](#build--deployment)
- [Getting Started](#getting-started)

---

## What is this?

The StaffViz platform has three layers:
```
staffviz.com          — Marketing + customer signup  (sv-frontend)
backoffice.staffviz.com  — THIS REPO — Super-admin panel
backofficeapi.staffviz.com — API backend             (sv-admin-panel-api)
[employee panels]     — Company-scoped user apps     (sv-user-panel)
```

This panel is used by **Custimoo/StaffViz internal admins** to:
- Manage all tenant companies (create, activate, deactivate, invite owners)
- Define SaaS subscription plans, features, add-ons, and pricing
- Configure coupons and discounts
- Manage email templates (rich-text via CKEditor 5)
- Handle roles and fine-grained permissions for back-office users
- View sales inquiries and closed accounts
- Configure system-wide settings

---

## Architecture

```
+------------------------------------------------+
|         Angular 18 SPA (staffviz_admin_portal) |
|                                                 |
|  AppModule (single module, eagerly loaded)      |
|                                                 |
|  HttpClientRequestService                       |
|  +-------------------------------------------+ |
|  | FIFO request queue                         | |
|  | AES-256-CBC encrypt body before send       | |
|  | AES-256-CBC decrypt response on receive    | |
|  | 401 handler -> refresh token -> retry      | |
|  +-------------------------------------------+ |
|                                                 |
|  RxJS BehaviorSubject state (no NgRx)           |
|  AuthService | BreadcrumbService | DataSharing  |
|                                                 |
|  Route: AuthGuard protects all routes           |
+--------------------+----------------------------+
                     |  HTTPS
                     v
     backofficeapi.staffviz.com  (sv-admin-panel-api)
     All payloads encrypted: { app_data: "<base64-aes256>" }
```

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `@angular/core` | ^18.2.3 | Framework |
| `typescript` | ~5.4.5 | Language |
| `rxjs` | ~7.8.0 | Reactive streams |
| `@ng-bootstrap/ng-bootstrap` | ^17.0.1 | Bootstrap Angular components |
| `bootstrap` | 5.3.3 | CSS framework |
| `@ckeditor/ckeditor5-angular` | ^8.0.0 | Rich text editor |
| `@ckeditor/ckeditor5-build-classic` | ^42.0.0 | CKEditor classic build |
| `@tinymce/tinymce-angular` | ^8.0.0 | Alternative rich text editor |
| `chart.js` | ^4.3.3 | Company stats charts |
| `sweetalert2` | ^11.10.4 | Confirmation dialogs |
| `@angular/cdk` | ^18.2.9 | Drag-and-drop (plan ordering) |
| `ngx-pagination` | ^6.0.3 | Table pagination |
| `crypto-js` | ^4.1.1 | AES-256-CBC encryption |
| `@danielmoncada/angular-datetime-picker` | ^18.1.0 | Date/time inputs |
| `angular-device-information` | ^4.0.0 | Browser/OS fingerprinting at login |
| `javascript-obfuscator` | ^4.1.1 | Post-build JS obfuscation |

---

## Security — E2E Payload Encryption

**Every API request and response is AES-256-CBC encrypted.**

```
Request flow:
  Component calls service
       |
       v
  HttpClientRequestService.request()
       |
       v
  EncryptDecryptService.encryptAES256CBC(body)
       |  key = environment.secretKey
       v
  HTTP POST { app_data: "<base64-ciphertext>" }
       |
       v
  API response arrives as { app_data: "<base64-ciphertext>" }
       |
       v
  EncryptDecryptService.decrypt(app_data)
       |
       v
  Component receives plain JSON

Token in localStorage:
  Key: isUserToken
  Value: AES-256-CBC encrypted JWT
  (Permissions and user image also stored encrypted)
```

This means even if browser storage is read or network traffic is intercepted, all data and tokens are encrypted end-to-end with the app's secret key.

---

## Authentication & Token Management

```
1. LOGIN
   User submits credentials
        |
        v
   POST api/login
   Response: { app_data: "<encrypted>" }
        |
        v
   Decrypt -> extract JWT
        |
        v
   Store encrypted in localStorage:
     isUserToken     = AES(JWT)
     userPermissions = AES(permissions JSON)
     userImage       = AES(image URL)

2. SESSION RESTORE (on app load)
   APP_INITIALIZER factory runs
        |
        v
   Read + decrypt isUserToken from localStorage
        |
        v
   AuthService.SetState() -> restore BehaviorSubject

3. TOKEN REFRESH
   Any API call returns 401
        |
        v
   HttpClientRequestService.handle401Error()
        |
        v
   GET api/refresh?device=web  (with current Bearer)
        |
        v
   New JWT -> update localStorage -> retry original request

4. ROUTE GUARD
   AuthGuard subscribes to authService.stateItem$
   If null -> redirect to login page

5. PERMISSION CHECK
   checkPermission('features', 'edit')
   Reads decrypted userPermissions from localStorage
   Pattern: { module: { add, view, edit, delete } }
   Wildcard '*' grants full access
```

**Device fingerprinting at login:** Browser name, version, OS, and public IP (via `api.ipify.org`) are collected and sent with login request for security logging.

---

## All Routes & Screens

All routes protected by `AuthGuard` except the root login route.

| Route | Component | Description |
|---|---|---|
| `/` | `LoginComponent` | Login page — redirects to dashboard if already authenticated |
| `/company-management` | `CompanyManagementComponent` | Main dashboard — company list with Chart.js stats |
| `/plans-packages` | `PlansListingComponent` | SaaS plan CRUD with drag-and-drop ordering |
| `/features` | `FeaturesComponent` | 4-level hierarchical feature tree |
| `/add-ons` | `AddOnsComponent` | Standalone purchasable add-on products |
| `/coupons` | `CouponComponent` | Discount coupon management + date picker |
| `/categories` | `CategoriesComponent` | Product category taxonomy |
| `/configurations` | `ConfigurationComponent` | System-wide key-value configuration |
| `/emails` | `EmailsComponent` | Email template editor (CKEditor 5) |
| `/closed-accounts` | `ClosedAccountsComponent` | Deactivated company accounts |
| `/calendar` | `CalendarComponent` | Holiday and off-day management (standalone) |
| `/talk-to-sales` | `TalkToSalesComponent` | Inbound sales inquiry viewer (standalone) |
| `/account-management` | `AccountManagementComponent` | Admin account settings |
| `/users` | `UsersComponent` | Internal back-office user management |
| `/permissions` | `PermissionsComponent` | RBAC — roles and permission assignment (standalone) |
| `/not-allowed` | `NotAllowedComponent` | 403 access denied page |

**Sidebar navigation groups:**
1. Company Management
2. Plans & Packages (Products, Features, Add-ons, Plans, Coupons)
3. Settings (Closed Accounts, Configurations, Emails, Calendar)
4. Security (Users, Roles & Permissions, Account Management)
5. Talk to Sales

---

## State Management

No NgRx. All state managed via RxJS services:

| Service | State | Pattern |
|---|---|---|
| `AuthService` | Auth user info | `BehaviorSubject<iAuthInfo \| null>` |
| `BreadcrumbService` | Page title, breadcrumb, user image | Multiple `BehaviorSubject` streams |
| `DataSharingService` | Spinner visibility, cross-component events | `BehaviorSubject<any>` + `EventEmitter` |
| `SidebarService` | Sidebar open/close | Boolean `BehaviorSubject` |

Permission data lives encrypted in `localStorage` and is read/decrypted on each permission check call (no in-memory caching beyond component lifetime).

---

## HTTP Request System

`HttpClientRequestService` implements a **custom FIFO request queue** — no standard Angular `HttpInterceptor`:

```
request(method, endpoint, body)
    |
    v
Enqueue in FIFO queue
    |
    v
Process sequentially:
    1. Decrypt JWT from localStorage
    2. Set Authorization: Bearer <JWT> header
    3. Encrypt body -> { app_data: "<base64>" }
    4. Execute HTTP call
    5. On success: decrypt response { app_data }
    6. On 401: refresh token -> retry
    7. On 403: show toast error
    8. Dequeue, process next
```

Sequential queueing prevents race conditions on token refresh — if multiple calls fail with 401 simultaneously, only one refresh is triggered and all waiting requests are retried with the new token.

---

## Key Features

### Company Management
- Paginated, searchable list of all tenant companies (active + inactive tabs)
- Per-company stats: active subscriptions, user counts, grace period status, payment status
- Chart.js chart showing employee count distribution
- Invite company owner via email
- Create new company with subscription assignment
- Status toggle (active/inactive) with SweetAlert2 confirmation

### Plans & Packages
- Full CRUD for SaaS subscription plans
- Pricing models: tiered, per-user, one-time
- Angular CDK drag-and-drop for plan module ordering
- Stripe plan ID linkage
- Activation/deactivation toggle

### Feature Management
- 4-level deep hierarchical feature tree
  - Module → Sub-module → Sub-sub-module → Fourth level
- Attach/detach features to specific plans
- Image upload per feature

### Email Templates (CKEditor 5)
Full rich-text email template editor with:
- Bold, Italic, Heading, Alignment, Lists
- Table editor (with caption, column resize, cell properties)
- Image upload + resize + inline/block modes
- HTML source editing
- Font color, background, family, size
- Paste from Office support
- Find & Replace, Page Break, Special Characters

### RBAC — Roles & Permissions
- Create/edit roles
- Assign granular module-level permissions
- Permission matrix: `{ add, view, edit, delete }` per module
- Wildcard `*` for full access

---

## Build & Deployment

**CI/CD:** Bitbucket Pipelines — triggered on `production` branch push

```
git push -> production branch
       |
       v
Bitbucket Pipeline
       |
       v
npm install + ng build --configuration production
       |
       v
Post-build: npx javascript-obfuscator dist/.../main.js
(production bundle is obfuscated for IP protection)
       |
       v
Docker build (multi-stage):
  Stage 1: node:18.20.4 — build Angular app
  Stage 2: nginx:latest — serve on port 9095
       |
       v
Push to Docker Hub: staffviz/staffviz:adminfrontend-<git-sha>
       |
       v
Update Kubernetes kustomization overlay (separate repo)
Kubernetes rolls out new deployment
       |
       v
Email notification (Atlassian pipe)
```

**Named build configurations:** `production`, `staging`, `qa`, `dev`, `development`
Each environment has its own `environment.*.ts` with API base URL and secret key.

**Note:** Production build intentionally disables AOT and optimization (`"aot": false, "optimization": false`) to support the post-build JavaScript obfuscation step.

---

## Getting Started

```bash
npm install

# Development
ng serve                        # http://localhost:4200

# Specific environment
ng serve --configuration dev
ng serve --configuration staging

# Production build
ng build --configuration production

# Lint
ng lint
```

**Environment variables** (configured per `src/environments/environment.*.ts`):
```typescript
export const environment = {
  production: true,
  apiBASEURL: 'https://backofficeapi.staffviz.com/',
  secretKey: 'YOUR_AES_SECRET_KEY',   // AES-256-CBC key for E2E encryption
  imageBaseUrl: 'https://api.staffviz.com/file/',
};
```

## Related Repositories

| Repo | Purpose |
|---|---|
| `sv-admin-panel-api` | Laravel 10 API backend for this panel |
| `sv-user-panel` | Employee-facing Laravel + Vue panel |
| `sv-frontend` | StaffViz marketing site |
