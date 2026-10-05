# ROXILER STORE RATING PLATFORM
*Full-Stack Coding Assessment Submission — Roxiler Systems*

A modern, production-grade SaaS web platform enabling shoppers to discover and rate registered stores (1 to 5 stars). Features a unified authentication gateway with strict Role-Based Access Control (RBAC) across three distinct roles: **System Administrator**, **Normal Shopper / User**, and **Store Owner**.

---

## 🌟 Key Highlights & Features

### 🛡️ Unified Authentication & Role-Based Access Control (RBAC)
- **Universal Login**: Single login portal (`/login`) for all roles with automatic, secure role-based dashboard routing.
- **Normal User Self-Registration**: Self-service registration (`/register`) with real-time character limit counters and strict validation.
- **JWT & Password Security**: Secure HTTP authorization via `Bearer` tokens, bcrypt password hashing with 10 salt rounds, and no sensitive credentials leaked in API responses.
- **Frontend & Backend Dual Protection**: Frontend routes guarded via `ProtectedRoute` and `RoleProtectedRoute`; backend endpoints strictly guarded via `authenticate` and `authorize` middleware.

### 👑 System Administrator Experience
- **Real-Time Analytics Dashboard**: Live platform aggregates computed directly from PostgreSQL: Total Users, Total Stores, Total Customer Ratings, Platform Average Rating, and User distribution breakdown.
- **User Directory Management**: Comprehensive data table of all registered accounts. Supports server-side multi-field search (name, email, address), role filtering (Admin, Store Owner, User), and bidirectional column sorting (Name, Email, Address, Role, Joined Date).
- **User Details Modal**: Deep inspection of individual users, including managed store details and ratings overview for store owners.
- **User Creation**: Admin can provision new accounts for any system role (`ADMIN`, `USER`, `STORE_OWNER`).
- **Store Registry Management**: View all stores with real-time average rating and rating count. Supports multi-field search and column sorting.
- **Store Provisioning**: Admin can register new merchant stores and assign them exclusively to eligible unassigned store owners.

### 🛍️ Normal Shopper / User Experience
- **Store Discovery**: Browse all registered stores with addresses, contact emails, community ratings, and total rating counts.
- **Search & Sort**: Real-time store search by name or address; sorting by name, rating, or address.
- **Interactive 1–5 Star Rating Engine**: Shoppers can submit a new 1–5 star rating or seamlessly modify an existing rating.
- **Strict One-Rating-Per-Store Policy**: Enforced by PostgreSQL composite unique constraint (`userId`, `storeId`); duplicate ratings are impossible.
- **Personal Rating Indicators**: Stores already rated by the user display a prominent "Rated" badge and show the user's submitted score.

### 🏪 Store Owner Experience
- **Merchant Storefront Dashboard**: Live overview of their managed store, computed average rating, and total rating count.
- **Visual Rating Breakdown**: Dynamic distribution bar chart showcasing the exact count and percentage for 5-star, 4-star, 3-star, 2-star, and 1-star ratings.
- **Customer Feedback Directory**: Detailed table of every shopper who reviewed their store (Shopper Name, Email, Address, Rating Submitted, Review Date).
- **Feedback Search & Filtering**: Filter customer reviews by exact star count (5★, 4★, etc.) and search across customer profiles.
- **Strict Privacy Isolation**: Store owners can ONLY view ratings belonging exclusively to their own store.

### 🔒 Account Security
- **Change Password**: Dedicated security portal (`/profile/change-password`) available to all roles to update credentials securely with validation against previous passwords.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React.js (v18.3) | Built with Vite for rapid bundling |
| **State Management** | Redux Toolkit (v2.6) | Centralized authentication, user sessions, and localStorage sync |
| **Routing** | React Router DOM (v6.29) | Declarative client routing with protected role gates |
| **HTTP Client** | Axios (v1.8) | Configured with automatic token injection and 401 interceptors |
| **Icons & Design** | Lucide React | Modern, crisp SVG iconography |
| **Backend Runtime** | Node.js (v18+ / v20+ / v24+) | Express.js RESTful API architecture |
| **Database** | PostgreSQL (v14+ / v18+) | Enterprise relational database |
| **ORM** | Prisma ORM (v6.4) | Type-safe database queries, migrations, and seeding |
| **Authentication** | JWT (jsonwebtoken) & bcryptjs | Stateless token auth with bcrypt password hashing |
| **API Security** | Helmet, CORS, Morgan | Secure HTTP headers, strict origins, and dev request logging |

