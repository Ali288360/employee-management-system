---
name: ems-standards
description: Enforces MERN Employee Management System (EMS) coding standards, glassmorphic UI design rules (Tailwind CSS, Outfit font), and API guidelines.
---

# EMS Project Standards & Guidelines

This workspace skill guarantees consistent design, patterns, and clean code principles throughout the development of the Employee Management System.

## 1. UI & Aesthetics (Vibe: Premium Glassmorphism)
- **Typography**: Always import and use Google Fonts "Outfit". Set it as the default sans-serif font in `tailwind.config.js`.
- **Theme Palette (HSL / Custom)**:
  - Slate Dark Mode Background: `bg-slate-950` / HSL `(224, 71%, 4%)`
  - Premium Glass Cards:
    - Background: `bg-white/5` or `bg-slate-900/40`
    - Backdrop Blur: `backdrop-blur-md` or `backdrop-blur-lg`
    - Border: `border border-white/10`
    - Shadows: `shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]`
- **Gradients**: Use smooth, modern gradient overlays (e.g., `from-violet-600 via-indigo-600 to-cyan-500` or `from-teal-400 to-blue-500`).
- **Interactive Elements**: Micro-animations on buttons and cards using Tailwind transitions (`transition-all duration-300 hover:scale-[1.02]`).

## 2. Code Quality & Architecture
- **API Naming Conventions**:
  - Keep route naming plural where appropriate (e.g., `/api/employees`, `/api/leaves`, `/api/payslips`), except for authentication (`/api/auth/*`).
- **Routing Protection**:
  - `protect` middleware: Verifies JWT token, loads user into `req.user`.
  - `protectAdmin` middleware: Checks if `req.user.role === 'admin'`.
- **Database Rules**:
  - Always clean up orphaned data or set statuses to `inactive` instead of hard deleting users/employees.
  - Set `timestamps: true` on all schemas to track `createdAt` and `updatedAt`.
- **JSDoc Comments**:
  - Write detailed JSDoc comments for all middleware functions, controllers, and complex utility operations.
