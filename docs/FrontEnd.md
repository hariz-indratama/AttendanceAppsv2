[cite_start]This guide details the frontend implementation for the attendance application using **Vue 3**, **Tailwind CSS**, and **Shadcn/UI**[cite: 1, 46]. [cite_start]In this decoupled MVC architecture, the frontend acts as a standalone **Single Page Application (SPA)** that communicates with the Laravel Headless API via secure JSON requests[cite: 22, 24, 35].

---

## 1. Frontend Architecture & Structure

[cite_start]The frontend is organized into two distinct user experiences: a mobile-first **Employee PWA** and a desktop-optimized **Admin Dashboard**[cite: 67, 71, 112].

### Project Directory Structure

[cite_start]Based on industry standards, the frontend project is structured for maximum scalability[cite: 113, 121]:

- [cite_start]**`src/api/`**: Contains Axios instances with interceptors to automatically attach **Bearer tokens** for secure API communication[cite: 116, 131].
- [cite_start]**`src/store/`**: Uses **Pinia** for state management, handling global data such as authentication tokens and real-time clock-in status[cite: 39, 70, 105, 132].
- [cite_start]**`src/layouts/`**: Separates navigation logic between `AdminLayout.vue` (persistent sidebar) and `EmployeeLayout.vue` (mobile-optimized)[cite: 40, 72, 133, 134].
- [cite_start]**`src/components/ui/`**: Houses high-quality **Shadcn/UI** components like Cards, Buttons, and DataTables[cite: 11, 68, 74].
- [cite_start]**`src/pages/`**: Contains specific views for admin management (reporting, payroll) and employee functions (mobile clock-in dashboard)[cite: 135, 136].

---

## 2. Employee PWA (Mobile-First)

[cite_start]Designed for field or office workers, the PWA provides a native-app experience on mobile devices[cite: 36, 67, 102].

- [cite_start]**PWA Functionality**: Implemented via `vite-plugin-pwa` to enable offline-first capabilities and "Add to Home Screen" support[cite: 38, 69, 104, 166].
- [cite_start]**UI Components**: Utilizes Shadcn **Card**, **Button**, and **Tabs** components to maintain a clean, professional native feel[cite: 10, 37, 68, 103].
- **Geofencing & Biometrics**:
  - [cite_start]**Geolocation API**: Captures precise user coordinates to verify the employee is within the required 100-meter office radius before allowing a clock-in[cite: 45, 154, 188].
  - [cite_start]**WebAuthn (Biometrics)**: Integrates `@simplewebauthn/browser` to allow secure, non-transferable clock-ins using FaceID or Fingerprints[cite: 138, 164, 183].

---

## 3. Admin Web Dashboard

[cite_start]The admin interface is a desktop-optimized environment focused on data management and HR oversight[cite: 39, 71, 97].

- [cite_start]**Data Management**: Uses Shadcn’s **DataTable** (powered by TanStack Table) for advanced filtering, sorting, and management of employee records and attendance logs[cite: 16, 43, 74, 98].
- [cite_start]**Data Visualization**: Employs **Vue-Chartjs** or **Recharts** within Shadcn Card components to visualize high-level attendance trends and daily percentages[cite: 15, 42, 73, 101, 144, 167].
- **Reporting & Payroll**:
  - [cite_start]Dedicated views allow admins to trigger JSON-to-CSV exports for attendance reports based on date ranges and departments[cite: 99, 158].
  - [cite_start]A payroll view displays monthly salary summaries calculated by the backend, allowing for automated financial processing[cite: 100, 157].

---

## 4. Technical Integration & Security Standards

[cite_start]To ensure a robust production environment for 2026, the following frontend protocols are enforced[cite: 137, 161]:

| Component             | Technology              | Role                                                                                                                 |
| :-------------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **Communication**     | **Axios**               | [cite_start]Fetches and sends JSON data between the Vue frontend and Laravel backend[cite: 47, 75, 106].             |
| **Authentication**    | **Laravel Sanctum**     | [cite_start]Requires valid tokens for all requests, handled via frontend interceptors[cite: 139, 163].               |
| **State Management**  | **Pinia**               | [cite_start]Manages global auth status and real-time updates from the server[cite: 39, 105, 132].                    |
| **Real-time Updates** | **Laravel Reverb/Echo** | [cite_start]Pushes live notifications and attendance alerts directly to the Admin dashboard[cite: 50, 78, 109, 142]. |

Would you like to see the specific Vue component code for the biometric clock-in button or the Admin data table configuration?
