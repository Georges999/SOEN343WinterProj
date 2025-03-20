import { Navigate } from 'react-router-dom';

// Component for route protection based on authentication
function ProtectedRoute({ element, user, requiredRole }) {
  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user's actual role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'promoter':
        return <Navigate to="/promoter/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />; // For clients
    }
  }

  // If user passes all checks, render the requested component
  return element;
}

export default ProtectedRoute;