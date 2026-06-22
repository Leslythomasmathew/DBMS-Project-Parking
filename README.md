# Real-Time Parking Management System

A full-stack MERN (MongoDB, Express, React, Node.js) web application designed to streamline urban parking logistics. The system features real-time slot visualization, manager allocation/approval workflows, pricing, and automated slot recycling.

## 🔗 Live Application & Code
* **Live Link**: [dbms-project-parking.vercel.app](https://dbms-project-parking.vercel.app)
* **GitHub Repository**: [Leslythomasmathew/DBMS-Project-Parking](https://github.com/Leslythomasmathew/DBMS-Project-Parking)

---

## 🔑 Default Test Credentials
Use these pre-seeded accounts to log in and test the application's different interfaces:

### 1. Manager Account (Dashboard for approving slots)
* **Email**: `admin@parking.com`
* **Password**: `password123`

### 2. User Account (Dashboard for booking/payment)
* **Email**: `john@example.com`
* **Password**: `password123`

---

## 🚀 Local Development Setup

To run this project locally on your machine, follow these instructions:

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`

### 1. Backend Setup
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
npm install
```

Configure your environment variables by creating a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/parking_db
JWT_SECRET=supersecretjwtkey_parking123
FRONTEND_URL=http://localhost:5173
```

Seed the local database with slots and test accounts:
```bash
npm run seed
```

Start the local backend development server:
```bash
npm run dev
```

### 2. Frontend Setup
Navigate to the `frontend` folder and install dependencies:
```bash
cd ../frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`. Any API calls to `/api` will be proxied automatically to `http://localhost:5000` via the Vite dev-server configuration.

---

## ☁️ Cloud Deployment Configuration
Both the frontend and backend are deployed in a unified setup on **Vercel**:
* **Backend Runtime**: Served as Serverless Functions (`@vercel/node`) in [vercel.json](vercel.json).
* **Frontend Runtime**: Served as a static build (`@vercel/static-build`) of the React Vite client.
* **Environment Variables**: Managed inside Vercel Dashboard (`MONGODB_URI` points to MongoDB Atlas cloud database).
