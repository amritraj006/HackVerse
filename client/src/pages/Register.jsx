import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, UserCheck, UserPlus } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'participant', label: 'Participant (Build & Compete)' },
  { value: 'organizer', label: 'Organizer (Host Hackathons)' },
  { value: 'judge', label: 'Judge (Evaluate Projects)' },
];

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'participant',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
    if (formError) setFormError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormError('');

    const result = await signup(formData);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-base font-bold text-slate-900">Create HackVerse Account</h1>
        <p className="text-xs text-slate-500">Join the developer community to organize and participate</p>
      </div>

      <Alert type="error" message={formError} onClose={() => setFormError('')} />

      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <Input
          label="Full Name"
          id="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={User}
          required
        />

        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={Mail}
          required
        />

        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={Lock}
          required
        />

        <Select
          label="Select Account Role"
          id="role"
          options={ROLE_OPTIONS}
          value={formData.role}
          onChange={handleChange}
          error={errors.role}
          icon={UserCheck}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full mt-2 font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Creating Account...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> Create Account
            </span>
          )}
        </Button>
      </form>

      <div className="text-center pt-2 text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
