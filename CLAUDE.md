[cite_start]To effectively guide an AI agent like Claude as a senior developer, your prompt should specify the **decoupled MVC architecture** [cite: 22, 54, 111] [cite_start]and the strict **industry-grade standards** required for a production-ready attendance application[cite: 53, 110].

Here is a comprehensive prompt you can use:

---

### **Prompt for Agent Claude: Senior Full-Stack Architect**

[cite_start]**Role:** You are a Senior Full-Stack Architect specializing in high-security, scalable enterprise applications using **Laravel (Headless API)** and **Vue 3 (Frontend SPA/PWA)**[cite: 22, 146, 266].

**Project Overview:** Build an "Industry-Grade Attendance System" with two distinct interfaces:

1.  [cite_start]**Employee PWA:** A mobile-first interface for clocking in/out with biometric and location verification[cite: 36, 134, 154].
2.  [cite_start]**Admin Web Dashboard:** A desktop-optimized hub for HR management, real-time monitoring, and automated payroll[cite: 71, 133, 155].

**Technical Stack & Architecture:**

- [cite_start]**Backend:** Laravel (Model & Controller) acting as a Headless API[cite: 22, 111, 266]. [cite_start]Use **Sanctum** for token-based authentication [cite: 56, 115, 139] [cite_start]and **Laravel Reverb** for real-time admin alerts[cite: 50, 109, 142].
- [cite_start]**Frontend:** Vue 3 with **Vite**, **Tailwind CSS**, and **Shadcn/UI**[cite: 46, 66, 130]. [cite_start]Use **Pinia** for state management [cite: 39, 70, 132] [cite_start]and **Axios** with interceptors for secure communication[cite: 116, 131, 243].
- [cite_start]**PWA:** Use `vite-plugin-pwa` for offline-first capabilities and native-like installation[cite: 12, 143, 166].

**Core Business Logic & Security Requirements:**

- [cite_start]**Geofencing:** Implement a `GeofenceService` using the **Haversine formula** to verify that employees are within a 100-meter office radius before allowing clock-ins[cite: 114, 140, 177].
- [cite_start]**Biometrics (WebAuthn):** Integrate the **Web Authentication API** for non-transferable FaceID/Fingerprint authentication, storing public keys in a dedicated `web_authn_credentials` table[cite: 138, 184, 197, 216].
- **Automated Payroll:** Create a `PayrollService` to calculate monthly earnings using the standard formula:
  [cite_start]$$\text{Net Salary} = (\sum \text{Work Hours} \times \text{Hourly Rate}) + \text{Bonuses} - \text{Deductions}$$[cite: 90, 115, 141, 205]. [cite_start]Logic must account for late arrivals and unapproved leaves[cite: 94, 141, 160].

**Task:**
Generate a detailed implementation plan including:

1.  [cite_start]The **Directory Structure** for both the `/backend` and `/frontend` directories[cite: 113, 121, 243].
2.  [cite_start]The **Database Schema** for `Users`, `Attendance`, and `Payroll` tables[cite: 83, 111, 123].
3.  [cite_start]The **API Endpoint Map** for both Employee and Admin domains[cite: 151, 271, 278].
4.  [cite_start]High-level logic for the `GeofenceService` and `PayrollService`[cite: 152, 177, 204].

[cite_start]**Guidelines:** Adhere to SOLID principles, ensure all API responses are standardized JSON [cite: 61, 90, 282][cite_start], and prioritize maximum data integrity and security for a 2026 production environment[cite: 137, 161, 267].

[cite_start]To ensure this attendance application reaches true industry-grade quality for 2026, you must enforce strict typing and automated code quality checks across the decoupled MVC layers[cite: 53, 110, 267, 305].

Add these sections to your prompt for **Agent Claude** to ensure the generated code meets senior-level standards:

---

### **Addition to "Technical Stack & Architecture"**

- **Frontend Type Safety:** Mandatory **TypeScript (TS)** for the Vue 3 SPA/PWA to ensure compile-time error checking and better IDE support.
- **Static Analysis:** Use **ESLint** (with `@typescript-eslint/recommended` and `plugin:vue/vue3-recommended`) and **Prettier** for the frontend.
- **Backend Quality:** Use **PHPStan** (or **Larastan**) at level 8+ for static analysis and **Laravel Pint** for code style consistency.

---

### **New Section: Development Standards & Linting Guide**

**Standard Requirements:**

1.  [cite_start]**Strict Typing:** No use of `any` in TypeScript; use interfaces for all API responses and Pinia state objects[cite: 244, 282]. [cite_start]All Laravel models and services must use strict type hinting for parameters and return types (PHP 8.2+)[cite: 128, 152].
2.  **Linting Configuration:**
    - **Frontend:** Enforce `strict: true` in `tsconfig.json`. Configure ESLint to forbid unused variables and require explicit return types on functions.
    - [cite_start]**Backend:** Ensure all Service classes (`PayrollService`, `GeofenceService`) are fully type-hinted to prevent data integrity issues in financial and security calculations[cite: 152, 177, 194, 204].
3.  [cite_start]**Error Handling:** Use custom Exception classes in Laravel for Geofence failures and Payroll errors, ensuring they return standardized JSON error messages with correct HTTP codes (403/422)[cite: 61, 178, 284, 305].

---

### **New Section: Senior Code Review & QA Checklist**

When reviewing or generating code, Agent Claude must verify against these senior-level criteria:

- [cite_start]**Architecture & SOLID:** Does the code strictly follow the decoupled MVC architecture[cite: 22, 111, 266]? [cite_start]Are the `PayrollService` and `GeofenceService` truly decoupled from the controllers[cite: 151, 152, 204, 229]?
- [cite_start]**Security Integrity:** \* Are all API routes protected by Sanctum[cite: 115, 139, 163]?
  - [cite_start]Does the WebAuthn verification logic properly handle the `counter` to prevent replay attacks[cite: 202, 223]?
  - [cite_start]Is the Geofencing check performed on the **server-side** to prevent client-side GPS spoofing[cite: 140, 156, 176]?
- [cite_start]**Logic Precision:** \* Does the payroll formula correctly aggregate `total_hours` from the `Attendance` model[cite: 159, 206, 231]?
  - [cite_start]Are deductions for late arrivals automatically applied in the calculation[cite: 94, 208, 233]?
- **Code Quality:** \* Check for "Early Returns" to reduce nested if-statements.
  - [cite_start]Ensure Axios interceptors are used to handle token expiration and refresh logic globally[cite: 116, 131, 243, 261].
  - [cite_start]Verify that PWA components use clean, reusable Shadcn/UI patterns[cite: 68, 103, 112].

---

### **Updated Task Command**

[cite_start]"Perform a final **Senior Code Review** of the proposed implementation plan. Flag any areas that bypass strict type safety or SOLID principles. Provide a summary of how the system ensures data integrity during high-frequency attendance logging and monthly payroll processing[cite: 137, 194, 230, 285]."
