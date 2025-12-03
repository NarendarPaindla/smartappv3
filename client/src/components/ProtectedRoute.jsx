import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Admin Check
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Subscription/Trial Check (Skip for Admins)
    if (user.role !== 'admin') {
        const now = new Date();
        const trialEnd = user.trialExpiresAt ? new Date(user.trialExpiresAt) : null;
        const subEnd = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;

        const isTrialActive = trialEnd && trialEnd > now;
        const isSubscribed = user.isSubscribed && subEnd && subEnd > now;

        if (!isTrialActive && !isSubscribed && location.pathname !== '/subscription') {
            return <Navigate to="/subscription" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
