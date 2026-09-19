import { Link } from 'react-router-dom';

export const LogoIcon = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12',
  };

  const dimension = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${dimension} ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-xs">
        <defs>
          <linearGradient id="hv-icon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="hv-icon-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="hv-icon-violet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
        </defs>

        {/* Base Rounded Squircle with Subtle Gradient & Border */}
        <rect x="3" y="3" width="58" height="58" rx="16" fill="url(#hv-icon-bg)" />
        <rect x="3.75" y="3.75" width="56.5" height="56.5" rx="15.25" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" />

        {/* Left Bracket < (Cyan / Sky) */}
        <path
          d="M25 18 L15 32 L25 46 L29.5 42.5 L21.5 32 L29.5 21.5 Z"
          fill="url(#hv-icon-cyan)"
        />

        {/* Right Bracket > (Violet / Pink) */}
        <path
          d="M39 18 L49 32 L39 46 L34.5 42.5 L42.5 32 L34.5 21.5 Z"
          fill="url(#hv-icon-violet)"
        />

        {/* Central Dimensional 'V' Apex (Crisp White) */}
        <path
          d="M26 23 L32 41 L38 23 L34.2 23 L32 32.5 L29.8 23 Z"
          fill="#FFFFFF"
          opacity="0.95"
        />

        {/* Core Nexus / Spark Node */}
        <circle cx="32" cy="45.5" r="2.5" fill="#38BDF8" />
        <circle cx="32" cy="45.5" r="1.2" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export const Logo = ({
  size = 'md',
  showText = true,
  variant = 'default', // 'default' | 'white' | 'dark'
  showBadge = false,
  badgeText = 'Platform',
  to = null,
  className = '',
}) => {
  const textSizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const badgeSizeMap = {
    xs: 'text-[8px] px-1 py-0.2',
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-1.5 py-0.5',
    lg: 'text-[11px] px-2 py-0.5',
    xl: 'text-xs px-2.5 py-1',
  };

  const textColorClass =
    variant === 'white'
      ? 'text-white'
      : variant === 'dark'
      ? 'text-slate-100'
      : 'text-slate-900';

  const verseGradientClass =
    variant === 'white'
      ? 'text-indigo-200'
      : 'bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent';

  const content = (
    <div className={`inline-flex items-center gap-2 group select-none ${className}`}>
      <LogoIcon size={size} className="transition-transform duration-200 group-hover:scale-105" />
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight ${textSizeMap[size] || textSizeMap.md} ${textColorClass} transition-colors`}>
            Hack<span className={verseGradientClass}>Verse</span>
          </span>
          {showBadge && (
            <span
              className={`font-semibold uppercase tracking-wider rounded border ${
                variant === 'white'
                  ? 'bg-white/10 text-indigo-200 border-white/20'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              } ${badgeSizeMap[size] || badgeSizeMap.md}`}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
};