---

## 📐 Architecture & Folder Structure

```
roxiler-store-rating-assessment/
│
├── client/                               # Frontend React Single Page Application
│   ├── public/                           # Static public assets
│   ├── src/
│   │   ├── assets/                       # Image assets and icons
│   │   ├── components/
│   │   │   └── ui/                       # Reusable UI component library
│   │   │       └── index.jsx             # Button, Input, Select, RatingStars, StatCard, etc.
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx       # Responsive sidebar, navigation & topbar layout
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx             # Universal login with 1-click demo fills
│   │   │   │   ├── Register.jsx          # User self-registration
│   │   │   │   └── ChangePassword.jsx    # Password change form
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx    # System analytics overview
│   │   │   │   ├── AdminUsers.jsx        # User directory & details
│   │   │   │   └── AdminStores.jsx       # Stores directory & assignment
│   │   │   ├── user/
│   │   │   │   └── UserStores.jsx        # Store browsing and rating engine
│   │   │   └── owner/
│   │   │       ├── OwnerDashboard.jsx    # Owner store overview & breakdown
│   │   │       └── OwnerRatings.jsx      # Customer review table
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx             # Route definitions
│   │   │   └── RouteProtection.jsx       # ProtectedRoute & RoleProtectedRoute
│   │   ├── services/
│   │   │   ├── api.js                    # Axios instance with interceptors
│   │   │   ├── authService.js            # Auth API calls
│   │   │   ├── adminService.js           # Admin API calls
│   │   │   └── storeService.js           # Stores, ratings & owner API calls
│   │   ├── slices/
│   │   │   └── authSlice.js              # Redux auth slice & thunks
│   │   ├── store/
│   │   │   └── index.js                  # Redux store configuration
│   │   ├── hooks/
│   │   │   └── useToast.jsx              # Toast notification context & hook
│   │   ├── utils/
│   │   │   └── validation.js             # Client validation matching assessment specs
│   │   ├── App.jsx                       # Root React component
│   │   ├── main.jsx                      # React DOM mount point
│   │   └── index.css                     # Premium modern SaaS design system
│   ├── index.html                        # HTML entry point with Plus Jakarta Sans & Inter
│   ├── package.json                      # Client dependencies & scripts
│   └── vite.config.js                    # Vite configuration with API proxying
│
├── server/                               # Backend Node.js / Express REST API
│   ├── prisma/
│   │   ├── schema.prisma                 # Prisma schema definition
│   │   └── seed.js                       # Comprehensive database seed script
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # Prisma client singleton instance
│   │   ├── controllers/
│   │   │   ├── authController.js         # Register, login, me, changePassword
│   │   │   ├── adminController.js        # Dashboard, users, stores, eligible owners
│   │   │   ├── storeController.js        # Store listings & user rating extraction
│   │   │   ├── ratingController.js       # Rating upsert & dynamic average computation
│   │   │   └── ownerController.js        # Owner dashboard & customer ratings
│   │   ├── middleware/
│   │   │   ├── auth.js                   # JWT authentication & RBAC authorization
│   │   │   └── errorHandler.js           # Centralized Prisma & operational error handler
│   │   ├── routes/
│   │   │   ├── authRoutes.js             # /api/auth endpoints
│   │   │   ├── adminRoutes.js            # /api/admin endpoints
│   │   │   ├── storeRoutes.js            # /api/stores endpoints
│   │   │   ├── ratingRoutes.js           # /api/ratings endpoints
│   │   │   ├── ownerRoutes.js            # /api/owner endpoints
│   │   │   └── index.js                  # Master API router with /api/health
│   │   ├── utils/
│   │   │   ├── auth.js                   # bcrypt & JWT utilities
│   │   │   └── responseHandler.js        # Standardized { success, message, data } responses
│   │   ├── validators/
│   │   │   └── index.js                  # Strict server-side validation rules
│   │   ├── app.js                        # Express app setup with CORS, Helmet, Morgan
│   │   └── server.js                     # HTTP server startup with graceful shutdown
│   ├── .env.example                      # Server environment template
│   └── package.json                      # Server dependencies & scripts
│
├── README.md                             # Comprehensive technical documentation
├── .gitignore                            # Production gitignore
├── .env.example                          # Root environment template
└── package.json                          # Root workspace orchestrator
```

