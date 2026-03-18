# Job Application Tracker

A full-stack web application for tracking job applications through every stage of your job search — from first application to final offer.

---

## Live Demo

> **[Add your live demo link here]**

---

## Features

- **Authentication** — Secure register/login with JWT stored in an `httpOnly` cookie
- **Application Management** — Add, edit, and delete job applications with full form validation
- **Applications Page** — Three tables (In Progress, Applied, Rejected) with search, status filter chips, column sorting, and pagination
- **Pipeline (Kanban)** — Drag-and-drop kanban board across Applied / Interview / Offer / Rejected columns with per-column pagination and a toggleable Rejected column
- **Dashboard** — Stat cards (Total, In Progress, Applied, Offers, Rejected), a pie chart with percentage labels, and a recent 7-day activity table
- **Stage & Interview Type** — Applications have a Stage field (Applied, Interview, Offer, Rejected, Withdrawn); Interview stage has an optional sub-field for type (Phone, Code, HR, Other)
- **Responsive UI** — Built with MUI v7, sticky navbar with active link highlighting

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| UI Library | [MUI v7](https://mui.com/) + Emotion |
| Forms | [React Hook Form v7](https://react-hook-form.com/) |
| State Management | [Zustand v5](https://zustand-demo.pmnd.rs/) |
| Charts | [Recharts v3](https://recharts.org/) |
| Database | [MongoDB](https://www.mongodb.com/) via [Mongoose v9](https://mongoosejs.com/) |
| Authentication | [jose](https://github.com/panva/jose) (Edge) + [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (API routes) |
| Password Hashing | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/job-application-tracker.git
cd job-application-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_key
```

> Generate a strong `JWT_SECRET` with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
app/
  api/              # API routes (auth, applications CRUD)
  dashboard/        # Dashboard page
  applications/     # Applications management page
  pipeline/         # Kanban pipeline page
  login/            # Login page
  register/         # Register page
components/
  Navbar.tsx        # Sticky top navigation bar
  AddApplicationModal.tsx  # Add / edit application modal
  ApplicationsTable.tsx    # Reusable table with sort, filter, pagination
  KanbanCard.tsx    # Individual kanban card component
lib/
  constants.ts      # Stages, interview types, employment types, work modes
  db.ts             # MongoDB connection helper
  authStore.ts      # Zustand auth store
models/
  Application.ts    # Mongoose application schema
  User.ts           # Mongoose user schema
types/
  application.ts    # Shared TypeScript interfaces
middleware.ts       # Route protection middleware
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for signing JWT tokens | Yes |

---

## License & Copyright

Copyright © 2026. All rights reserved.

This project is intended for personal and educational use. You may fork and adapt it for your own non-commercial purposes, provided that credit is given to the original author.

Redistribution, resale, or use in a commercial product without explicit written permission from the author is not permitted.

# or
pnpm dev
# or
bun dev
```
