# SmartSpend - MERN Expense Tracker

A complete, production-ready MERN application for tracking personal expenses.

## Features
- **User Authentication**: Secure signup/login with JWT.
- **Dashboard**: Monthly summary cards and charts.
- **Daily Entry**: Add transactions with receipt image upload (OCR integration).
- **Monthly Overview**: Detailed charts and breakdown by category/payment method.
- **Budgets**: Set monthly budgets and track progress.
- **Reports**: Filter transactions and export as CSV.
- **Receipts**: Gallery view of uploaded receipts.

## Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas URI)

## Setup Instructions

### 1. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - The `.env` file is already created with default values.
   - Update `MONGODB_URI` if you are not using local MongoDB.
   - Update `JWT_SECRET` for production.

4. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Client runs on `http://localhost:5173`.

## How to Use
1. Open `http://localhost:5173` in your browser.
2. Sign up for a new account.
3. Go to **Daily Entry** to add expenses or income.
   - Try uploading a receipt image to see OCR in action (requires clear text).
4. Visit **Dashboard** and **Monthly Overview** to see charts.
5. Set budgets in the **Budgets** page.
6. Generate reports in the **Reports** page.

## Troubleshooting
- **OCR Issues**: Ensure `tesseract.js` language data can be downloaded (requires internet).
- **Database Connection**: Ensure MongoDB service is running locally (`mongod`).
