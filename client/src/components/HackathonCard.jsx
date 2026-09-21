import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, ArrowRight, Lock } from 'lucide-react';
import { Button } from './Button';
import { formatDate, formatDateTime } from '../utils/helpers';
import {
  getEffectiveStatus,
  isRegistrationEffectivelyOpen,
  STATUS_BADGE_CLASS,
} from '../utils/hackathonStatus';

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
    prizePool,
    startDate,
    endDate,
    registrationDeadline,
    maxTeamSize,
    tags = [],
    assignedJudges = [],
  } = hackathon;

  // Always compute status from dates for accuracy
  const effectiveStatus = getEffectiveStatus(hackathon);
  const regOpen = isRegistrationEffectivelyOpen(hackathon);
  const statusBadge = STATUS_BADGE_CLASS[effectiveStatus] || STATUS_BADGE_CLASS.draft;

  // User can register only if reg is open and hackathon hasn't started
  const canRegister = regOpen && effectiveStatus === 'upcoming';

  // Hackathon has started = ongoing or ended
  const hasStarted = effectiveStatus !== 'upcoming';

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between gap-5 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400" />
      {/* Top Section */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${statusBadge}`}>
            {effectiveStatus}
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 shrink-0">
            <Trophy className="w-3.5 h-3.5" /> {prizePool || 'N/A'}
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 line-clamp-1">{title}</h2>
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
            Deadline: {formatDateTime(registrationDeadline)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDate(startDate)} → {formatDate(endDate)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            Max {maxTeamSize} per team
          </span>
          {hackathon.maxParticipants > 0 ? (
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Users className="w-3 h-3 text-indigo-600" />
              {hackathon.totalRegisteredUsers || 0}/{hackathon.maxParticipants} Users
              <span
                className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${(hackathon.availableSlots ?? 0) > 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
              >
                {(hackathon.availableSlots ?? 0) > 0 ? `${hackathon.availableSlots} left` : 'Full'}
              </span>
            </span>
          ) : (hackathon.totalRegisteredUsers || 0) > 0 ? (
            <span className="flex items-center gap-1 text-slate-600">
              <Users className="w-3 h-3 text-indigo-500" />
              {hackathon.totalRegisteredUsers} Users
            </span>
          ) : null}
          {assignedJudges.length > 0 && (
            <span className="flex items-center gap-1">
              {assignedJudges.length} Judge{assignedJudges.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Registration & Result Status Badges */}
        {!regOpen && effectiveStatus !== 'ended' && (
          <div className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold">
            <Lock className="w-3 h-3" /> Registrations Closed
          </div>
        )}
        {effectiveStatus === 'ended' && (hackathon.resultStatus === 'pending' || !hackathon.isResultsPublished) && (
          <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 inline-flex items-center gap-1">
            Result Pending
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

            {(() => {
              if (isRegistered) {
                if (regOpen) {
                  return (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50 flex-1"
                      onClick={() => onCancel && onCancel(_id)}
                      disabled={registering}
                    >
                      {registering ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  );
                }
                return null;
              }
              if (canRegister) {
                return (
                  <Button
                    size="sm"
                    variant="primary"
                    className="flex-1"
                    onClick={() => onRegister && onRegister(_id)}
                    disabled={registering}
                  >
                    {registering ? 'Registering...' : 'Register'}
                  </Button>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
