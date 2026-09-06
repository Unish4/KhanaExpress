# 🥟 KhanaExpress - Food Delivery & Restaurant Management Platform

KhanaExpress is a modern, full-stack food delivery and restaurant management platform tailored for local food ecosystems in Nepal (featuring NPR `Rs.` currency formatting, local Nepalese cuisines, and multi-role portals).

Built with **React 19 + Vite + Tailwind CSS + Zustand** on the frontend and **Node.js + Express + Mongoose + Socket.io + Arcjet** on the backend.

---

## 🌟 Key Features & Role Portals

KhanaExpress provides end-to-end multi-role experiences:

### 🛍️ Customer Discovery & Ordering (`/`, `/restaurants`, `/checkout`, `/orders/:id/track`)
- **Landing & Discovery**: Dynamic food categories, featured restaurants, and instant search.
- **Storefront & Menu**: Filter dishes by category, dietary preferences (Vegetarian/Vegan), and spice level (0-3).
- **Cart & Checkout**: Persistent cart via Zustand, multiple delivery addresses, payment selection (Cash on Delivery / Online Payment), and instant order placement.
- **Live Order Tracking**: Interactive status stepper (Pending → Confirmed → Preparing → Ready → Delivering → Delivered) with real-time WebSocket updates and 5-star review modal.

### 🏪 Restaurant Owner Portal (`/owner/*`)
- **Owner Dashboard**: Real-time sales metrics, total order counts, and restaurant open/closed status toggle.
- **Order Pipeline**: Accept incoming customer orders, manage cooking progression (`preparing` → `ready`), and view customer contact info.
- **Menu Management**: Add, edit, or delete menu items with dish image upload, price (NPR `Rs.`), dietary tags, and out-of-stock toggles.
- **Store Settings**: Update restaurant profile info, banner cover image, delivery fee, minimum order value, and operating hours.

### 🚴 Delivery Partner Portal (`/delivery/*`)
- **Rider Availability**: Toggle Online (`Accepting Orders`) vs Offline status.
- **Available Orders Feed**: Live feed of ready unassigned food orders with pickup restaurant details, customer delivery address, and estimated delivery fee earnings.
- **Active Delivery Tracking**: Interactive step-by-step workflow (Restaurant Pickup → Customer Dropoff → Cash Collection → Delivery Confirmation).
- **Earnings & History**: Summary metrics of total completed deliveries, total earnings in NPR, and historical delivery logs.

### 🛡️ System Admin Dashboard (`/admin/*`)
- **Platform Analytics**: Gross Merchandise Value (GMV) total sales, 10% platform commission earnings, active store counts, and top revenue partner rankings.
- **Partner Approvals**: Directory of partner stores with instant activation/deactivation and homepage `Featured ⭐` badge toggles.
- **User Account Management**: Search user directory by role (`customer`, `restaurant`, `delivery`, `admin`), modify user roles, and block/unblock accounts.
- **System Order Auditing**: Comprehensive audit log across all system orders.

### ⚡ Real-time WebSockets & Push Notifications (`Socket.io`)
- **Order Tracking Room**: Instant visual status updates for customers as food prepares and travels.
- **Restaurant Alert Room**: Immediate audio/toast notification alerts for restaurant owners when new orders are placed.
- **Delivery Feed Room**: Real-time push updates for delivery riders when orders transition to `ready`.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS 4 + Lucide React Icons
- **State Management**: Zustand
- **Routing**: React Router DOM v7
- **Data Fetching & API**: Axios
- **Real-Time Client**: Socket.io Client
- **Notifications**: React Hot Toast
- **Visualization**: Recharts & Leaflet Maps

### Backend
- **Runtime & Server**: Node.js + Express 5
- **Database**: MongoDB with Mongoose ODM
- **Real-Time WebSockets**: Socket.io
- **Security & Rate Limiting**: Arcjet Security (`@arcjet/node`) + Helmet + CORS
- **Authentication**: JWT (JSON Web Tokens) + BcryptJS password hashing
- **File Uploads**: Multer + Cloudinary SDK

---

## 🗺️ Project Roadmap - All 10 Phases Completed

- [x] **Phase 1**: Project Foundation, Design System, Base UI Layouts
- [x] **Phase 2**: Auth, Onboarding & User Profile (`/login`, `/register`, `/account`)
- [x] **Phase 3**: Customer Browse, Search & Restaurant Storefront
- [x] **Phase 4**: Cart & Checkout Engine
- [x] **Phase 5**: Live Order Tracking & History
- [x] **Phase 6**: Restaurant Owner Portal (`/owner/*`)
- [x] **Phase 7**: Delivery Partner Portal (`/delivery/*`)
- [x] **Phase 8**: System Admin Dashboard (`/admin/*`)
- [x] **Phase 9**: Real-time WebSockets & Push Notifications (`Socket.io`)
- [x] **Phase 10**: Final Polish, Code Splitting & Deployment Readiness

---

## 🚀 Getting Started & Environment Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB instance (local or MongoDB Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/khanaexpress
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173

# Optional Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional Arcjet Security Key
ARCJET_KEY=ajkey_your_key
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).
