# ISHAS Organization Management System

একটি সম্পূর্ণ Enterprise-grade, Production-Ready MERN Stack অ্যাপ্লিকেশন — সংগঠনের সদস্য, তহবিল, মিটিং, ইভেন্ট, নোটিশ, ব্লগ, গ্যালারি ও যোগাযোগ ব্যবস্থাপনার জন্য। সম্পূর্ণ বাংলা ভাষায় নির্মিত, Dark/Light Mode ও Glassmorphism ডিজাইন সহ।

---

## ✨ মূল ফিচারসমূহ

| মডিউল | বিবরণ |
|---|---|
| **অথেন্টিকেশন** | Register/Login, ইমেইল OTP ভেরিফিকেশন, JWT Access+Refresh Token (rotation সহ), Forgot/Reset Password, Login Lockout Protection |
| **সদস্য ব্যবস্থাপনা** | Role-based Access (৭টি রোল), Admin Approval Workflow, Digital Membership Card, Profile + Avatar (Cloudinary) |
| **কমিটি** | মেয়াদ-ভিত্তিক কমিটি গঠন, ৯টি পদবী, সদস্য নিয়োগ/অপসারণ |
| **তহবিল ব্যবস্থাপনা** | মাসিক চাঁদা, অনুদান, জরুরি/বিশেষ তহবিল, খরচ — QR-ভেরিফাইড PDF রশিদ, স্বয়ংক্রিয় বকেয়া হিসাব |
| **নোটিশ** | Pin, ক্যাটাগরি, অ্যাটাচমেন্ট, ইমেইল + রিয়েল-টাইম In-app Notification |
| **ইভেন্ট** | রেজিস্ট্রেশন, QR Attendance, Certificate PDF Generation |
| **মিটিং** | নিজস্ব Socket.IO signaling backend + WebRTC (mesh) — Waiting Room, Host Controls, Chat, Screen Share |
| **ব্লগ ও গ্যালারি** | SEO-friendly Slug, Draft/Publish, Like/Comment, Album + Lightbox |
| **সাপোর্ট** | Ticket System (threaded replies), FAQ |
| **রিপোর্ট** | Financial/Members/Dues/Attendance — PDF ও Excel এক্সপোর্ট |
| **রিয়েল-টাইম নোটিফিকেশন** | Socket.IO দিয়ে instant in-app alert |
| **PWA** | Installable, Offline App-shell Caching |

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB + Mongoose, Socket.IO, JWT, Bcrypt, Nodemailer, Cloudinary, PDFKit, QRCode, ExcelJS, Helmet, Rate Limiter

**Frontend:** React 18, Vite, Redux Toolkit + RTK Query, Tailwind CSS, Framer Motion, React Hook Form, React Router v6, Recharts, Socket.IO Client

---

## 📁 প্রজেক্ট স্ট্রাকচার

```
ishas-project/
├── backend/          # Express API + Socket.IO server
│   ├── config/       # DB, env, cloudinary, swagger config
│   ├── controllers/  # Route handlers (business logic)
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routers
│   ├── middleware/   # Auth, security, validation, upload, socket auth
│   ├── sockets/      # Socket.IO /meeting namespace (WebRTC signaling)
│   ├── utils/        # Helpers — PDF/Excel generation, tokens, dues calculator etc.
│   ├── templates/emails/  # HTML email templates
│   └── server.js, app.js
├── frontend/         # React SPA
│   └── src/
│       ├── api/          # RTK Query base setup (auto token refresh)
│       ├── features/     # RTK Query endpoint slices per domain
│       ├── components/   # Reusable UI + layout + feature components
│       ├── pages/        # Route-level pages (auth, dashboard, admin)
│       ├── hooks/        # useAuthBootstrap, useMeetingSocket, etc.
│       └── routes/       # React Router configuration + guards
├── docker-compose.yml
└── package.json      # npm workspaces root
```

---

