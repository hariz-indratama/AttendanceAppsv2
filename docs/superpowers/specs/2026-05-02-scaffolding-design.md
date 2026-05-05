# Scaffolding Specification

**Date:** 2026-05-02
**Project:** Industry-Grade Attendance System
**Phase:** Initial Scaffolding

---

## 1. Project Overview

Full-stack attendance system with:
- **Backend:** Laravel 13 (Headless API) with Sanctum auth
- **Frontend:** Vue 3 + Vite + TypeScript SPA
- **PWA:** Mobile-first employee clock-in/out
- **Admin:** Desktop-optimized HR dashboard

---

## 2. Directory Structure

```
attendance-app/
├── backend/                          # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/                  # Employee API controllers
│   │   │   └── Admin/                 # Admin controllers
│   │   ├── Models/                   # Eloquent models
│   │   ├── Services/                  # Business logic (GeofenceService, PayrollService)
│   │   ├── Exceptions/               # Custom exception classes
│   │   └── Http/Middleware/          # Custom middleware
│   ├── database/migrations/          # All migration files
│   ├── config/                       # Laravel config (sanctum, etc.)
│   └── routes/
│       ├── api.php                   # API routes
│       └── web.php                   # Web routes
├── frontend/                         # Vue 3 SPA
│   ├── src/
│   │   ├── api/                      # Axios client with interceptors
│   │   ├── components/ui/             # Shadcn/UI components
│   │   ├── composables/              # Vue composables
│   │   ├── layouts/                  # Employee & Admin layouts
│   │   ├── lib/                      # Utilities (cn, etc.)
│   │   ├── pages/
│   │   │   ├── admin/                # Admin pages
│   │   │   └── employee/             # Employee pages
│   │   ├── router/                   # Vue Router config
│   │   ├── store/                    # Pinia stores
│   │   └── types/                    # TypeScript interfaces
│   ├── tailwind.config.js
│   └── vite.config.ts
└── docs/                             # Project documentation
```

---

## 3. Backend Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Laravel | 13.x |
| Auth | Sanctum | 4.x |
| Biometrics | web-auth/webauthn-lib | 5.x |
| Database | SQLite (dev) / MySQL (prod) | - |
| Queue | Redis (optional) | - |

### Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Extended with role, hourly_rate, department_id, avatar |
| `departments` | Company departments |
| `office_locations` | Geofence office locations |
| `attendances` | Clock-in/out logs with GPS |
| `leave_requests` | Employee leave management |
| `payrolls` | Monthly salary records |
| `web_authn_credentials` | WebAuthn public keys |
| `personal_access_tokens` | Sanctum tokens |

---

## 4. Frontend Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Vue 3 | 3.5.x |
| Build | Vite | 8.x |
| Language | TypeScript | strict |
| State | Pinia | latest |
| HTTP | Axios | latest |
| Routing | Vue Router | 4.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | Shadcn-vue / Reka UI | latest |
| PWA | vite-plugin-pwa | 1.x |
| Icons | Lucide Vue | latest |

### TypeScript Interfaces

All API responses use strict TypeScript interfaces:
- `User`, `Attendance`, `LeaveRequest`, `Payroll`
- `ApiResponse<T>`, `PaginatedResponse<T>`
- `GeofenceLocation`, `ClockInRequest`, `ClockOutRequest`

---

## 5. Services (Backend)

### GeofenceService
- Haversine formula for GPS distance calculation
- Validates employee is within 100m of office
- Server-side verification (no client GPS spoofing)

### PayrollService
- Calculates: `Net Salary = (Total Hours × Hourly Rate) + Bonuses - Deductions`
- Overtime: 1.5x multiplier for hours > 160/month
- Late deductions: $0.50 per late arrival

---

## 6. API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout ( Sanctum )
- `GET /api/auth/user` - Get authenticated user
- `POST /api/auth/refresh` - Refresh token

### Employee Attendance
- `POST /api/attendance/clock-in` - Clock in with GPS verification
- `POST /api/attendance/clock-out` - Clock out with GPS
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/history` - Get attendance history

### Admin
- `GET /api/admin/employees` - List all employees
- `POST /api/admin/employees` - Create employee
- `GET /api/admin/attendances` - View all attendances
- `POST /api/admin/payroll/generate` - Generate payroll
- `GET /api/admin/reports/export` - Export reports

---

## 7. Environment Variables

### Backend (.env)
```
APP_NAME=AttendanceApp
APP_ENV=local
APP_KEY=
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database.sqlite

FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

---

## 8. Next Steps

1. Configure CORS in Laravel for frontend origin
2. Implement AuthController (register, login, logout)
3. Implement AttendanceController (clock-in/out with geofence)
4. Build LoginPage.vue with form validation
5. Build EmployeeLayout with navigation
6. Add WebAuthn registration/verification flow

---

## 9. Verification

- [x] Laravel backend scaffolded with Sanctum
- [x] Vue 3 frontend scaffolded with TypeScript + Tailwind v4
- [x] Shadcn-vue components configured
- [x] Pinia + Vue Router installed
- [x] All database migrations created and run
- [x] Eloquent models with relationships
- [x] GeofenceService + PayrollService implemented
- [x] TypeScript interfaces for all entities
- [x] Axios client with token interceptors
- [x] Router with auth guards and role-based routing