This documentation outlines the architecture, security protocols, and implementation details for an industry-grade attendance application. [cite_start]Utilizing a **decoupled MVC architecture**, the system employs **Laravel** as a headless API (Model and Controller) and **Vue 3** as a standalone Single Page Application (View)[cite: 22, 54, 111]. [cite_start]This separation ensures high scalability, allowing the employee-facing PWA and the admin dashboard to evolve independently[cite: 23, 55, 120].

---

## 1. System Architecture

[cite_start]The project is structured as two independent entities communicating via a secure JSON API[cite: 24, 113, 121].

### A. Backend: Laravel API (Headless)

[cite_start]The backend manages data integrity, complex business logic, and security[cite: 111, 122].

- [cite_start]**Models (M)**: Core data structures including `User`, `Attendance`, `LeaveRequest`, and `Payroll`[cite: 83, 123].
- [cite_start]**Controllers (C)**: Separated by domain (API and Admin) to strictly return JSON responses[cite: 30, 61, 90].
- [cite_start]**Services**: A dedicated layer for complex logic such as `PayrollService` and `GeofenceService`[cite: 128].

### B. Frontend: Vue 3 + Vite (The View)

[cite_start]The frontend is split into two distinct user experiences using **Tailwind CSS** and **Shadcn/UI**[cite: 46, 66, 130].

- [cite_start]**Employee PWA**: A mobile-first interface optimized for field use with offline capabilities via `vite-plugin-pwa`[cite: 36, 67, 102, 143].
- [cite_start]**Admin Dashboard**: A desktop-optimized environment for HR management with advanced data tables and visualization[cite: 71, 72, 133].

---

## 2. Detailed Project Structure

```text
/attendance-app
├── /backend (Laravel API)
│   ├── app/Http/Controllers/
[cite_start]│   │   ├── Api/AttendanceController.php   # Secure clocking logic [cite: 124]
[cite_start]│   │   ├── Admin/PayrollController.php    # Salary calculations [cite: 126]
[cite_start]│   │   └── Admin/ReportController.php     # Export logic [cite: 127]
[cite_start]│   ├── app/Models/                        # User, Attendance, Payroll [cite: 123]
[cite_start]│   ├── app/Services/                      # Geofencing & Payroll logic [cite: 128]
[cite_start]│   └── database/migrations/               # Secure table definitions [cite: 129]
└── /frontend (Vue 3 SPA)
    [cite_start]├── src/api/axios.js                   # Interceptors with Bearer tokens [cite: 131]
    [cite_start]├── src/store/auth.js                  # Pinia state management [cite: 132]
    [cite_start]├── src/layouts/                       # Admin vs. Employee layouts [cite: 133, 134]
    [cite_start]└── src/pages/                         # PWA & Admin views [cite: 135, 136]
```

---

## 3. Core Features & Business Logic

### A. Secure Attendance & Geofencing

[cite_start]The `AttendanceController` validates that an employee is physically within a designated office radius (e.g., 100 meters) using GPS coordinates before a clock-in is permitted[cite: 8, 17, 76, 140].

### B. Salary Calculation & Reporting

[cite_start]Admin users can generate comprehensive attendance reports and calculate payroll automatically[cite: 79, 135].

- [cite_start]**Report Generation**: Aggregates filtered attendance data for export into CSV, PDF, or Excel formats[cite: 65, 92, 127].
- [cite_start]**Payroll Formula**: The system calculates earnings based on work hours, rates, and deductions[cite: 90, 115, 141].

$$\text{Net Salary} = (\sum \text{Work Hours} \times \text{Hourly Rate}) + \text{Bonuses} - \text{Deductions}$$

[cite_start]The calculation logic specifically accounts for late arrivals and unapproved leaves to ensure data accuracy[cite: 94, 141].

---

## 4. Security & Infrastructure Standards

For a robust 2026 production environment, the following protocols are enforced:

| Feature                | Standard        | Implementation Detail                                                                                |
| :--------------------- | :-------------- | :--------------------------------------------------------------------------------------------------- |
| **Authentication**     | Laravel Sanctum | [cite_start]Requires valid Bearer tokens for all API requests[cite: 44, 56, 139].                    |
| **Biometrics**         | WebAuthn API    | [cite_start]Enables non-transferable FaceID or Fingerprint clock-ins on mobile[cite: 18, 49, 138].   |
| **Real-time**          | Laravel Reverb  | [cite_start]Pushes instant notifications and live updates to the Admin dashboard[cite: 50, 78, 142]. |
| **PWA**                | Vite PWA        | [cite_start]Offline-first capabilities and "Add to Home Screen" support[cite: 12, 38, 143].          |
| **Data Visualization** | Vue-Chartjs     | [cite_start]High-level trend analysis integrated within Shadcn Card components[cite: 15, 42, 144].   |

---

## 5. Database Schema (Essential Fields)

| Model            | Primary Responsibilities | Key Fields                                                                                |
| :--------------- | :----------------------- | :---------------------------------------------------------------------------------------- |
| **User**         | Authentication & Rates   | [cite_start]`name`, `email`, `role`, `hourly_rate`, `department_id`[cite: 5, 27, 85].     |
| **Attendance**   | Clocking Logs            | [cite_start]`user_id`, `clock_in`, `clock_out`, `total_hours`, `status`[cite: 6, 28, 86]. |
| **LeaveRequest** | Absence Management       | [cite_start]`user_id`, `type`, `start_date`, `end_date`, `status`[cite: 6, 29, 87].       |
| **Payroll**      | Financial Records        | [cite_start]`user_id`, `month`, `year`, `gross_salary`, `net_salary`, `status`[cite: 88]. |

Would you like to see the specific code implementation for the Geofence service or the WebAuthn registration flow?
