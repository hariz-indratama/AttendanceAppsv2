[cite_start]To ensure this attendance application reaches true industry-grade quality for 2026, you must enforce strict typing and automated code quality checks across the decoupled MVC layers[cite: 305, 306]. Incorporate these sections into your prompt for **Agent Claude** to ensure the generated code meets senior-level standards.

## 1. Technical Stack & Architecture Additions

- [cite_start]**Frontend Type Safety**: Mandatory **TypeScript (TS)** for the Vue 3 SPA/PWA to ensure compile-time error checking and better IDE support[cite: 308].
- [cite_start]**Static Analysis**: Use **ESLint** (with `@typescript-eslint/recommended` and `plugin:vue/vue3-recommended`) and **Prettier** for the frontend[cite: 309].
- [cite_start]**Backend Quality**: Use **PHPStan** (or **Larastan**) at level 8+ for static analysis and **Laravel Pint** for code style consistency[cite: 310].

---

## 2. Development Standards & Linting Guide

### A. Strict Typing Standards

- [cite_start]**Frontend**: Forbid the use of `any` in TypeScript; use interfaces for all API responses and Pinia state objects[cite: 311, 312].
- [cite_start]**Backend**: All Laravel models and services must use strict type hinting for parameters and return types (PHP 8.2+)[cite: 313].

### B. Configuration & Linting

- [cite_start]**Frontend Configuration**: Enforce `strict: true` in `tsconfig.json`[cite: 314]. [cite_start]Configure ESLint to forbid unused variables and require explicit return types on functions[cite: 315].
- [cite_start]**Service Layer Safety**: Ensure all Service classes (`PayrollService`, `GeofenceService`) are fully type-hinted to prevent data integrity issues in financial and security calculations[cite: 316].

### C. Error Handling

- [cite_start]**Custom Exceptions**: Use custom Exception classes in Laravel for Geofence failures and Payroll errors[cite: 317].
- [cite_start]**Standardized Responses**: Ensure these exceptions return standardized JSON error messages with correct HTTP codes, such as **403 Forbidden** or **422 Unprocessable Entity**[cite: 178, 284, 317].

---

## 3. Senior Code Review & QA Checklist

When reviewing or generating code, Agent Claude must verify against these senior-level criteria:

- [cite_start]**Architecture & SOLID**: Does the code strictly follow the decoupled MVC architecture[cite: 22, 111, 318]? [cite_start]Are the `PayrollService` and `GeofenceService` truly decoupled from the controllers[cite: 151, 152, 204, 319]?
- **Security Integrity**:
  - [cite_start]Are all API routes protected by **Sanctum**[cite: 115, 139, 320]?
  - [cite_start]Does the WebAuthn verification logic properly handle the `counter` to prevent replay attacks[cite: 202, 321]?
  - [cite_start]Is the Geofencing check performed on the **server-side** to prevent client-side GPS spoofing[cite: 140, 156, 322]?
- **Logic Precision**:
  - [cite_start]Does the payroll formula correctly aggregate `total_hours` from the `Attendance` model[cite: 159, 206, 323]?
  - [cite_start]Are deductions for late arrivals automatically applied in the calculation[cite: 94, 208, 324]?
- **General Code Quality**:
  - [cite_start]Check for "**Early Returns**" to reduce nested if-statements[cite: 325].
  - [cite_start]Ensure **Axios interceptors** are used to handle token expiration and refresh logic globally[cite: 116, 131, 261, 326].
  - [cite_start]Verify that PWA components use clean, reusable **Shadcn/UI** patterns[cite: 68, 103, 327].

---

## 4. Updated Task Command for Agent Claude

> [cite_start]"Perform a final **Senior Code Review** of the proposed implementation plan. Flag any areas that bypass strict type safety or SOLID principles. Provide a summary of how the system ensures data integrity during high-frequency attendance logging and monthly payroll processing[cite: 137, 194, 230, 285]."
