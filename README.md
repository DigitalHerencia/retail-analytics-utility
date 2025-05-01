<h1 align="center">
  
  Retail Analytics Dashboard

</h1>

<p align="center">
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-15.2.4-black?logo=nextdotjs&logoColor=white" alt="Next.js">
  </a>
  <a href="https://reactjs.org">
    <img src="https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white" alt="React">
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.17-blue?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  </a>
</p>

<p align="center">
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel&logoColor=white" alt="Vercel">
  </a>
  <a href="https://nodejs.org">
    <img src="https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js&logoColor=white" alt="Node.js">
  </a>
  <a href="https://pnpm.io">
    <img src="https://img.shields.io/badge/pnpm-7-blue?logo=pnpm&logoColor=white" alt="pnpm">
  </a>
</p>

---

Retail Analytics Dashboard is a demo point-of-sale and analytics platform for small-to-mid-sized retail businesses. Manage inventory, customers, and transactions with a sleek, responsive UI—and dive into sales analytics and forecasting tools to make data-driven decisions.

---

## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Architecture](#architecture)  
- [Getting Started](#getting-started)  
- [Deployment](#deployment)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

---

## Overview

Retail Analytics Dashboard simulates a full-featured retail management system:

- **Point-of-Sale**: Process sales, accept payments, and generate transactions in real time.  
- **Inventory Management**: View, add, and remove stock items with low-inventory alerts.  
- **Customer CRM**: Browse, edit, and track customer profiles and payment histories.  
- **Accounts & Receivables**: Manage invoices, outstanding balances, and payment status.  
- **Analytics & Forecasting**: Interactive charts and projections powered by demo data.  

Built to demonstrate Next.js 15 Server Components, React 19 interactivity, and Server Actions for seamless data mutations.

---

## Features

- **Cash Register**  
  Real-time transaction entry with demo-data support and toast notifications.  
- **Inventory Dashboard**  
  Stock overview table, add/edit items, and low-stock highlighting.  
- **Customer Management**  
  Full CRUD on customer profiles, with purchase history and notes.  
- **Accounts Table**  
  Track outstanding invoices, due dates, and payment statuses.  
- **Sales & Performance Charts**  
  Interactive Recharts visuals for sales trends, category breakdowns, and revenue.  
- **Monthly Forecast**  
  AI-style demo forecasting based on sample data.  
- **Business Calculator**  
  Quick ROI and margin analysis via inline calculator component.  
- **Responsive Layout**  
  Mobile-friendly bottom navigation and adaptive components.  
- **Demo Data Generator**  
  One-click reset to generate randomized inventory, customers, and transactions.  

---

## Tech Stack

- **Framework**: Next.js 15 (Server Components & Server Actions)  
- **Library**: React 19 (use(), useTransition, useOptimistic)  
- **Language**: TypeScript 5 (strict mode, Zod validation)  
- **Styling**: Tailwind CSS 3  
- **Components**: Radix UI, shadcn/ui  
- **Charts**: Recharts  
- **Notifications**: Sonner  
- **Storage**: @vercel/blob (Vercel Blob Storage)  
- **Schema Validation**: Zod  
- **Utilities**: uuid, vaul, tailwind-merge  

---

## Architecture

Retail Analytics Dashboard follows a modular, hybrid architecture:

- **Server Components** (`app/`):  
  - Page-level components fetch data asynchronously (via `use()` and colocated fetchers).  
  - Layouts and global styles applied in `app/layout.tsx`.  
- **Client Components** (`components/`):  
  - Interactive UI (forms, tables, charts, calculators) marked with `"use client"`.  
  - State management via React Hooks and Sonner for toasts.  
- **Server Actions** (`app/actions.ts`):  
  - `saveBusinessData`, `getSavedDataList`, `deleteData` functions perform CRUD on Vercel Blob.  
  - Automatic revalidation with `revalidatePath("/")`.  
- **Data Layer** (`lib/`):  
  - `data.ts`: Type definitions and sample datasets.  
  - `demo-data.ts`: Randomized demo-data generator.  
- **Deployment**:  
  - Optimized for SSR and edge caching on Vercel.  
  - Environment variables configure Blob storage credentials.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18  
- pnpm (or npm/yarn)  
- Vercel account with Blob Storage enabled  

### Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-username/retail-analytics.git
   cd retail-analytics
   ```

2. **Install dependencies**  
   ```bash
   pnpm install
   ```

3. **Configure environment**  
   Create a `.env.local` file at project root:
   ```env
   BLOB_SERVICE_URL=<your-vercel-blob-endpoint>
   BLOB_TOKEN=<your-vercel-blob-token>
   ```

4. **Run locally**  
   ```bash
   pnpm dev
   ```  
   Open [http://localhost:3000](http://localhost:3000) to view.

---

## Deployment

1. Push to your GitHub repository.  
2. Import the project into Vercel.  
3. Add the same environment variables (`BLOB_SERVICE_URL`, `BLOB_TOKEN`) in Vercel Dashboard.  
4. Trigger a new deployment—your app will be live on your Vercel domain.

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feature/my-feature`).  
3. Commit your changes (`git commit -m "feat: add amazing feature"`).  
4. Push to the branch (`git push origin feature/my-feature`).  
5. Open a Pull Request with a clear description of your changes.

---

## License

This project is licensed under the **MIT License**. 
---

## Contact

For questions, feedback, or support, please open an issue on GitHub.

---

Made with ❤️ by the Digital Herencia.  
```
