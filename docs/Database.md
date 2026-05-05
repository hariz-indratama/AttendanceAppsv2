This database guide details the implementation of a robust **Model layer** using **Laravel Eloquent** and **Queues** for an industry-grade attendance system. [cite_start]In our decoupled MVC architecture, the database serves as the "Single Source of Truth," managed strictly by the Laravel backend to ensure data integrity for both the Employee PWA and Admin Dashboard[cite: 111, 402, 403].

---

## 1. Industry-Grade Schema Architecture

[cite_start]A production-ready environment requires specialized tables to handle high-frequency logs, biometric security, and automated financial processing[cite: 83, 110, 418, 419].

### A. Core Models & Tables

[cite_start]The system is built upon four primary pillars of data[cite: 4, 403]:

| Model          | Primary Responsibility   | Key Fields                                                                                                                |
| :------------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **User**       | Identity & Payroll Rates | [cite_start]`name`, `email`, `role`, `hourly_rate`, `department_id`, `avatar` [cite: 5, 27, 85, 404-410].                 |
| **Attendance** | Geofenced Shift Logs     | [cite_start]`user_id`, `clock_in`, `clock_out`, `lat_in/long_in`, `status`, `total_hours` [cite: 6, 28, 59, 86, 411-417]. |
| **Payroll**    | Financial Records        | [cite_start]`user_id`, `month`, `year`, `gross_salary`, `net_salary`, `status`[cite: 88, 172, 420, 421].                  |
| **WebAuthn**   | Biometric Public Keys    | [cite_start]`id (UUID)`, `user_id`, `public_key`, `credential_id`, `counter` [cite: 197, 219-223, 423-426].               |

### B. Biometric Security & Geofencing Data

[cite_start]To support **WebAuthn**, the `web_authn_credentials` table stores cryptographic keys linked to the `User` model, ensuring non-transferable biometric access[cite: 190, 196, 422]. [cite_start]Meanwhile, the `attendances` table captures precise GPS coordinates at the moment of clock-in to verify against office geofences[cite: 411, 416].

---

## 2. Eloquent Relationships & Standards

[cite_start]Using Laravel Eloquent allows us to define strict relationships directly in the models, ensuring that data processing remains clean and decoupled from the controllers[cite: 123, 150, 428].

- [cite_start]**Relationship Mapping**: Define a `HasMany` relationship where a `User` has many `Attendance` logs[cite: 360, 428].
- [cite_start]**Strict Typing**: In line with 2026 senior standards, all Eloquent models must utilize **strict type hinting** for parameters and return types (PHP 8.2+) to prevent integrity issues[cite: 313, 336, 429].
- [cite_start]**Decoupled Logic**: Models provide raw data to specialized services—like the `GeofenceService` or `PayrollService`—which process calculations independently of the API layer[cite: 206, 210, 235, 430, 431].

---

## 3. Background Processing with Queues

[cite_start]For an enterprise system, heavy tasks like generating monthly exports or calculating department-wide payroll must be handled asynchronously to prevent API timeouts[cite: 92, 127, 158, 281].

### A. High-Frequency Reporting

[cite_start]Admin users can trigger comprehensive attendance reports for entire departments[cite: 157, 238].

- [cite_start]**Export Jobs**: Use Laravel Queues to aggregate filtered attendance data into CSV, PDF, or Excel formats in the background[cite: 127, 158, 281].
- [cite_start]**Real-time Completion**: Once the background job finishes, use **Laravel Reverb** to push a notification to the Admin dashboard[cite: 50, 78, 142, 165].

### B. Automated Payroll Triggers

The `PayrollService` applies a standard formula to calculate earnings:
$$\text{Net Salary} = (\sum \text{Work Hours} \times \text{Hourly Rate}) + \text{Bonuses} - \text{Deductions}$$
[cite_start]Because calculating this for hundreds of employees is resource-intensive, the system queues these calculations to maintain performance[cite: 90, 115, 141, 160, 205, 230, 285].

---

## 4. Implementation Checklist

- [cite_start]**Migrations**: Use Laravel migrations to securely define all tables, unique constraints, and foreign keys[cite: 83, 123, 358, 427].
- [cite_start]**Data Integrity**: Ensure the WebAuthn `counter` is updated with every authentication to prevent replay attacks[cite: 202, 223, 426].
- [cite_start]**Queue Driver**: Configure a persistent driver (like Redis) to ensure background jobs are not lost during high-traffic periods[cite: 110, 305].

Since we've mapped out the data layer and queue strategy, would you like to see the specific **Eloquent Model class** code with its relationships or the **Job class** for background report generation?
