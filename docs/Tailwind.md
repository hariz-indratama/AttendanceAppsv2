This guide outlines the implementation of **Tailwind CSS** and **Shadcn/UI** as the primary toolkit for building a professional, industry-grade View layer. [cite_start]In a decoupled MVC architecture, these tools are essential for delivering a high-quality user experience across both mobile PWA and desktop web interfaces[cite: 1, 3, 46, 146].

---

## 1. Tailwind CSS Integration

[cite_start]Tailwind CSS provides the utility-first foundation required for responsive, professional design in your attendance system[cite: 11, 46, 66].

- [cite_start]**Responsive Design**: It ensures that layouts automatically adapt between the mobile-first **Employee PWA** and the desktop-optimized **Admin Dashboard**[cite: 46, 67, 71, 112].
- [cite_start]**Consistency**: Utility classes allow for a uniform look and feel across different layouts, such as `AdminLayout.vue` and `EmployeeLayout.vue`[cite: 14, 40, 66, 130].
- [cite_start]**Performance**: By utilizing a JIT (Just-In-Time) compiler, it keeps the CSS bundle small, which is critical for PWA performance and fast load times on mobile devices[cite: 104, 154].

## 2. Shadcn/UI Implementation (Employee PWA)

[cite_start]For field or office workers on mobile, Shadcn components are used to create a "native-app" experience[cite: 36, 67, 102, 248].

- [cite_start]**Clock-In Interface**: Utilize the **Card** component as the primary container for the dashboard, with **Button** components for the primary clock-in/out actions[cite: 10, 37, 68, 103, 250].
- [cite_start]**Navigation**: Implement **Tabs** to allow users to switch seamlessly between their daily logs and leave request history[cite: 10, 68, 103, 154].
- [cite_start]**UX Standards**: These components provide the clean, professional feel necessary for a high-quality enterprise tool[cite: 11, 66].

## 3. Shadcn/UI Implementation (Admin Web Dashboard)

[cite_start]The admin panel requires sophisticated data management tools that Shadcn/UI provides through advanced components[cite: 71, 133, 155].

- [cite_start]**Employee Management**: The **DataTable** component (powered by TanStack Table) is the core feature for HR, enabling advanced filtering, sorting, and searching of employee records[cite: 16, 43, 74, 98, 254].
- [cite_start]**Data Visualization**: Use **Card** components as wrappers for charts (e.g., Vue-Chartjs) to visualize daily attendance trends and percentages[cite: 15, 42, 73, 101, 144, 255].
- [cite_start]**Reporting Hub**: Integrate **Dialog** or **Dropdown Menu** components to allow admins to trigger attendance report exports (CSV, PDF, or Excel)[cite: 99, 158, 256].

---

## 4. Senior Development Standards

To maintain industry-grade quality, follow these strict frontend guidelines:

- [cite_start]**Strict Typing**: Every Shadcn/UI component and its corresponding props must be strictly typed using **TypeScript** interfaces to prevent the use of `any`[cite: 308, 311, 312, 331, 335].
- [cite_start]**Reusable Patterns**: Verify that all PWA and Admin components follow clean, reusable patterns and utilize **Axios interceptors** for secure, token-based API communication[cite: 116, 131, 243, 327, 352].
- [cite_start]**Linting and Style**: Use **ESLint** and **Prettier** to enforce consistent code styles and explicit return types across the frontend repository[cite: 309, 315, 332, 338].

Would you like to see a specific code example of how to configure the **DataTable** with TypeScript for the Admin attendance logs?
