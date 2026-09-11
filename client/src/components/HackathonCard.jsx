import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, ArrowRight, Lock } from 'lucide-react';
import { Button } from './Button';
import { formatDate } from '../utils/helpers';

const STATUS_CONFIG = {
  upcoming: {
    badge:  'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.3)',
    text:   '#a5b4fc',
    bar:    'linear-gradient(90deg, #6366f1, #8b5cf6)',
  },
  ongoing: {
    badge:  'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.3)',
    text:   '#6ee7b7',
    bar:    'linear-gradient(90deg, #10b981, #059669)',
  },
  ended: {
    badge:  'rgba(100,116,139,0.12)',
    border: 'rgba(100,116,139,0.25)',
    text:   '#94a3b8',
    bar:    'linear-gradient(90deg, #475569, #334155)',
  },
  draft: {
    badge:  'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    text:   '#fcd34d',
    bar:    'linear-gradient(90deg, #f59e0b, #d97706)',
  },
  cancelled: {
    badge:  'rgba(244,63,94,0.12)',
    border: 'rgba(244,63,94,0.3)',
    text:   '#fca5a5',
    bar:    'linear-gradient(90deg, #f43f5e, #e11d48)',
  },
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
    _id, title, tagline, status, prizePool,
    startDate, endDate, registrationDeadline,
    maxTeamSize, isRegistrationOpen, tags = [], assignedJudges = [],
  } = hackathon;

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const canRegister = isRegistrationOpen && status === 'upcoming';

  return (
    <div
      className="flex flex-col justify-between gap-3 rounded-xl overflow-hidden hover-lift transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(13,18,32,0.95))',
        border: '1px solid var(--border-normal)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* Gradient top accent bar */}
      <div className="h-0.5 w-full" style={{ background: cfg.bar }} />

      <div className="px-4 pt-3 pb-0 space-y-3">
        {/* Status row */}
        <div className="flex items-start justify-between gap-2">
          <span
            className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border"
            style={{ background: cfg.badge, color: cfg.text, borderColor: cfg.border }}
          >
            {status}
          </span>
          {prizePool && (
            <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#fcd34d' }}>
              <Trophy className="w-3.5 h-3.5" />
              {prizePool}
            </div>
          )}
        </div>

        {/* Title & tagline */}
        <div>
          <h2
            className="text-sm font-bold line-clamp-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h2>
          <p
            className="text-xs line-clamp-2 leading-relaxed mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {tagline || 'No description available'}
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-medium rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span
                className="px-2 py-0.5 text-[10px] font-medium rounded-full"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
              >
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="px-4 pb-4 space-y-2.5">
        <div
          className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] pt-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Calendar className="w-3 h-3" />
            Deadline: {formatDate(registrationDeadline)}
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Calendar className="w-3 h-3" />
            {formatDate(startDate)} → {formatDate(endDate)}
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Users className="w-3 h-3" />
            Max {maxTeamSize}/team
          </span>
          {hackathon.maxParticipants > 0 ? (
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
              <Users className="w-3 h-3" style={{ color: '#818cf8' }} />
              {hackathon.totalRegisteredUsers || 0}/{hackathon.maxParticipants}
              <span
                className="px-1.5 py-0.5 text-[9px] font-bold rounded-full"
                style={{
                  background: (hackathon.availableSlots ?? 0) > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                  color: (hackathon.availableSlots ?? 0) > 0 ? '#6ee7b7' : '#fca5a5',
                  border: `1px solid ${(hackathon.availableSlots ?? 0) > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                }}
              >
                {(hackathon.availableSlots ?? 0) > 0 ? `${hackathon.availableSlots} left` : 'Full'}
              </span>
            </span>
          ) : (hackathon.totalRegisteredUsers || 0) > 0 ? (
            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Users className="w-3 h-3" style={{ color: '#818cf8' }} />
              {hackathon.totalRegisteredUsers} users
            </span>
          ) : null}
          {assignedJudges.length > 0 && (
            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              {assignedJudges.length} Judge{assignedJudges.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          {!isRegistrationOpen && (
            <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#fca5a5' }}>
              <Lock className="w-3 h-3" /> Registrations Closed
            </div>
          )}
          {status === 'ended' && (hackathon.resultStatus === 'pending' || !hackathon.isResultsPublished) && (
            <span
              className="px-2 py-0.5 text-[11px] font-semibold rounded-full"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              Result Pending
            </span>
          )}
          {isRegistered && (
            <span
              className="px-2 py-0.5 text-[11px] font-semibold rounded-full flex items-center gap-1"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              ✓ Registered
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div
            className="flex items-center gap-2 pt-2"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <Link to={`/hackathons/${_id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>

            {(() => {
              const hasStarted = ['ongoing', 'ended'].includes(status) || (startDate && new Date() >= new Date(startDate));
              if (isRegistered) {
                if (!hasStarted) {
                  return (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      style={{ color: '#fca5a5' }}
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
