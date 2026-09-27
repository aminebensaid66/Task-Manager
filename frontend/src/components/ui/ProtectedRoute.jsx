import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading workspace…
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

export default ProtectedRoute;
