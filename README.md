# Enterprise Operations System (EOS)

A complete full-stack MERN web application for managing a single-user natural products business. Handles inventory, raw materials, sales, orders, and provides analytics dashboard.

## Features

- **Authentication**: Secure login/registration with JWT.
- **Dashboard**: Real-time overview of sales, profit, and low stock alerts.
- **Product Management**: Add, edit, delete products with image upload.
- **Raw Materials**: Track raw material quantities and low stock status.
- **Sales Tracking**: Point of Sale interface to record sales and deduct stock.
- **Order Management**: Track customer orders from Pending to Delivered.
- **Notifications**: Automated alerts for low stock and new orders.

## Tech Stack

- **Frontend**: React (Create React App), Tailwind CSS, Recharts, Axios, React Toastify.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Auth**: JWT, bcryptjs.
- **Uploads**: Multer (Local storage).

## Prerequisites

- Node.js (v14+)
- MongoDB (Running locally on `mongodb://localhost:27017/eos_db`)

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Start the backend server:

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the React application:

```bash
npm start
# App runs on http://localhost:3000
```

## Usage Flow

1.  **Register**: Create an account.
2.  **Onboarding**: Click "Start Using EOS" to initialize profile.
3.  **Add Products**: Go to "Products" page, add items with images, prices, and stock.
4.  **Record Sales**: Use the "Sales" page to add items to cart and complete transaction.
5.  **Manage Orders**: Create new orders and update their status.
6.  **Analytics**: Check the Dashboard for daily/monthly stats.

## Project Structure

- `backend/src/models`: Database schemas (User, Product, Sale, Order, etc.)
- `backend/src/controllers`: Business logic for API endpoints.
- `frontend/src/pages`: React components for each page.
- `frontend/src/context`: Global state management for Auth.
