import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { FileQuestion, Home as HomeIcon } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
        <FileQuestion className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button size="sm" variant="primary">
          <HomeIcon className="w-3.5 h-3.5" /> Return Home
        </Button>
      </Link>
    </div>
  );
};