---

## 🗄️ Database Architecture & Schema

### PostgreSQL Schema (`server/prisma/schema.prisma`)

```prisma
enum Role {
  ADMIN
  USER
  STORE_OWNER
}

model User {
  id           String    @id @default(uuid())
  name         String
  email        String    @unique
  passwordHash String
  address      String
  role         Role      @default(USER)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  store        Store?
  ratings      Rating[]

  @@index([email])
  @@index([role])
  @@index([name])
  @@map("users")
}

model Store {
  id        String   @id @default(uuid())
  name      String
  email     String
  address   String
  ownerId   String   @unique
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  ratings   Rating[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
  @@index([address])
  @@index([ownerId])
  @@map("stores")
}

model Rating {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  storeId   String
  store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  rating    Int      // 1 to 5
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, storeId])
  @@index([userId])
  @@index([storeId])
  @@map("ratings")
}
```

### Key Relational Rules:
1. **Unique Email**: User emails are unique case-insensitively.
2. **One Store per Owner**: `ownerId` in `Store` is marked `@unique`, preventing any store owner from managing more than one store simultaneously.
3. **One Rating per User per Store**: Composite unique constraint `@@unique([userId, storeId])` in `Rating` guarantees that shoppers cannot submit duplicate reviews for the same store. If a rating is re-submitted, it updates the existing score.
4. **Calculated Average Rating**: Average rating is dynamically calculated as `SUM(ratings) / COUNT(ratings)` rounded to 2 decimal places. No hardcoded or stale averages exist.

---

## 📋 Strict Input Validation Rules

Validation is strictly enforced on **both** the Frontend and Backend:

| Field | Rule / Constraint | Error Feedback |
|---|---|---|
| **Name** | 20 to 60 characters | "Name must be between 20 and 60 characters" |
| **Address** | Maximum 400 characters | "Address must not exceed 400 characters" |
| **Password** | 8 to 16 characters, ≥1 uppercase letter, ≥1 special character | "Password must be 8-16 characters with 1 uppercase & 1 special character" |
| **Email** | Standard valid RFC email format | "Please provide a valid email address" |
| **Rating** | Integer between 1 and 5 (1, 2, 3, 4, 5) | "Rating must be an integer between 1 and 5" |
| **Store Name** | 3 to 60 characters | "Store name must be between 3 and 60 characters" |

---

## 📡 REST API Reference

