# Attendance App v4 — Project Documentation

**Last Updated:** 2026-05-02

---

## Prerequisites

- **Node.js:** `^20.19.0` or `>=22.12.0`
- **PHP:** `^8.3`
- **Composer:** Latest version

---

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
copy .env.example .env

# Generate application key
php artisan key:generate

# Create SQLite database (Windows)
copy nul database\database.sqlite

# Run migrations
php artisan migrate

# Seed test data
php artisan db:seed

# Start Laravel development server on port 8080
php artisan serve --port=8080
```

The backend will run at: **http://localhost:8080**

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

The frontend will run at: **http://localhost:5173**

### 3. Combined Start (Optional)

For convenience, you can start both servers simultaneously using the composer script:

```bash
cd backend
composer run dev
```

This uses `concurrently` to run all four services:
- `server` — Laravel API (`localhost:8080`)
- `queue` — Queue worker
- `logs` — Error log watcher
- `vite` — Frontend dev server (`localhost:5173`)

**Note:** The API runs on port **8080** (not 8000) to avoid conflicts with other services.

---

## Test Accounts

After running `php artisan db:seed`, the following accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password123` |
| Employee | `john.smith@example.com` | `password123` |
| Employee | `sarah.johnson@example.com` | `password123` |
| Employee | `michael.chen@example.com` | `password123` |
| Employee | `emily.davis@example.com` | `password123` |
| Employee | `robert.wilson@example.com` | `password123` |

---

## Testing the Pages

### Testing Admin Page

1. **Login as Admin:**
   - Go to `http://localhost:5173/login`
   - Enter: `admin@example.com` / `password123`
   - Click "Sign In"

2. **Dashboard (`/admin`):**
   - View KPI cards (present, late, absent counts)
   - Browse employee overview
   - See real-time activity log

3. **Employees Management (`/admin/employees`):**
   - View all employees in table
   - Add new employee via "Add Employee" button
   - Edit employee by clicking row action
   - Delete employee with confirmation

4. **Attendance (`/admin/attendance`):**
   - View all attendance records
   - Filter by date range, status, or employee
   - Export data to CSV

5. **Payroll (`/admin/payroll`):**
   - Configure per-employee hourly rates
   - Process monthly payroll
   - Preview payslips with breakdown
   - Export to Excel/PDF

6. **Reports (`/admin/reports`):**
   - Generate monthly attendance reports
   - Select date range
   - Export to PDF

7. **Settings (`/admin/settings`):**
   - Configure office location (lat/long)
   - Set geofence radius
   - Adjust system preferences

### Testing Employee Page

1. **Login as Employee:**
   - Go to `http://localhost:5173/login`
   - Enter: `john.smith@example.com` / `password123`
   - Click "Sign In"

2. **Clock In/Out (`/`):**
   - View dashboard with clock in/out functionality
   - If within geofence, "Clock In" button is enabled
   - If already clocked in, "Clock Out" button appears
   - View current status and today's hours

3. **History (`/history`):**
   - Monthly calendar view
   - Green dots = Present, Yellow = Late, Red = Absent
   - Tap any day to see clock-in/out details
   - Navigate between months

4. **Profile (`/profile`):**
   - **Overview Tab:** View personal info, work stats, biometric status
   - **Attendance Tab:** Calendar with color-coded attendance dots
   - **Payroll Tab:** Recent payslip summaries

---

## Route Overview

| Role | Path | Page |
|------|------|------|
| All | `/login` | Login Page |
| All | `/register` | Register Page |
| Employee | `/` | Clock Dashboard |
| Employee | `/clock` | Clock Page |
| Employee | `/history` | Attendance History |
| Employee | `/profile` | Employee Profile |
| Admin | `/admin` | Admin Dashboard |
| Admin | `/admin/employees` | Employee Management |
| Admin | `/admin/attendance` | Attendance Records |
| Admin | `/admin/payroll` | Payroll Processing |
| Admin | `/admin/reports` | Reports |
| Admin | `/admin/settings` | System Settings |

---

## API Endpoints Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout current user |
| GET | `/api/auth/me` | Get current user info |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/{id}` | Update user |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/attendance` | List all attendance |
| GET | `/api/admin/payroll/process` | Process payroll |

### Employee Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/clock-in` | Clock in |
| POST | `/api/attendance/clock-out` | Clock out |
| GET | `/api/attendance/today` | Today's attendance |
| GET | `/api/attendance/history` | Attendance history |

---

## Project Structure

```
Attendance_Apps v4/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/  # API Controllers
│   │   ├── Models/            # Eloquent Models
│   │   └── Services/          # Business Logic
│   ├── database/
│   │   ├── migrations/        # Database schema
│   │   └── seeders/           # Test data seeders
│   ├── routes/
│   │   └── api.php           # API routes
│   └── ...
│
├── frontend/                   # Vue 3 SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin pages
│   │   │   └── employee/    # Employee pages
│   │   ├── router/           # Vue Router config
│   │   ├── stores/           # Pinia stores
│   │   └── types/            # TypeScript types
│   └── ...
│
└── docs/                       # Documentation
    └── superpowers/
        └── specs/             # Design specs
```

---

## Useful Commands

### Backend
```bash
# Clear config cache
php artisan config:clear

# Run tests
php artisan test

# Re-seed database
php artisan db:seed --force

# Reset database
php artisan migrate:fresh --seed

# List routes
php artisan route:list
```

### Frontend
```bash
# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Seeded Data Summary

After `php artisan db:seed`:

- **6 Users:** 1 admin + 5 employees
- **3 Departments:** IT, HR, Finance
- **1 Office Location:** Headquarters (Jakarta)
- **~93 Attendance Records:** 30 days of history per employee (weekends excluded)