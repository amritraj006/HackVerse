import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    login({ name: 'Developer User', email: email || 'user@hackverse.io', role: 'participant' }, 'sample_jwt');
    navigate('/dashboard');
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-base font-bold text-slate-900">Sign in to HackVerse</h1>
        <p className="text-xs text-slate-500">Access your hackathons, submissions, and developer profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Email Address</label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <a href="#forgot" className="text-[11px] text-indigo-600 hover:underline">Forgot password?</a>
          </div>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" size="md" className="w-full mt-2 font-semibold">
          Sign In
        </Button>
      </form>

      <div className="text-center pt-2 text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
          Create one now
        </Link>
      </div>
    </div>
  );
};
