import { Card } from './Card';
import { Button } from './Button';
import {
  ExternalLink,
  FolderGit2,
  Video,
  FileText,
  Users,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const SubmissionCard = ({
  submission,
  currentUserId,
  onView,
  onEdit,
  onDelete,
}) => {
  const {
    _id,
    title,
    tagline,
    description,
    repositoryUrl,
    demoUrl,
    videoUrl,
    presentationFile,
    screenshots = [],
    status,
    hackathon,
    submittedBy,
    team,
    teamMembers = [],
  } = submission;

  const isSubmittedByMe =
    currentUserId &&
    (submittedBy?._id === currentUserId ||
      submittedBy === currentUserId ||
      teamMembers.some((m) => (typeof m === 'object' ? m._id : m) === currentUserId));

  // Check if hackathon deadline passed
  const isDeadlinePassed = hackathon?.endDate && new Date() > new Date(hackathon.endDate);

  return (
    <Card className="flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full shrink-0">
            {hackathon?.title || 'Hackathon'}
          </span>
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border shrink-0 ${
              status === 'submitted'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {status === 'submitted' ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Submitted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Draft
              </span>
            )}
          </span>
        </div>

        <div>
          <h3
            onClick={() => onView && onView(submission)}
            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
          >
            {title}
          </h3>
          {tagline && <p className="text-xs font-medium text-slate-600 line-clamp-1 mt-0.5">{tagline}</p>}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">{description}</p>
        </div>

        {/* Screenshots preview */}
        {screenshots.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
            {screenshots.slice(0, 3).map((img, idx) => (
              <img
                key={idx}
                src={img.startsWith('http') ? img : `http://localhost:5001${img}`}
                alt={`Screenshot ${idx + 1}`}
                className="w-12 h-9 object-cover rounded border border-slate-200 shrink-0"
              />
            ))}
            {screenshots.length > 3 && (
              <span className="w-12 h-9 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-500 flex items-center justify-center shrink-0">
                +{screenshots.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* External Links Bar */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {repositoryUrl && (
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-indigo-600 font-medium transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5" /> Repo
            </a>
          )}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-indigo-600 font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Live Demo
            </a>
          )}
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-indigo-600 font-medium transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-rose-500" /> Video
            </a>
          )}
          {presentationFile && (
            <a
              href={presentationFile.startsWith('http') ? presentationFile : `http://localhost:5001${presentationFile}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-indigo-600 font-medium transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" /> PDF
            </a>
          )}
        </div>

        {/* Team / Author info & Card Actions */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[160px]">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{team ? team.name : submittedBy?.name || 'Participant'}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button size="sm" variant="secondary" onClick={() => onView && onView(submission)}>
              View Details
            </Button>

            {isSubmittedByMe && (
              <>
                {!isDeadlinePassed ? (
                  <button
                    onClick={() => onEdit && onEdit(submission)}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Edit Submission (Before Deadline)"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium italic">Locked</span>
                )}
                {!isDeadlinePassed && (
                  <button
                    onClick={() => onDelete && onDelete(_id, title)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Submission"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
