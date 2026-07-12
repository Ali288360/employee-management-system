# Employee Management System (EMS)

A production-ready, full-stack Employee Management System featuring dual-role authentication (Admin and Employee), real-time attendance tracking, leave request management, automated payroll sheets with printable payslips, and background notifications using Inngest and Nodemailer.

---

## 🚀 Key Features

*   **Dual-Role Access Control**: Separate secure portals for **Administrators** and **Employees**.
*   **KPI Dashboards**: Dynamic status indicators displaying total employees, departments, and pending leave applications.
*   **Attendance Desk**: Punch-in/out check logs, auto-checkout logic, and check-in timeline histories.
*   **Leave requests**: Request planner with approval/rejection workflows and automated status email notifications.
*   **Payroll & Payslips**: Custom allowance/deduction computed worksheets and printable PDF-ready Payslip previews.
*   **SMTP Diagnostics Dashboard**: On-demand testing panel inside user settings to verify Gmail App Password configurations.
*   **Background Crons**: Automatic checkout runs at 10 PM and check-in reminders dispatch at 9 AM daily.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js initialized with Vite, Tailwind CSS, Lucide React icons, and React Router.
*   **Backend**: Node.js, Express.js, and MongoDB (via Mongoose).
*   **Background Jobs**: Inngest SDK engine.
*   **Mailing Service**: Nodemailer (configured with Google App Passwords).

---

## 📂 Directory Structure

```text
ems/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable layout and navigation elements
│   │   ├── context/        # Auth & Theme state wrappers
│   │   ├── pages/          # Dashboard, Leaves, Payslips, Settings
│   │   └── index.css       # Core Tailwind CSS rules
│   └── package.json
│
├── server/                 # Express Backend API
│   ├── config/             # Database connection setups
│   ├── controllers/        # Business logic controllers
│   ├── inngest/            # Background tasks, mailers, and diagnostic utilities
│   ├── models/             # Mongoose schemas (User, Employee, Attendance, Leaves)
│   ├── routes/             # Express endpoint mappings
│   ├── .env                # Local environment keys (ignored by Git)
│   └── package.json
│
├── vercel.json             # Vercel unified monorepo deployment routing mapping
└── package.json            # Root configuration and concurrency run scripts
```

---

## 💻 Local Quick Start

### 1. Open the folder in VS Code
Open VS Code, click **File -> Open Folder**, and select the project directory:
```text
C:\Users\hp\.gemini\antigravity\scratch\ems
```

### 2. Configure Environment Variables
Create or open the **`server/.env`** file and paste your credentials:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ems
JWT_SECRET=supersecretkeyforemployeemanagementsystem
NODE_ENV=development

# Nodemailer SMTP Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=abdialiaa200@gmail.com
EMAIL_PASS=your_16_digit_gmail_app_password
EMAIL_FROM=abdialiaa200@gmail.com
```

### 3. Run Commands
Open the VS Code Integrated Terminal (`Ctrl + \``) and run:

```bash
# 1. Install all backend and frontend dependencies
npm run install-all

# 2. Start the development servers in parallel
npm run dev
```

---

## 🔑 Default Credentials

If no accounts exist yet, click **"Create Default Admin Account"** on the login portal:
*   **Role**: Admin Portal
*   **Email**: `admin@ems.com`
*   **Password**: `adminpassword123`

---

## 🌐 Vercel Production Deployment

This project contains a configured [`vercel.json`](vercel.json) to deploy both the Express API and React Frontend as a single project.

1.  Connect your GitHub repository containing the project to Vercel.
2.  Add the **Environment Variables** in the Vercel Dashboard Settings:
    *   `MONGODB_URI`: (Cloud MongoDB Atlas URL, e.g. `mongodb+srv://...`)
    *   `JWT_SECRET`: `supersecretkeyforemployeemanagementsystem`
    *   `EMAIL_HOST`: `smtp.gmail.com`
    *   `EMAIL_PORT`: `587`
    *   `EMAIL_USER`: `abdialiaa200@gmail.com`
    *   `EMAIL_PASS`: `your_app_password`
    *   `EMAIL_FROM`: `abdialiaa200@gmail.com`
3.  Click **Deploy**!