All responses conform to a strict standardized contract:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register` — Register a new normal user account.
- `POST /api/auth/login` — Universal login for all roles.
- `GET /api/auth/me` — Retrieve current authenticated profile. *(Requires Bearer token)*
- `PUT /api/auth/change-password` — Change password for logged-in user. *(Requires Bearer token)*

### Administrator Endpoints (`/api/admin`) *(Requires ADMIN role)*
- `GET /api/admin/dashboard` — Overview metrics (total users, stores, ratings, platform average, role counts).
- `GET /api/admin/users?search=&role=&sortBy=&sortOrder=` — Search, filter, and sort user directory.
- `GET /api/admin/users/:id` — Retrieve deep user profile with managed store data.
- `POST /api/admin/users` — Provision new user with specified role (`ADMIN`, `USER`, `STORE_OWNER`).
- `GET /api/admin/stores?search=&sortBy=&sortOrder=` — Search and sort store directory with live rating scores.
- `POST /api/admin/stores` — Register a new merchant store and assign an eligible owner.
- `GET /api/admin/eligible-owners` — List store owners not yet assigned to any store.

### Store Browsing & Rating Endpoints (`/api/stores` & `/api/ratings`) *(Requires Authenticated User)*
- `GET /api/stores?search=&sortBy=&sortOrder=` — List stores with overall rating and current user's submitted score.
- `GET /api/stores/:id` — Single store details.
- `POST /api/ratings` — Submit or update a 1–5 star rating for a store.
- `GET /api/ratings/my` — List all ratings submitted by the logged-in user.

### Store Owner Endpoints (`/api/owner`) *(Requires STORE_OWNER role)*
- `GET /api/owner/dashboard` — Owner store metrics and rating distribution (5★ to 1★).
- `GET /api/owner/ratings?search=&ratingFilter=&sortBy=&sortOrder=` — List customer reviews for the owner's store.

### Health Check
- `GET /api/health` — Returns system uptime and operational status.

---

## 🔑 Demo Credentials

All seed accounts strictly comply with the name (20–60 chars), address (≤400 chars), and password constraints.

| Role | Account Name | Email | Password |
|---|---|---|---|
| **System Administrator** | `System Administrator Roxiler` | `admin@demo.com` | `Admin@1234` |
| **Store Owner (Apex Devices)** | `Eleanor Vance Store Owner` | `owner@demo.com` | `Owner@1234` |
| **Store Owner (Bluebird Market)** | `Marcus Thorne Store Owner` | `owner2@demo.com` | `Owner@1234` |
| **Store Owner (Starlight Luxury)** | `Sophia Bennett Store Owner` | `owner3@demo.com` | `Owner@1234` |
| **Store Owner (Unassigned)** | `Julian Montgomery Owner` | `owner4@demo.com` | `Owner@1234` |
| **Normal Shopper / User 1** | `David Jonathan Miller User` | `user@demo.com` | `User@1234` |
| **Normal Shopper / User 2** | `Catherine Elizabeth Davis` | `user2@demo.com` | `User@1234` |
| **Normal Shopper / User 3** | `Benjamin Arthur Wilson User` | `user3@demo.com` | `User@1234` |
| **Normal Shopper / User 4** | `Samantha Grace Taylor User` | `user4@demo.com` | `User@1234` |

> 💡 **Quick Fill Available**: The login screen features a 1-click demo button bar for instant credential autofill during testing and evaluation.

---

## 🚀 Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher running locally or in Docker

### Step 1: Database Setup
Create the target database in PostgreSQL using `psql` or pgAdmin:
```sql
CREATE DATABASE roxiler_store_rating_db;
```

### Step 2: Environment Configuration
Copy `.env.example` in both root and `server/`:
```bash
cp server/.env.example server/.env
```

Ensure `DATABASE_URL` in `server/.env` matches your local PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/roxiler_store_rating_db?schema=public"
JWT_SECRET="roxiler_secret_jwt_key_bahut_lamba_secure_2026"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```
*(Note: If your password contains special characters such as `@`, URL-encode it, e.g. `%40`)*

### Step 3: Install Dependencies
Run from the root directory:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### Step 4: Run Prisma Migration & Seed Database
Sync the schema to PostgreSQL and populate realistic initial data:
```bash
# Generate Prisma Client
npm run prisma:generate

# Sync schema to database
npm run db:push --prefix server

# Seed the database
npm run seed
```

### Step 5: Start Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend API (http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend UI (http://localhost:5173)
npm run dev:client
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Production Build & Verification

To verify that the frontend compiles cleanly for production:
```bash
npm run build
```
Output:
```
✓ 1989 modules transformed.
dist/index.html                   0.97 kB │ gzip:   0.57 kB
dist/assets/index-CtkuT-_b.css   17.34 kB │ gzip:   4.07 kB
dist/assets/index-C1Mid0wF.js   324.52 kB │ gzip: 101.08 kB
✓ built in 12.49s
```

---

## 🐙 Git Repository Initialization

To push this project to your GitHub repository:
```bash
git init
git add .
git commit -m "Initial Roxiler full stack assessment"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

---

## 🏆 Submission Audit Checklist

- [x] **Official Assessment Requirements**: All roles, validations, and technical specifications fulfilled.
- [x] **Existing Projects Untouched**: Existing workspace files left completely intact.
- [x] **New Isolated Folder**: Created inside `roxiler-store-rating-assessment/`.
- [x] **React 18 + Vite**: Responsive, modern SaaS user interface with clean typography.
- [x] **Redux Toolkit**: Persistent auth session, token management, and role-based routing.
- [x] **Node.js + Express**: RESTful API design with standardized `{ success, message, data }` responses.
- [x] **PostgreSQL + Prisma**: Full relational schema with foreign keys, indexes, and cascade deletion.
- [x] **Rating Engine**: Real-time dynamic `SUM/COUNT` calculation, 1–5 star validation, and upsert handling.
- [x] **Strict Form Validation**: Name (20–60), address (≤400), password (8–16 with uppercase & special char).
- [x] **Security**: bcrypt hashing (10 rounds), JWT authentication, authorization middleware, Helmet headers, CORS.
- [x] **Seed Data**: Fully seeded with Admin, Store Owners, Normal Users, Stores, and Ratings.
- [x] **Build & Test Verified**: Automated API tests passed and production frontend build succeeded.
