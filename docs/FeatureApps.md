[cite_start]This guide provides a blueprint for developing features within your attendance application using a **decoupled MVC architecture**[cite: 22, 54, 111]. [cite_start]By treating **Laravel** as a headless API (Model and Controller) and **Vue 3** as a standalone Single Page Application (View), you can ensure each feature is secure, scalable, and type-safe for a 2026 production environment[cite: 146, 266, 305].

---

## 1. The Model Layer (Data & Rules)

The **Model** represents the data structure and underlying business rules. [cite_start]In an industry-grade app, this layer must handle data integrity and relationships strictly[cite: 111, 122].

- [cite_start]**Schema Definition**: Use Laravel migrations to define secure tables[cite: 83, 123]. [cite_start]For example, the `Payroll` model must track `gross_salary`, `net_salary`, and payment `status`[cite: 88, 172].
- [cite_start]**Business Rules**: Define constants and relationships (e.g., a `User` has many `Attendance` logs) directly in the model to maintain a "Single Source of Truth"[cite: 123, 150].

---

## 2. The Controller Layer (Traffic & Routing)

[cite_start]The **Controller** acts as the intermediary, handling incoming requests and returning standardized JSON responses to the frontend[cite: 30, 61, 90, 151].

- [cite_start]**Domain Separation**: Separate controllers by user role to enforce strict **Role-Based Access Control (RBAC)**[cite: 151, 270].
  - [cite_start]**Employee API**: Focuses on secure actions like `clockIn()` and `clockOut()`[cite: 7, 31, 271].
  - [cite_start]**Admin API**: Manages high-level tasks like employee CRUD, reporting, and payroll triggers[cite: 93, 126, 212, 278].
- [cite_start]**Security Middleware**: Protect all feature routes with **Laravel Sanctum** to require valid Bearer tokens[cite: 115, 139, 163, 268].

---

## 3. The Service Layer (Complex Business Logic)

[cite_start]To keep controllers lean and follow **SOLID principles**, move complex calculations into a dedicated **Service Layer**[cite: 128, 152, 204, 318].

- [cite_start]**GeofenceService**: Calculates location validity using the **Haversine formula** to ensure employees are within a 100-meter office radius before a clock-in is recorded[cite: 114, 140, 152, 177].
- [cite_start]**PayrollService**: Aggregates monthly work hours and applies the industry-standard formula to calculate earnings[cite: 115, 159, 205, 230]:
  $$\text{Net Salary} = (\sum \text{Work Hours} \times \text{Hourly Rate}) + \text{Bonuses} - \text{Deductions}$$

---

## 4. The View Layer (UI & State Management)

[cite_start]The **View** is responsible for the user interface and local state management using **Vue 3**, **Tailwind CSS**, and **Shadcn/UI**[cite: 46, 66, 130, 153].

- [cite_start]**Mobile-First PWA (Employee)**: Use `vite-plugin-pwa` for offline-first capabilities and native-like installation[cite: 38, 143, 166, 249]. [cite_start]Features include biometric clock-ins via the **WebAuthn API**[cite: 138, 164, 179].
- **Web Dashboard (Admin)**: A desktop-optimized hub for HR. [cite_start]Use Shadcn's **DataTable** for record management and **Vue-Chartjs** for visualizing attendance trends[cite: 71, 74, 101, 255].
- [cite_start]**State Management**: Use **Pinia** to manage global states such as authentication status and real-time alerts pushed via **Laravel Reverb**[cite: 39, 105, 132, 165].

---

## 5. Development & Quality Standards

[cite_start]To ensure the feature set meets senior-level standards, follow these strict development guides[cite: 306, 330]:

| Standard            | Tool / Protocol        | Requirement                                                                                                                  |
| :------------------ | :--------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Type Safety**     | **TypeScript (TS)**    | [cite_start]Mandatory; no use of `any`; interfaces required for all API responses[cite: 308, 331, 334].                      |
| **Static Analysis** | **PHPStan / ESLint**   | [cite_start]Backend level 8+; frontend strict linting for explicit return types[cite: 310, 314, 333, 337].                   |
| **Communication**   | **Axios Interceptors** | [cite_start]Automatically attach Bearer tokens and handle global token refreshes[cite: 116, 131, 243, 326].                  |
| **Error Handling**  | **Custom Exceptions**  | [cite_start]Return standardized JSON (e.g., 403 for Geofence failures) to trigger frontend alerts[cite: 178, 284, 317, 341]. |

Is there a specific feature, such as **Leave Request management** or **Real-time Map tracking**, you would like to map out using this MVC blueprint?
