import { useState } from 'react';
import { Button } from './Button';
import {
  X,
  FolderGit2,
  ExternalLink,
  Video,
  FileText,
  Users,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const SubmissionDetailModal = ({ isOpen, submission, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !submission) return null;

  const {
    title,
    tagline,
    description,
    repositoryUrl,
    demoUrl,
    videoUrl,
    presentationFile,
    screenshots = [],
    hackathon,
    submittedBy,
    team,
    teamMembers = [],
    evaluations = [],
    score,
  } = submission;

  const getFullUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://localhost:5001${url}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl p-5 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                {hackathon?.title || 'Hackathon Project'}
              </span>
              {score > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Score: {score.toFixed(1)}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            {tagline && <p className="text-xs font-medium text-slate-500">{tagline}</p>}
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Screenshots Gallery / Carousel */}
        {screenshots.length > 0 && (
          <div className="space-y-2">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center group">
              <img
                src={getFullUrl(screenshots[activeImageIndex])}
                alt={`Screenshot ${activeImageIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              {screenshots.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            {screenshots.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {screenshots.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-11 rounded overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={getFullUrl(img)} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Links Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {repositoryUrl && (
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5" /> Repository
            </a>
          )}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Live Demo
            </a>
          )}
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
            >
              <Video className="w-3.5 h-3.5" /> Watch Video
            </a>
          )}
          {presentationFile && (
            <a
              href={getFullUrl(presentationFile)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Presentation PDF
            </a>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900">About the Project</h3>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{description}</p>
        </div>

        {/* Team & Contributors */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {team ? `Team: ${team.name}` : 'Project Contributor'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(teamMembers.length > 0 ? teamMembers : [submittedBy]).map((member, idx) => {
              if (!member) return null;
              const name = typeof member === 'object' ? member.name : 'Participant';
              const email = typeof member === 'object' ? member.email : '';
              return (
                <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{name}</p>
                    {email && <p className="text-[10px] text-slate-400">{email}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evaluations summary if present */}
        {evaluations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Judge Evaluations ({evaluations.length})
            </h3>
            <div className="space-y-1.5">
              {evaluations.map((ev, idx) => (
                <div key={idx} className="p-2 rounded bg-amber-50/50 border border-amber-100 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {ev.judge?.name || 'Judge'} — <span className="text-amber-700 font-bold">{ev.score}/10</span>
                    </p>
                    {ev.feedback && <p className="text-[11px] text-slate-600 mt-0.5">{ev.feedback}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
