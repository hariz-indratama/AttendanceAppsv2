This comprehensive summary outlines the architecture, security, and implementation standards for a robust, industry-grade attendance system. [cite_start]Utilizing a **decoupled MVC architecture**, the project employs **Laravel** as a headless API and **Vue 3** as a standalone Single Page Application (SPA), ensuring high scalability and independent evolution of the employee-facing and admin-facing interfaces[cite: 22, 54, 111, 147].

---

### 1. System Architecture & Project Structure

[cite_start]The application is built as two independent entities communicating through a secure JSON API[cite: 24, 148].

- [cite_start]**Backend (Laravel API)**: Acts as the **Model** and **Controller** layers, managing data integrity, complex business logic, and security[cite: 22, 24, 111, 266].
  - [cite_start]**Core Models**: Includes `User`, `Attendance`, `LeaveRequest`, `Payroll`, and `WebAuthn` credentials[cite: 4, 83, 123, 150].
  - [cite_start]**Service Layer**: A dedicated logic layer for complex calculations, such as the `GeofenceService` and `PayrollService`, keeping controllers lean and following **SOLID principles**[cite: 128, 152, 204, 318, 366].
- [cite_start]**Frontend (Vue 3 + Vite)**: Acts as the **View** layer, split into two distinct experiences using **Tailwind CSS** and **Shadcn/UI**[cite: 46, 66, 112, 130, 241].
  - [cite_start]**Employee PWA**: A mobile-first interface optimized for field use with offline-first capabilities via `vite-plugin-pwa`[cite: 36, 143, 154, 166].
  - [cite_start]**Admin Dashboard**: A desktop-optimized environment for HR management featuring advanced data tables and real-time visualization[cite: 71, 133, 155].

---

### 2. Core Business Logic & Features

The system automates complex time-tracking and financial processes through specialized services.

- [cite_start]**Geofencing Validation**: The backend verifies that an employee is physically within a designated 100-meter office radius using GPS coordinates before a clock-in is permitted[cite: 8, 17, 76, 114, 140, 156].
- [cite_start]**Automated Payroll Calculation**: The `PayrollService` aggregates monthly work hours and applies the industry-standard formula[cite: 115, 159, 205, 230]:
  $$\text{Net Salary} = (\sum \text{Work Hours} \times \text{Hourly Rate}) + \text{Bonuses} - \text{Deductions}$$
  [cite_start]The logic specifically accounts for late arrivals and unapproved leaves to ensure maximum data accuracy[cite: 94, 141, 160, 208].
- [cite_start]**Reporting Hub**: Admins can trigger comprehensive attendance reports for entire departments, which are processed in the background using **Laravel Queues** and exported to CSV, PDF, or Excel formats[cite: 65, 127, 158, 281, 449].

---

### 3. Security & Data Integrity

For a production-ready environment in 2026, the application enforces multi-layered security protocols.

- [cite_start]**Authentication**: All API routes are secured via **Laravel Sanctum**, requiring valid **Bearer tokens** for every request[cite: 44, 56, 115, 139, 268].
- [cite_start]**Biometrics (WebAuthn)**: Integrates the Web Authentication API to allow non-transferable FaceID or Fingerprint clock-ins, linking physical identity to the `User` model through cryptographic keys[cite: 18, 49, 138, 164, 179, 190].
- [cite_start]**Real-time Infrastructure**: **Laravel Reverb** pushes instant notifications and live attendance alerts directly to the Admin dashboard[cite: 50, 78, 109, 117, 142].
- [cite_start]**Data Reliability**: Uses a persistent queue driver (like **Redis**) for background jobs and ensures the WebAuthn `counter` is updated with every login to prevent replay attacks[cite: 202, 223, 426, 455].

---

### 4. Development & Quality Standards

[cite_start]To maintain senior-level quality, the project adheres to strict technical requirements[cite: 306, 330, 375].

| Standard            | Tool / Protocol        | Requirement                                                                                                                                     |
| :------------------ | :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type Safety**     | **TypeScript (TS)**    | [cite_start]Mandatory for frontend; no use of `any`; interfaces for all API responses and state objects[cite: 308, 311, 331, 377].              |
| **Static Analysis** | **PHPStan / ESLint**   | [cite_start]Backend level 8+; frontend strict linting for explicit return types and unused variables[cite: 310, 314, 315, 333, 378].            |
| **Code Style**      | **Prettier / Pint**    | [cite_start]Automated formatting for consistent code style across the entire repository[cite: 309, 310, 332].                                   |
| **Communication**   | **Axios Interceptors** | [cite_start]Automatically attach tokens and handle global expiration/refresh logic[cite: 116, 131, 243, 326, 379].                              |
| **Error Handling**  | **Custom Exceptions**  | [cite_start]Return standardized JSON (e.g., 403 Forbidden for geofence failures) with correct HTTP status codes[cite: 178, 284, 317, 341, 380]. |
