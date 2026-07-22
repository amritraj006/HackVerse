import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">403 - Access Denied</h1>
      <p className="text-xs text-slate-500 leading-relaxed">
        Your user role <span className="font-semibold text-slate-800 uppercase">({user?.role || 'Guest'})</span> does not have sufficient permissions to access this page or resource.
      </p>
      <div className="pt-2 flex items-center gap-2">
        <Link to="/dashboard">
          <Button size="sm" variant="primary">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button size="sm" variant="outline">
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};