## 🚀 লোকাল ইনস্টলেশন (Development)

### প্রয়োজনীয় জিনিস
- Node.js ≥ 18
- MongoDB (লোকাল অথবা MongoDB Atlas)
- Cloudinary অ্যাকাউন্ট (ছবি আপলোডের জন্য)
- SMTP ইমেইল অ্যাকাউন্ট (Gmail App Password অথবা অন্য কোনো SMTP প্রোভাইডার)

### ধাপ ১ — Dependencies ইনস্টল করুন
রুট ডিরেক্টরিতে (npm workspaces ব্যবহার করে ব্যাকএন্ড ও ফ্রন্টএন্ড উভয়ই একসাথে ইনস্টল হবে):
```bash
npm install
```

### ধাপ ২ — Environment Variables সেট করুন
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
এরপর `backend/.env` ফাইলে আপনার MongoDB URI, JWT সিক্রেট, SMTP তথ্য ও Cloudinary ক্রেডেনশিয়াল বসান।

### ধাপ ৩ — প্রথম Owner একাউন্ট তৈরি করুন
Registration করা যেকোনো ইউজারকে approve করার জন্য একজন Owner দরকার। Seed স্ক্রিপ্ট প্রথম Owner তৈরি করবে (`.env` এ `OWNER_EMAIL`/`OWNER_PASSWORD` দিয়ে কাস্টমাইজ করা যায়):
```bash
npm run seed
```

### ধাপ ৪ — Development সার্ভার চালু করুন
```bash
npm run dev
```
এই একটি কমান্ডই Backend (পোর্ট ৫০০০) ও Frontend (পোর্ট ৫১৭৩) — দুটোই একসাথে চালু করবে।

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- API Documentation (Swagger): http://localhost:5000/api-docs

Owner হিসেবে লগইন করুন (`OWNER_EMAIL` / `OWNER_PASSWORD`, ডিফল্ট: `owner@ishas.org` / `ChangeMe@12345`) এবং **প্রথম লগইনের পরপরই পাসওয়ার্ড পরিবর্তন করুন**।

---

## 🐳 Docker দিয়ে চালানো (Production)

```bash
cp .env.example .env   # .env ফাইলে সিক্রেট ভ্যালুগুলো বসান
docker compose up --build
```
- Frontend (Nginx দিয়ে served, API প্রক্সি করা): http://localhost
- Backend সরাসরি: http://localhost:5000
- MongoDB ডেটা `ishas_mongo_data` volume-এ persist থাকবে

প্রথমবার Owner তৈরি করতে:
```bash
docker compose exec backend npm run seed
```

---

## 📜 প্রধান Scripts (রুট থেকে)

| Command | কাজ |
|---|---|
| `npm run dev` | Backend + Frontend একসাথে চালু (concurrently) |
| `npm run dev:backend` | শুধু Backend |
| `npm run dev:frontend` | শুধু Frontend |
| `npm run build:frontend` | Frontend প্রোডাকশন বিল্ড |
| `npm run seed` | প্রথম Owner + ডিফল্ট Settings তৈরি |

---

## 🔐 নিরাপত্তা বৈশিষ্ট্য

Helmet, CORS, Mongo Sanitize, XSS-Clean, HPP, Rate Limiting (গ্লোবাল + Auth-নির্দিষ্ট কড়া লিমিট), Bcrypt Password Hashing, JWT Access+Refresh Rotation, HttpOnly Cookies, Login Lockout, Role-Based Access Control (Backend + Frontend উভয় স্তরে)।

## 📖 API Documentation

সম্পূর্ণ REST API ডকুমেন্টেশন Swagger UI-তে দেখা যাবে: `/api-docs` (backend চালু থাকা অবস্থায়)।

## 📄 লাইসেন্স

এই প্রজেক্টটি ISHAS Organization-এর জন্য কাস্টম-নির্মিত। সর্বস্বত্ব সংরক্ষিত।
