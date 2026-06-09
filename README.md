# StaffViz Admin Panel (Angular)

Angular 18 single-page admin back-office for the **StaffViz** workforce-management SaaS. Communicates exclusively with the `sv-admin-panel-api` REST backend.

![Angular](https://img.shields.io/badge/Angular-18.2-DD0031?style=flat&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat&logo=bootstrap&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.3-FF6384?style=flat&logo=chartdotjs&logoColor=white)
![ng-bootstrap](https://img.shields.io/badge/ng--bootstrap-17-563D7C?style=flat)

## Features

| Route | Feature |
|---|---|
| `/company-management` | View, activate, deactivate, and manage all registered companies |
| `/plans-packages` | Create and manage Stripe-backed subscription plans |
| `/features` | Define module-level feature flags per plan |
| `/add-ons` | Manage optional add-on modules |
| `/coupons` | Create and apply discount coupons |
| `/categories` | Plan categories (per-unit / one-time pricing types) |
| `/closed-accounts` | View and action account-closure requests |
| `/configurations` | Global system configuration |
| `/calendar` | Holiday calendar management |
| `/emails` | Email template editor |
| `/talk-to-sales` | Sales-enquiry leads inbox |
| `/users` | Admin user management with roles and permissions |
| `/permissions` | Role-based permission matrix |

**UI:** CKEditor 5 + TinyMCE rich-text editors, SweetAlert2 modals, searchable multi-select dropdowns, Chart.js dashboards, ngx-pagination, Angular datetime picker, toast notifications.

**Auth:** JWT with `AuthGuard`, permission resolver on protected routes.

## Architecture

```
sv-angular-panel (SPA)
  └── HTTP (Sanctum auth) → sv-admin-panel-api (Laravel REST)
```

## Getting Started

```bash
npm install

# Dev server (proxies to API at http://localhost)
npm start         # ng serve

# Production build
npm run build     # output: dist/staffviz_admin_portal/

# Obfuscate for deployment
npm run obfuscate
```

## Environment

Configure `src/environments/environment.ts`:

| Variable | Purpose |
|---|---|
| `apiUrl` | Base URL of `sv-admin-panel-api` |
| `production` | `true` for production builds |

## License
MIT
