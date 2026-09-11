import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, UserCheck, UserPlus, Code2 } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'participant', label: 'Participant (Build & Compete)' },
  { value: 'organizer', label: 'Organizer (Host Hackathons)' },
  { value: 'judge', label: 'Judge (Evaluate Projects)' },
];

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'participant' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
    if (formError) setFormError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
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
    if (result.success) navigate('/dashboard', { replace: true });
    else setFormError(result.error);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(99,102,241,0.3)',
          }}
        >
          <Code2 className="w-5 h-5" style={{ color: '#818cf8' }} />
        </div>
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Create your account
        </h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Join the developer community to organize and participate in hackathons
        </p>
      </div>

      <Alert type="error" message={formError} onClose={() => setFormError('')} />

      <form onSubmit={handleSubmit} className="space-y-3.5">
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
          label="Account Role"
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
          className="w-full mt-1 font-bold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full inline-block"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
              Creating Account...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
            </span>
          )}
        </Button>
      </form>

      {/* Footer link */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
          Already a member?
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
      </div>

      <Link to="/login" className="block">
        <button
          type="button"
          className="w-full py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-normal)',
            color: '#a5b4fc',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'var(--border-normal)';
          }}
        >
          Sign In →
        </button>
      </Link>
    </div>
  );
};
