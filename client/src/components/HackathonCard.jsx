import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, ArrowRight, Lock } from 'lucide-react';
import { Button } from './Button';
import { formatDate } from '../utils/helpers';

const STATUS_BADGE = {
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ended: 'bg-slate-100 text-slate-600 border-slate-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const HackathonCard = ({
  hackathon,
  isRegistered = false,
  onRegister,
  onCancel,
  registering = false,
  showActions = true,
}) => {
  const {
    _id,
    title,
    tagline,
    status,
    prizePool,
    startDate,
    endDate,
    registrationDeadline,
    maxTeamSize,
    isRegistrationOpen,
    tags = [],
    assignedJudges = [],
  } = hackathon;

  const statusBadge = STATUS_BADGE[status] || STATUS_BADGE.draft;
  const canRegister = isRegistrationOpen && (status === 'upcoming' || status === 'ongoing');

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4">
      {/* Top Section */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${statusBadge}`}>
            {status}
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 shrink-0">
            <Trophy className="w-3.5 h-3.5" /> {prizePool || 'N/A'}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 line-clamp-1">{title}</h2>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
            {tagline || 'No description available'}
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded border border-slate-200">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 rounded border border-slate-200">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meta Row */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Deadline: {formatDate(registrationDeadline)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDate(startDate)} → {formatDate(endDate)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            Max {maxTeamSize} per team
          </span>
          {assignedJudges.length > 0 && (
            <span className="flex items-center gap-1">
              {assignedJudges.length} Judge{assignedJudges.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Registration Status Badge */}
        {!isRegistrationOpen && (
          <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold">
            <Lock className="w-3 h-3" /> Registrations Closed
          </div>
        )}
        {isRegistered && (
          <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 inline-flex items-center gap-1">
            ✓ Registered
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <Link to={`/hackathons/${_id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>

            {isRegistered ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 flex-1"
                onClick={() => onCancel && onCancel(_id)}
                disabled={registering}
              >
                {registering ? 'Cancelling...' : 'Cancel'}
              </Button>
            ) : canRegister ? (
              <Button
                size="sm"
                variant="primary"
                className="flex-1"
                onClick={() => onRegister && onRegister(_id)}
                disabled={registering}
              >
                {registering ? 'Registering...' : 'Register'}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
