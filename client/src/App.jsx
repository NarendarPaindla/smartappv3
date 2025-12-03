import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import DailyEntry from './pages/DailyEntry';
import MonthlyOverview from './pages/MonthlyOverview';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import DailyAnalysis from './pages/DailyAnalysis';
import Loans from './pages/Loans';
import Receipts from './pages/Receipts';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Subscription from './pages/Subscription';
import Calculators from './pages/Calculators';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/daily-entry" element={<ProtectedRoute><Layout><DailyEntry /></Layout></ProtectedRoute>} />
          <Route path="/monthly-overview" element={<ProtectedRoute><Layout><MonthlyOverview /></Layout></ProtectedRoute>} />
          <Route path="/budgets" element={<ProtectedRoute><Layout><Budgets /></Layout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
          <Route path="/daily-analysis" element={<ProtectedRoute><Layout><DailyAnalysis /></Layout></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><Layout><Loans /></Layout></ProtectedRoute>} />
          <Route path="/receipts" element={<ProtectedRoute><Layout><Receipts /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />

          <Route path="/subscription" element={<ProtectedRoute><Layout><Subscription /></Layout></ProtectedRoute>} />
          <Route path="/calculators" element={<ProtectedRoute><Layout><Calculators /></Layout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
