import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';
import { hackathonService } from '../services/hackathonService';
import { registrationService } from '../services/registrationService';
import { isHackathonEnded, getEffectiveStatus } from '../utils/hackathonStatus';
import { X, FolderGit2, Upload, FileText, Image as ImageIcon, Lock, AlertTriangle, Edit } from 'lucide-react';

export const SubmissionModal = ({
  isOpen,
  submission = null,
  mySubmissions = [],
  onClose,
  onSuccess,
  onEditExisting,
}) => {
  const [hackathonId, setHackathonId] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState('submitted');

  const [presentationFile, setPresentationFile] = useState(null);
  const [screenshots, setScreenshots] = useState([]);

  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    registrationService.getMyRegistrations({ status: 'active', limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const raw = res?.data;
        const regList = Array.isArray(raw) ? raw : raw?.registrations || [];
        const registeredHackathons = regList
          .map((reg) => reg.hackathon)
          .filter((h) => h && h._id);
        setHackathons(registeredHackathons);
        if (registeredHackathons.length > 0 && !submission) setHackathonId(registeredHackathons[0]._id);
      })
      .catch(() => {
        // Fallback to public ongoing hackathons if registration fetch fails
        hackathonService.getAll({ status: 'ongoing', limit: 50 })
          .then((res) => {
            if (!isMounted) return;
            const list = res?.data?.hackathons || res?.data || [];
            setHackathons(list);
            if (list.length > 0 && !submission) setHackathonId(list[0]._id);
          })
          .catch(() => {});
      });

    return () => { isMounted = false; };
  }, [isOpen, submission]);

  // Sync state whenever submission changes when modal is opened
  const [prevSubmissionId, setPrevSubmissionId] = useState(null);
  const currentSubId = submission?._id || (submission ? 'new-sub' : null);

  if (isOpen && currentSubId !== prevSubmissionId) {
    setPrevSubmissionId(currentSubId);
    if (submission) {
      setHackathonId(submission.hackathon?._id || submission.hackathon || '');
      setTitle(submission.title || '');
      setTagline(submission.tagline || '');
      setDescription(submission.description || '');
      setRepositoryUrl(submission.repositoryUrl || '');
      setDemoUrl(submission.demoUrl || '');
      setVideoUrl(submission.videoUrl || '');
      setStatus(submission.status || 'submitted');
    } else {
      setTitle('');
      setTagline('');
      setDescription('');
      setRepositoryUrl('');
      setDemoUrl('');
      setVideoUrl('');
      setStatus('submitted');
      setPresentationFile(null);
      setScreenshots([]);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const selectedHackathon = hackathons.find((h) => h._id === hackathonId);
  const now = new Date();
  const isNotStarted = selectedHackathon && getEffectiveStatus(selectedHackathon, now) === 'upcoming';
  const isDeadlinePassed = selectedHackathon && isHackathonEnded(selectedHackathon, now);

  // ─── One-submission-per-hackathon guard ──────────────────────────────────
  // Only applies when creating a new submission (submission prop is null)
  const existingForHackathon = !submission && hackathonId
    ? mySubmissions.find((s) => {
        const sHackId = s.hackathon?._id || s.hackathon;
        return sHackId && sHackId.toString() === hackathonId.toString();
      })
    : null;
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isNotStarted) {
      setAlert({ type: 'error', message: 'Submissions are not open yet. The hackathon has not started.' });
      return;
    }

    if (isDeadlinePassed) {
      setAlert({ type: 'error', message: 'Submissions are closed as the hackathon deadline has passed.' });
      return;
    }

    if (!title.trim()) {
      setAlert({ type: 'error', message: 'Project title is required' });
      return;
    }

    if (!description.trim()) {
      setAlert({ type: 'error', message: 'Project description is required' });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('hackathonId', hackathonId);
    formData.append('title', title.trim());
    formData.append('tagline', tagline.trim());
    formData.append('description', description.trim());
    formData.append('repositoryUrl', repositoryUrl.trim());
    formData.append('demoUrl', demoUrl.trim());
    formData.append('videoUrl', videoUrl.trim());
    formData.append('status', status);

    if (presentationFile) {
      formData.append('presentationFile', presentationFile);
    }

    if (screenshots && screenshots.length > 0) {
      Array.from(screenshots).forEach((file) => {
        formData.append('screenshots', file);
      });
    }

    try {
      await onSuccess(formData);
      onClose();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to submit project' });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden my-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed & shrink-0 */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                {submission ? 'Edit Project Submission' : 'Submit Project'}
              </h2>
              <p className="text-[11px] text-slate-500 font-normal">
                {submission ? 'Update project media, description & links' : 'Share your project details, repo, and demo'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body - flex-1 min-h-0 */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 min-h-0">

        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

        {isDeadlinePassed && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            Deadline Passed! Editing is disabled for this hackathon.
          </div>
        )}

        {/* ── Duplicate-submission guard ── */}
        {existingForHackathon && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-900">
                  You already have a submission for this hackathon.
                </p>
                <p className="text-[11px] text-amber-800">
                  Only one submission per hackathon is allowed. You can edit or delete your existing submission.
                </p>
                <p className="text-[11px] font-semibold text-amber-900 mt-1">
                  &ldquo;{existingForHackathon.title}&rdquo;
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEditExisting && (
                <Button
                  size="sm"
                  variant="primary"
                  type="button"
                  onClick={() => onEditExisting(existingForHackathon)}
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Existing Submission
                </Button>
              )}
              <Button size="sm" variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* ── Form (hidden when duplicate guard is active for a new submission) ── */}
        {!existingForHackathon && (
          <form id="submission-form" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Hackathon Selector */}
            {!submission && (
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Hackathon Event</label>
                {hackathons.length === 0 ? (
                  <p className="text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    You are not registered for any active hackathons. Only registered participants (or team leaders) can submit a project.
                  </p>
                ) : (
                  <select
                    value={hackathonId}
                    onChange={(e) => setHackathonId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
                  >
                    {hackathons.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.title} (Deadline: {new Date(h.endDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <Input
              label="Project Title"
              placeholder="e.g. SmartDoc Synthesizer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isDeadlinePassed}
              required
            />

            <Input
              label="Tagline / Short Summary"
              placeholder="e.g. AI-powered document vector search agent"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              disabled={isDeadlinePassed}
            />

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Detailed Description</label>
              <textarea
                rows={4}
                placeholder="Explain the problem, technology stack, features, and how to run..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isDeadlinePassed}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="GitHub Repository URL"
                placeholder="https://github.com/org/repo"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                disabled={isDeadlinePassed}
              />
              <Input
                label="Live Demo Link"
                placeholder="https://myproject.vercel.app"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                disabled={isDeadlinePassed}
              />
            </div>

            <Input
              label="Demo Video Link (YouTube / Loom / Vimeo)"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isDeadlinePassed}
            />

            {/* File Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-500" /> Presentation PDF
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPresentationFile(e.target.files[0])}
                  disabled={isDeadlinePassed}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {submission?.presentationFile && !presentationFile && (
                  <p className="text-[10px] text-emerald-600 font-medium">✓ Current presentation attached</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Screenshots (Max 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setScreenshots(e.target.files)}
                  disabled={isDeadlinePassed}
                  className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {submission?.screenshots?.length > 0 && screenshots.length === 0 && (
                  <p className="text-[10px] text-emerald-600 font-medium">✓ {submission.screenshots.length} screenshots uploaded</p>
                )}
              </div>
            </div>

            {/* Submission Status Toggle */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700">Submission Mode</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="submitted"
                    checked={status === 'submitted'}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isDeadlinePassed}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-slate-800">Publish / Submit Project</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === 'draft'}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isDeadlinePassed}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-slate-600">Save as Draft</span>
                </label>
              </div>
            </div>

          </form>
        )}
        </div>

        {/* Fixed Sticky Footer */}
        {!existingForHackathon && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80 shrink-0">
            <Button size="sm" variant="outline" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              form="submission-form"
              disabled={loading || isDeadlinePassed}
            >
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Uploading...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  {submission ? 'Save Changes' : status === 'draft' ? 'Save Draft' : 'Submit Project'}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
