# 🏢 EMS Pro — Employee Management System

> A production-ready **MERN Stack** HR Dashboard with full authentication, employee CRUD, search, pagination, sorting, filtering, dark mode, and Redux Toolkit.

---

## 📸 Screenshots

> Add screenshots here after running the app.

---

## 🚀 Features

### Authentication
- ✅ User Registration & Login
- ✅ JWT Authentication (7-day tokens)
- ✅ Password Hashing (bcryptjs, salt rounds 12)
- ✅ Protected Routes (frontend + backend)
- ✅ Persistent login via localStorage
- ✅ Auto logout on token expiry

### Employee Management
- ✅ Add, Edit, Delete employees
- ✅ Search by name, email, department, designation
- ✅ Filter by department & status
- ✅ Sort by any column (asc/desc)
- ✅ Pagination with page controls
- ✅ Dashboard stats & department charts
- ✅ Confirmation modal before delete

### UI/UX
- ✅ Glassmorphism design on auth pages
- ✅ Dark Mode (system preference + toggle)
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Empty states
- ✅ Form validation (frontend + backend)

---

## 🛠 Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Vite, Redux Toolkit, React Router v6 |
| Styling    | Vanilla CSS (design system with CSS custom properties) |
| State      | Redux Toolkit + React Hot Toast |
| HTTP       | Axios with JWT interceptors |
| Backend    | Node.js, Express.js |
| Database   | MongoDB with Mongoose |
| Auth       | JWT + bcryptjs |
| Validation | express-validator (backend), custom (frontend) |
| DevOps     | Docker, Docker Compose |

---

## 📁 Folder Structure

```
Employee Management System/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/       # auth, errorHandler, validate
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # JWT helper
│   ├── .env             # Environment variables
│   └── server.js        # Express entry point
│
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── hooks/       # useAuth, useDarkMode
│       ├── layouts/     # DashboardLayout
│       ├── pages/       # Route pages
│       ├── redux/       # Store + slices
│       ├── services/    # API calls
│       ├── utils/       # validators
│       └── App.jsx
│
└── docker-compose.yml
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository

```bash
git clone <repo-url>
cd "Employee Management System"
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET

npm run dev   # starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev   # starts on http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                        | Example |
|----------------|------------------------------------|---------|
| `PORT`         | Server port                        | `5000` |
| `NODE_ENV`     | Environment                        | `development` |
| `MONGO_URI`    | MongoDB connection string          | `mongodb://localhost:27017/ems_db` |
| `JWT_SECRET`   | JWT signing secret (keep secret!)  | `my_secret_key` |
| `JWT_EXPIRES_IN` | Token expiry                    | `7d` |
| `FRONTEND_URL` | CORS allowed origin                | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable           | Description         | Example |
|--------------------|---------------------|---------|
| `VITE_API_BASE_URL` | Backend API URL    | `http://localhost:5000/api` |

---

## 📡 API Documentation

### Authentication

| Method | Endpoint              | Body                           | Auth | Description |
|--------|-----------------------|--------------------------------|------|-------------|
| POST   | `/api/auth/register`  | `{ name, email, password }`   | No   | Register user |
| POST   | `/api/auth/login`     | `{ email, password }`          | No   | Login + get token |
| GET    | `/api/auth/profile`   | —                              | Yes  | Get current user |

### Employees

| Method | Endpoint                   | Description |
|--------|----------------------------|-------------|
| GET    | `/api/employees`           | List employees (search, page, sort, filter) |
| GET    | `/api/employees/:id`       | Get single employee |
| POST   | `/api/employees`           | Create employee |
| PUT    | `/api/employees/:id`       | Update employee |
| DELETE | `/api/employees/:id`       | Delete employee |
| GET    | `/api/employees/stats`     | Dashboard stats |

#### Query Parameters for GET `/api/employees`

| Param       | Type   | Default    | Description |
|-------------|--------|------------|-------------|
| `search`    | string | `""`       | Keyword search |
| `page`      | number | `1`        | Page number |
| `limit`     | number | `10`       | Results per page |
| `sortBy`    | string | `createdAt`| Sort field |
| `order`     | string | `desc`     | `asc` or `desc` |
| `department`| string | `""`       | Filter by department |
| `status`    | string | `""`       | Filter by status |

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# Frontend → http://localhost:80
# Backend  → http://localhost:5000
# MongoDB  → localhost:27017
```

---

## ☁️ Cloud Deployment

### Frontend → Vercel

1. Push frontend to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

### Backend → Render

1. Push backend to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env.example`

### Database → MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Whitelist `0.0.0.0/0` for Render IPs
3. Copy the connection string to `MONGO_URI` in Render

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

---

## 📄 License

MIT © EMS Pro
