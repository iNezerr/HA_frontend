import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { X, User, ExternalLink } from 'lucide-react';

interface AuthenticatedUserBannerProps {
  onDismiss?: () => void;
  showOnHomepage?: boolean;
}

const AuthenticatedUserBanner: React.FC<AuthenticatedUserBannerProps> = ({ 
  onDismiss, 
  showOnHomepage = true 
}) => {
  const { isAuthenticated, user } = useAuth();
  const [dismissed, setDismissed] = React.useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  // Don't show if not authenticated, dismissed, or not configured to show on homepage
  if (!isAuthenticated || !user || dismissed || !showOnHomepage) {
    return null;
  }

  const dashboardLink = user.is_staff ? '/admin' : '/dashboard';
  const dashboardText = user.is_staff ? 'Admin Dashboard' : 'Dashboard';

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-4 rounded-r-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <User className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-blue-700">
            Welcome back, <span className="font-medium">{user.first_name || 'User'}</span>! 
            You can continue where you left off or explore new opportunities.
          </p>
          <div className="mt-2">
            <Link
              to={dashboardLink}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Go to {dashboardText}
              <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="bg-blue-50 rounded-md text-blue-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50"
            aria-label="Dismiss banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedUserBanner;