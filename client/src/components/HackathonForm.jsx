import { useState, useEffect, useRef } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Alert } from './Alert';
import { Trophy, Calendar, Sparkles, DollarSign, Users, X, Save, Clock, Wand2, ChevronDown, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'draft', label: 'Draft' },
];

const HOUR_OPTIONS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTE_OPTIONS = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '59'];

const parseDateParts = (isoString, defaultHour = '09', defaultMinute = '00', defaultPeriod = 'AM') => {
  if (!isoString) {
    return { date: '', hour: defaultHour, minute: defaultMinute, period: defaultPeriod };
  }
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    return { date: '', hour: defaultHour, minute: defaultMinute, period: defaultPeriod };
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;

  let h = d.getHours();
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const hour = String(h).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');

  return { date, hour, minute, period };
};

const combineToIso = (dateStr, hourStr, minStr, period) => {
  if (!dateStr) return '';
  let h = parseInt(hourStr, 10) || 12;
  const m = parseInt(minStr, 10) || 0;
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;

  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day, h, m, 0);
  return d.toISOString();
};

const formatPreview = (dateStr, hour, minute, period) => {
  if (!dateStr) return 'Select date';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    let h = parseInt(hour, 10) || 12;
    const min = parseInt(minute, 10) || 0;
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const dateObj = new Date(y, m - 1, d, h, min, 0);
    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid date';
  }
};

const DateTimeField = ({
  label,
  icon: Icon = Calendar,
  dateValue,
  onDateChange,
  hourValue,
  onHourChange,
  minuteValue,
  onMinuteChange,
  periodValue,
  onPeriodChange,
  onPresetClick,
  presets = [],
  error,
  disabled = false,
  required = false,
}) => {
  const preview = formatPreview(dateValue, hourValue, minuteValue, periodValue);

  return (
    <div className={`p-3 bg-slate-50 border rounded-xl space-y-2 transition-all ${
      error ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200/90'
    } ${disabled ? 'opacity-65' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
          {disabled && (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
              Locked
            </span>
          )}
        </label>
        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3 text-indigo-500" />
          {preview}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
        {/* Date input */}
        <div className="sm:col-span-6">
          <input
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={disabled}
            className={`w-full py-1.5 px-3 text-xs bg-white border rounded-lg text-slate-800 focus:outline-none transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed ${
              error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
            }`}
            required={required}
          />
        </div>

        {/* Hour & Minute selects */}
        <div className="sm:col-span-3 flex items-center gap-1">
          <select
            value={hourValue}
            onChange={(e) => onHourChange(e.target.value)}
            disabled={disabled}
            className="w-full py-1.5 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold text-center cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
            title="Hour"
          >
            {HOUR_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className="font-bold text-slate-400 text-xs">:</span>
          <select
            value={minuteValue}
            onChange={(e) => onMinuteChange(e.target.value)}
            disabled={disabled}
            className="w-full py-1.5 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold text-center cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
            title="Minute"
          >
            {!MINUTE_OPTIONS.includes(minuteValue) && (
              <option value={minuteValue}>{minuteValue}</option>
            )}
            {MINUTE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* AM / PM Segmented Toggle */}
        <div className="sm:col-span-3 flex rounded-lg border border-slate-200 overflow-hidden bg-white p-0.5">
          <button
            type="button"
            onClick={() => onPeriodChange('AM')}
            disabled={disabled}
            className={`flex-1 py-1 text-xs font-bold rounded transition-colors cursor-pointer disabled:cursor-not-allowed ${
              periodValue === 'AM'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange('PM')}
            disabled={disabled}
            className={`flex-1 py-1 text-xs font-bold rounded transition-colors cursor-pointer disabled:cursor-not-allowed ${
              periodValue === 'PM'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Quick presets */}
      {!disabled && presets.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[10px]">
          <span className="text-slate-400 font-medium">Quick time:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onPresetClick(p.hour, p.minute, p.period)}
              className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-slate-600 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export const HackathonForm = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState(() => {
    const regParts = parseDateParts(initialData?.registrationDeadline, '11', '59', 'PM');
    const startParts = parseDateParts(initialData?.startDate, '09', '00', 'AM');
    const endParts = parseDateParts(initialData?.endDate, '06', '00', 'PM');

    return {
      title: initialData?.title || '',
      tagline: initialData?.tagline || '',
      description: initialData?.description || '',
      prizePool: initialData?.prizePool || '$10,000',
      maxTeamSize: initialData?.maxTeamSize || 4,
      maxParticipants: initialData?.maxParticipants !== undefined ? initialData.maxParticipants : 0,
      tags: Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : initialData?.tags || 'AI, Web3, React, Node.js',
      status: initialData?.status || 'upcoming',

      // Registration Deadline
      registrationDeadlineDate: regParts.date,
      registrationDeadlineHour: regParts.hour,
      registrationDeadlineMinute: regParts.minute,
      registrationDeadlinePeriod: regParts.period,

      // Hackathon Start Date & Time
      startDate: startParts.date,
      startHour: startParts.hour,
      startMinute: startParts.minute,
      startPeriod: startParts.period,

      // Hackathon End Date & Time
      endDate: endParts.date,
      endHour: endParts.hour,
      endMinute: endParts.minute,
      endPeriod: endParts.period,
    };
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  // AI panel state
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccess, setAiSuccess] = useState(false);
  const aiPanelRef = useRef(null);

  // Synchronize when initialData changes or modal opens
  useEffect(() => {
    if (!isOpen) return;
    const regParts = parseDateParts(initialData?.registrationDeadline, '11', '59', 'PM');
    const startParts = parseDateParts(initialData?.startDate, '09', '00', 'AM');
    const endParts = parseDateParts(initialData?.endDate, '06', '00', 'PM');

    setFormData({
      title: initialData?.title || '',
      tagline: initialData?.tagline || '',
      description: initialData?.description || '',
      prizePool: initialData?.prizePool || '$10,000',
      maxTeamSize: initialData?.maxTeamSize || 4,
      maxParticipants: initialData?.maxParticipants !== undefined ? initialData.maxParticipants : 0,
      tags: Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : initialData?.tags || 'AI, Web3, React, Node.js',
      status: initialData?.status || 'upcoming',

      registrationDeadlineDate: regParts.date,
      registrationDeadlineHour: regParts.hour,
      registrationDeadlineMinute: regParts.minute,
      registrationDeadlinePeriod: regParts.period,

      startDate: startParts.date,
      startHour: startParts.hour,
      startMinute: startParts.minute,
      startPeriod: startParts.period,

      endDate: endParts.date,
      endHour: endParts.hour,
      endMinute: endParts.minute,
      endPeriod: endParts.period,
    });
    setErrors({});
    setFormError('');
  }, [initialData, isOpen]);

  // Reset AI panel when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAiPanelOpen(false);
      setAiPrompt('');
      setAiError('');
      setAiSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAiGenerate = async () => {
    if (!formData.title.trim()) {
      setAiError('Please fill in the Hackathon Title before generating a description.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiSuccess(false);
    try {
      const res = await api.post('/ai/hackathon-description', {
        title: formData.title,
        tagline: formData.tagline,
        userPrompt: aiPrompt,
        tags: formData.tags,
        prizePool: formData.prizePool,
        tone: aiTone,
      });
      const generated = res?.data?.description || res?.description || '';
      if (generated) {
        setFormData((prev) => ({ ...prev, description: generated }));
        setAiSuccess(true);
        setAiPanelOpen(false);
        if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
        setTimeout(() => setAiSuccess(false), 3000);
      } else {
        setAiError('AI returned an empty response. Please try again.');
      }
    } catch (err) {
      setAiError(err?.message || 'Failed to generate description. Check your API key or try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Check if hackathon has already started (lock start date/reg deadline if so)
  const hasStarted = initialData && (
    initialData.status === 'ongoing' ||
    initialData.status === 'ended' ||
    (initialData.startDate && new Date() >= new Date(initialData.startDate))
  );

  // Check if current submission deadline has passed (Rules 2 & 6: host cannot increase once reached)
  const isSubmissionDeadlinePassed = Boolean(
    initialData?.endDate && new Date() >= new Date(initialData.endDate)
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
    if (formError) setFormError('');
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (formError) setFormError('');
  };

  const handlePreset = (prefix, hour, minute, period) => {
    setFormData((prev) => ({
      ...prev,
      [`${prefix}Hour`]: hour,
      [`${prefix}Minute`]: minute,
      [`${prefix}Period`]: period,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (!formData.registrationDeadlineDate) {
      newErrors.registrationDeadline = 'Registration deadline date is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.registrationDeadlineDate && formData.startDate) {
      const regIso = combineToIso(
        formData.registrationDeadlineDate,
        formData.registrationDeadlineHour,
        formData.registrationDeadlineMinute,
        formData.registrationDeadlinePeriod
      );
      const startIso = combineToIso(
        formData.startDate,
        formData.startHour,
        formData.startMinute,
        formData.startPeriod
      );
      if (new Date(startIso) <= new Date(regIso)) {
        newErrors.startDate = 'Start date & time must be after the registration deadline';
      }
    }

    if (formData.startDate && formData.endDate) {
      const startIso = combineToIso(
        formData.startDate,
        formData.startHour,
        formData.startMinute,
        formData.startPeriod
      );
      const endIso = combineToIso(
        formData.endDate,
        formData.endHour,
        formData.endMinute,
        formData.endPeriod
      );
      if (new Date(endIso) <= new Date(startIso)) {
        newErrors.endDate = 'End date & time must be after the start date & time';
      }
    }

    if (initialData?.endDate && formData.endDate) {
      const currentEnd = new Date(initialData.endDate);
      const newEndIso = combineToIso(
        formData.endDate,
        formData.endHour,
        formData.endMinute,
        formData.endPeriod
      );
      const newEnd = new Date(newEndIso);

      if (newEnd.getTime() !== currentEnd.getTime()) {
        if (new Date() >= currentEnd) {
          newErrors.endDate = 'Once the current submission deadline has been reached, it cannot be extended.';
        } else if (newEnd <= currentEnd) {
          newErrors.endDate = 'The submission deadline can only be increased and cannot be decreased.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const startDateIso = combineToIso(
      formData.startDate,
      formData.startHour,
      formData.startMinute,
      formData.startPeriod
    );
    const endDateIso = combineToIso(
      formData.endDate,
      formData.endHour,
      formData.endMinute,
      formData.endPeriod
    );
    const regDeadlineIso = combineToIso(
      formData.registrationDeadlineDate,
      formData.registrationDeadlineHour,
      formData.registrationDeadlineMinute,
      formData.registrationDeadlinePeriod
    );

    const submissionPayload = {
      title: formData.title,
      tagline: formData.tagline,
      description: formData.description,
      prizePool: formData.prizePool,
      maxTeamSize: formData.maxTeamSize,
      maxParticipants: formData.maxParticipants,
      tags: formData.tags,
      status: formData.status,
      startDate: startDateIso,
      endDate: endDateIso,
      registrationDeadline: regDeadlineIso,
    };

    try {
      await onSubmit(submissionPayload);
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
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
              {/* Description label row with AI toggle */}
              <div className="flex items-center justify-between">
                <label htmlFor="description" className="block text-xs font-semibold text-slate-700">
                  Detailed Description &amp; Rules <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAiPanelOpen((v) => !v);
                    setAiError('');
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer select-none ${
                    aiPanelOpen
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200'
                      : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:border-violet-400'
                  }`}
                >
                  <Wand2 className="w-3 h-3" />
                  ✨ AI Generate
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      aiPanelOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* AI Panel */}
              {aiPanelOpen && (
                <div
                  ref={aiPanelRef}
                  className="border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-3 space-y-2.5 animate-fade-in"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-800">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    Generate Description with Gemini AI
                  </div>

                  {/* Context pills (read-only) */}
                  {(formData.title || formData.tagline) && (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.title && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold border border-indigo-200/80">
                          <Trophy className="w-2.5 h-2.5" /> {formData.title}
                        </span>
                      )}
                      {formData.tagline && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-semibold border border-violet-200/80">
                          <Sparkles className="w-2.5 h-2.5" /> {formData.tagline}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Prompt input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600">Your prompt (optional)</label>
                    <textarea
                      rows={2}
                      value={aiPrompt}
                      onChange={(e) => { setAiPrompt(e.target.value); setAiError(''); }}
                      placeholder="e.g. Focus on machine learning challenges, 3 problem tracks, teams of 4, beginner friendly..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-violet-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  {/* Tone selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-600 shrink-0">Tone:</span>
                    {['professional', 'exciting', 'technical', 'friendly'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAiTone(t)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer capitalize ${
                          aiTone === t
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Error */}
                  {aiError && (
                    <div className="flex items-start gap-1.5 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                      {aiError}
                    </div>
                  )}

                  {/* Generate button */}
                  <div className="flex items-center justify-between pt-0.5">
                    <p className="text-[10px] text-slate-500">Uses title, tagline &amp; your prompt as context</p>
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm shadow-violet-200"
                    >
                      {aiLoading ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                      ) : (
                        <><Wand2 className="w-3.5 h-3.5" /> Generate Description</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Success banner */}
              {aiSuccess && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  AI description generated and applied! Review and edit below.
                </div>
              )}

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              <Input
                label="Total User Limit (0 = No limit)"
                id="maxParticipants"
                type="number"
                min={0}
                placeholder="e.g. 50 (0 for no limit)"
                value={formData.maxParticipants}
                onChange={handleChange}
                icon={Users}
              />
            </div>

            {/* Schedule, Times and AM/PM Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Hackathon Schedule & Exact Deadlines
                </span>
                <span className="text-[11px] text-slate-500">Configure Date, Time & AM/PM</span>
              </div>

              {/* 1. Registration Deadline */}
              <DateTimeField
                label="Registration Deadline"
                dateValue={formData.registrationDeadlineDate}
                onDateChange={(val) => handleFieldChange('registrationDeadlineDate', val)}
                hourValue={formData.registrationDeadlineHour}
                onHourChange={(val) => handleFieldChange('registrationDeadlineHour', val)}
                minuteValue={formData.registrationDeadlineMinute}
                onMinuteChange={(val) => handleFieldChange('registrationDeadlineMinute', val)}
                periodValue={formData.registrationDeadlinePeriod}
                onPeriodChange={(val) => handleFieldChange('registrationDeadlinePeriod', val)}
                onPresetClick={(h, m, p) => handlePreset('registrationDeadline', h, m, p)}
                presets={[
                  { label: '11:59 PM', hour: '11', minute: '59', period: 'PM' },
                  { label: '06:00 PM', hour: '06', minute: '00', period: 'PM' },
                  { label: '12:00 PM (Noon)', hour: '12', minute: '00', period: 'PM' },
                ]}
                error={errors.registrationDeadline}
                disabled={hasStarted}
                required
              />

              {/* 2. Hackathon Start Date & Time */}
              <DateTimeField
                label="Hackathon Start Time"
                dateValue={formData.startDate}
                onDateChange={(val) => handleFieldChange('startDate', val)}
                hourValue={formData.startHour}
                onHourChange={(val) => handleFieldChange('startHour', val)}
                minuteValue={formData.startMinute}
                onMinuteChange={(val) => handleFieldChange('startMinute', val)}
                periodValue={formData.startPeriod}
                onPeriodChange={(val) => handleFieldChange('startPeriod', val)}
                onPresetClick={(h, m, p) => handlePreset('start', h, m, p)}
                presets={[
                  { label: '09:00 AM (Morning)', hour: '09', minute: '00', period: 'AM' },
                  { label: '10:00 AM', hour: '10', minute: '00', period: 'AM' },
                  { label: '12:00 PM (Noon)', hour: '12', minute: '00', period: 'PM' },
                  { label: '02:00 PM', hour: '02', minute: '00', period: 'PM' },
                ]}
                error={errors.startDate}
                disabled={hasStarted}
                required
              />

              {/* 3. Hackathon End Date & Time */}
              <DateTimeField
                label="Hackathon End Time (Submission Deadline)"
                dateValue={formData.endDate}
                onDateChange={(val) => handleFieldChange('endDate', val)}
                hourValue={formData.endHour}
                onHourChange={(val) => handleFieldChange('endHour', val)}
                minuteValue={formData.endMinute}
                onMinuteChange={(val) => handleFieldChange('endMinute', val)}
                periodValue={formData.endPeriod}
                onPeriodChange={(val) => handleFieldChange('endPeriod', val)}
                onPresetClick={(h, m, p) => handlePreset('end', h, m, p)}
                presets={[
                  { label: '06:00 PM (Evening)', hour: '06', minute: '00', period: 'PM' },
                  { label: '11:59 PM (Midnight)', hour: '11', minute: '59', period: 'PM' },
                  { label: '05:00 PM', hour: '05', minute: '00', period: 'PM' },
                ]}
                error={errors.endDate}
                disabled={isSubmissionDeadlinePassed}
                required
              />
              {isSubmissionDeadlinePassed && (
                <p className="text-[11px] text-slate-500 font-medium bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                  🔒 The submission deadline has passed and cannot be extended.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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

