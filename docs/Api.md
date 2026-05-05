This guide details the development of the **Headless API** for your attendance application. [cite_start]In this decoupled MVC architecture, the **Laravel API** serves as both the **Model** and **Controller** layers, managing data integrity, business logic, and security while strictly returning JSON responses to the Vue 3 frontend[cite: 22, 54, 61, 151].

---

## 1. API Authentication & Security

To maintain industry standards for 2026, the API employs a multi-layered security approach.

- [cite_start]**Sanctum Authentication**: All API routes are secured using **Laravel Sanctum** middleware, requiring a valid **Bearer token** for every request[cite: 115, 139, 163].
- [cite_start]**WebAuthn Handshake**: The API manages the cryptographic "handshake" for biometrics, providing registration options and verifying signed responses from the device's Secure Enclave[cite: 224, 227].
- [cite_start]**Role-Based Access Control (RBAC)**: Controllers are separated by domain (API for employees and Admin for management) to ensure strict permission boundaries[cite: 151].

---

## 2. Employee API Endpoints (The Controller Layer)

The employee endpoints focus on secure logging of time and location data.

| Endpoint                    | Method | Responsibility                                                                              | Required Data                         |
| :-------------------------- | :----- | :------------------------------------------------------------------------------------------ | :------------------------------------ |
| `/api/attendance/clock-in`  | `POST` | [cite_start]Validates location against office geofences and logs the entry[cite: 124, 156]. | [cite_start]`lat`, `long` [cite: 114] |
| `/api/attendance/clock-out` | `POST` | [cite_start]Records shift end and calculates `total_hours`[cite: 124].                      | `lat`, `long`                         |
| `/api/webauthn/register`    | `POST` | [cite_start]Verifies biometric public keys and links them to the User model[cite: 182].     | `attestationResponse`                 |

### Geofencing Validation Logic

[cite_start]The `AttendanceController` does not just record a timestamp; it injects a `GeofenceService` to verify that the provided `lat` and `long` coordinates are within a designated office radius (e.g., 100 meters) before allowing the log to be created[cite: 114, 140, 152].

---

## 3. Admin API Endpoints

[cite_start]The Admin API handles aggregated data management, automated financial processing, and reporting[cite: 147].

- [cite_start]**Employee Management**: Handles full CRUD operations for employee records, including setting the `hourly_rate` required for payroll[cite: 64, 95].
- [cite_start]**Payroll Processing**: The `Admin/PayrollController` triggers a dedicated `PayrollService` to calculate net earnings based on work hours, rates, and automated deduction logic for late arrivals[cite: 126, 159, 212].
- [cite_start]**Report Generation**: Aggregates filtered attendance logs into collections suitable for JSON-to-CSV exports by the frontend[cite: 92, 127, 256].

---

## 4. Standardized JSON Responses

[cite_start]To ensure seamless integration with the **Axios** interceptors in Vue 3, all controllers must adhere to a strict JSON structure[cite: 61, 106, 131].

- [cite_start]**Success Response**: Returns the requested resource or a confirmation message along with appropriate HTTP status codes (e.g., 200 OK, 201 Created)[cite: 61].
- [cite_start]**Error Handling**: Returns structured error messages (e.g., "Out of office radius") with 403 Forbidden or 422 Unprocessable Entity codes to trigger frontend alerts[cite: 178].

---

## 5. Automated Payroll Logic

The API calculates salary using the following backend formula:
$$\text{Net Salary} = (\sum \text{Work Hours} \times \text{Hourly Rate}) + \text{Bonuses} - \text{Deductions}$$
[cite_start]This calculation is processed by the `PayrollService`, which queries the `Attendance` model to sum `total_hours` for a specific month before returning the final JSON result to the Admin dashboard[cite: 160, 205, 206, 237].

Would you like to see the specific **Laravel Route** definitions for these endpoints or the **GeofenceService** class implementation?
