import { useState } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Alert } from './Alert';
import { Trophy, Calendar, Sparkles, DollarSign, Users, X, Save } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'draft', label: 'Draft' },
];

export const HackathonForm = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        title: initialData.title || '',
        tagline: initialData.tagline || '',
        description: initialData.description || '',
        prizePool: initialData.prizePool || '$10,000',
        maxTeamSize: initialData.maxTeamSize || 4,
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        registrationDeadline: initialData.registrationDeadline ? new Date(initialData.registrationDeadline).toISOString().split('T')[0] : '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
        status: initialData.status || 'upcoming',
      };
    }
    return {
      title: '',
      tagline: '',
      description: '',
      prizePool: '$10,000',
      maxTeamSize: 4,
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      tags: 'AI, Web3, React, Node.js',
      status: 'upcoming',
    };
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

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
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.registrationDeadline) newErrors.registrationDeadline = 'Deadline is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (err) {
      setFormError(err.message || 'Failed to save hackathon');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <Trophy className="w-4 h-4 text-indigo-600" />
            <span>{initialData ? 'Edit Hackathon Event' : 'Host New Hackathon'}</span>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <Alert type="error" message={formError} onClose={() => setFormError('')} />

          <form id="hackathon-form" onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Hackathon Title"
              id="title"
              placeholder="e.g. AI Global Challenge 2026"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              icon={Trophy}
              required
            />

            <Input
              label="Tagline / Short Summary"
              id="tagline"
              placeholder="Build next-gen LLM agents and multi-agent workflows"
              value={formData.tagline}
              onChange={handleChange}
            />

            <div className="space-y-1">
              <label htmlFor="description" className="block text-xs font-semibold text-slate-700">
                Detailed Description & Rules <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain problem statements, submission requirements, and judging criteria..."
                className={`w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                  errors.description
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Prize Pool"
                id="prizePool"
                placeholder="$25,000"
                value={formData.prizePool}
                onChange={handleChange}
                icon={DollarSign}
              />

              <Input
                label="Max Team Size"
                id="maxTeamSize"
                type="number"
                min={1}
                max={10}
                value={formData.maxTeamSize}
                onChange={handleChange}
                icon={Users}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Registration Deadline"
                id="registrationDeadline"
                type="date"
                value={formData.registrationDeadline}
                onChange={handleChange}
                error={errors.registrationDeadline}
                icon={Calendar}
                required
              />

              <Input
                label="Start Date"
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
                icon={Calendar}
                required
              />

              <Input
                label="End Date"
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
                icon={Calendar}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Tags (Comma Separated)"
                id="tags"
                placeholder="AI, Web3, Open Source, React"
                value={formData.tags}
                onChange={handleChange}
                icon={Sparkles}
              />

              <Select
                label="Initial Event Status"
                id="status"
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={handleChange}
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" form="hackathon-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> {initialData ? 'Update Event' : 'Create Hackathon'}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
