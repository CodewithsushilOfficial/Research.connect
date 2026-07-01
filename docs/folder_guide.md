# Research Connect — Folder Structure Guide

This document describes the complete workspace folder structure for **Research Connect** to guide engineers during development.

---

## 🏛️ Project Root Structure
```text
ResearchConnect/
├── backend/            # Express.js Node API (Backend Application)
├── frontend/           # React SPA powered by Vite (Frontend Application)
├── docs/               # Technical Guides and Architectural Specs
├── scripts/            # Build, deploy, and configuration helpers
├── .github/            # GitHub actions, workflows, and PR templates
├── docker/             # Docker files (docker-compose, dockerfiles)
├── LICENSE             # Project LICENSE
├── README.md           # Getting started overview
└── .gitignore          # Version control ignore lists
```

---

## 💻 Backend Folder Layout (`backend/src/`)
The backend follows a strict **Feature-First Architecture** inside the `modules` directory, complemented by global abstractions:

```text
backend/src/
├── config/             # Modular system configurations
│   ├── database/       # Mongoose connections, indexes, and seeders
│   ├── env.config.js   # Environment variable schemas
│   ├── cors.js         # CORS headers config
│   └── rateLimiter.js  # Request limits config
├── common/             # Reusable base logic and utilities
│   ├── errors/         # Custom operational Error classes (AppError)
│   ├── logger/         # Winston Categorical File Loggers
│   ├── middlewares/    # RequestId, logging, security, validation, error handlers
│   ├── repository/     # BaseRepository CRUD class
│   ├── responses/      # Standardized API response formatter (ApiResponse)
│   ├── service/        # BaseService CRUD logic class
│   └── utils/          # Token, hash, encryption, and date utilities
├── models/             # Global base Mongoose Schemas (User, Profile, Session, RefreshToken, EmailOtp, SecurityLog)
├── modules/            # Domain Feature Modules (Isolated directories)
│   ├── landing/        # Main landing page module
│   ├── auth/           # Authentication, 2FA, and Token session module [NEW]
│   └── profile/        # Researcher profile management [NEW]
│       ├── controller/ # Controllers mapping route triggers
│       ├── service/    # Business services and validation hooks
│       ├── repository/ # Database access queries extending BaseRepository
│       ├── routes/     # Express route definitions
│       ├── validator/  # Express-validator schema rules
│       ├── middleware/ # Module specific middlewares
│       └── dto/        # Data Transfer Object structures
├── app.js              # Express app setup and middleware routing
└── server.js           # Server port listener and graceful shutdowns
```

---

## 🎨 Frontend Folder Layout (`frontend/src/`)
The React SPA follows a modular structure grouped by functionalities and UI controls:

```text
frontend/src/
├── api/                # Axios instances and interceptor logic
├── assets/             # Static images, local SVGs, and assets
├── animations/         # Framer-motion layout transitions
├── components/         # Shared React components
│   └── common/         # Atomic UI design system components
│       ├── buttons/    # Reusable Buttons with spinners
│       ├── cards/      # Glassmorphic and simple Cards
│       ├── forms/      # Form wrappers
│       ├── inputs/     # Inputs, selects, and checkboxes
│       ├── tables/     # Datatable layout and pagination selectors
│       ├── modals/     # Modal drawers with backdrop locks
│       └── loaders/    # Spinners and content Skeleton placeholders
├── layouts/            # Page shell frames
│   ├── Navbar/         # Header brand bar
│   ├── Sidebar/        # Admin/Researcher left navigation drawer
│   ├── Footer/         # Page base links
│   ├── DashboardLayout/# Shell for internal pages
│   ├── AuthLayout/     # Shell for login / register pages
│   └── LandingLayout/  # Shell for website landing page
├── modules/            # Domain modules
│   ├── landing/        # Landing page components, styles, and subviews
│   ├── auth/           # Authentication views (Login, Register, OTP) [NEW]
│   ├── dashboard/      # Researcher Dashboard view [NEW]
│   └── profile/        # Profile Affiliation editor [NEW]
├── redux/              # Redux Toolkit global store and slices
├── services/           # Async API client calls
├── constants/          # Static lists, select options, and error messages
├── routes/             # React Router DOM configuration
├── utils/              # Client-side formatting and validations
├── styles/             # Global CSS and Tailwind configurations
├── App.jsx             # Main router mount point
└── main.jsx            # Index mount point registering Redux & React Query
```
