import { Sparkles } from 'lucide-react';

export const EmptyState = ({
  icon: Icon,
  badgeText = 'SYSTEM // ZERO_STATE',
  title = 'No Data Found',
  description = 'There are no records currently available in this section.',
  action = null,
  secondaryAction = null,
  compact = false,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-8 md:p-12 text-center backdrop-blur-md shadow-xs transition-all duration-300 ${
        compact ? 'py-8' : 'py-12 md:py-16'
      } ${className}`}
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Cyber Corner Decals */}
      <div className="pointer-events-none absolute top-2.5 left-2.5 font-mono text-[9px] text-[var(--muted)] opacity-40 select-none">
        ┌ 0x00
      </div>
      <div className="pointer-events-none absolute top-2.5 right-2.5 font-mono text-[9px] text-[var(--muted)] opacity-40 select-none">
        0x01 ┐
      </div>
      <div className="pointer-events-none absolute bottom-2.5 left-2.5 font-mono text-[9px] text-[var(--muted)] opacity-40 select-none">
        └ ACK
      </div>
      <div className="pointer-events-none absolute bottom-2.5 right-2.5 font-mono text-[9px] text-[var(--muted)] opacity-40 select-none">
        END ┘
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto space-y-4">
        {/* Glowing Central Icon Pod with Radar Rings */}
        <div className="relative flex items-center justify-center">
          {/* Animated ping ring */}
          <div className="absolute inset-0 -m-3 rounded-2xl bg-indigo-500/15 animate-ping opacity-30" />
          <div className="absolute inset-0 -m-1.5 rounded-2xl bg-indigo-500/20 blur-sm" />

          {/* Central Pod */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_24px_rgba(99,102,241,0.25)] backdrop-blur-md">
            {Icon ? (
              <Icon className="w-8 h-8 md:w-10 md:h-10 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            ) : (
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" />
            )}
          </div>
        </div>

        {/* Monospace System Badge */}
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono font-medium text-indigo-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
            </span>
            <span>{badgeText}</span>
          </div>
        )}

        {/* Header and Details */}
        <div className="space-y-1.5">
          <h3 className="text-base md:text-lg font-bold font-display text-[var(--ink-heading)]">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed">
            {description}
          </p>
        </div>

        {/* Interactive Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    </div>
  );
};
