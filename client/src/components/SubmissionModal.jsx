import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './Alert';
import { hackathonService } from '../services/hackathonService';
import { X, FolderGit2, Upload, FileText, Image as ImageIcon, Lock } from 'lucide-react';

export const SubmissionModal = ({ isOpen, submission = null, onClose, onSuccess }) => {
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
    hackathonService.getAll({ status: 'ongoing', limit: 50 })
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data?.hackathons || res?.data || [];
        setHackathons(list);
        if (list.length > 0 && !submission) setHackathonId(list[0]._id);
      })
      .catch(() => {});

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

  if (!isOpen) return null;

  const selectedHackathon = hackathons.find((h) => h._id === hackathonId);
  const isDeadlinePassed = selectedHackathon?.endDate && new Date() > new Date(selectedHackathon.endDate);

  const handleSubmit = async (e) => {
    e.preventDefault();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-5 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <FolderGit2 className="w-4 h-4" />
            <h2 className="text-sm font-bold text-slate-900">
              {submission ? 'Edit Project Submission' : 'Submit Project'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

        {isDeadlinePassed && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            Deadline Passed! Editing is disabled for this hackathon.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Hackathon Selector */}
          {!submission && (
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Hackathon Event</label>
              {hackathons.length === 0 ? (
                <p className="text-rose-500">No active/ongoing hackathons available for submission.</p>
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

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading || isDeadlinePassed}>
              {loading ? (
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Uploading...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  {submission ? 'Save Changes' : status === 'draft' ? 'Save Draft' : 'Submit Project'}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
