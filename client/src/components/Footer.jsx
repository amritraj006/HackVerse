import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer className="border border-[var(--line)] bg-[var(--surface-card)] py-3 px-4 sm:px-6 text-xs text-[var(--muted)] flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md rounded-2xl shadow-xs transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left">
        <Logo to="/" size="xs" />
        <span className="text-[var(--line)] select-none hidden sm:inline">|</span>
        <span className="font-mono text-[11px] text-[var(--muted)]">
          © {new Date().getFullYear()} HackVerse Net. All rights reserved.
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </span>
          <span className="text-[10px] font-mono text-emerald-500 font-semibold tracking-wider">
            ALL SYSTEMS NOMINAL
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] font-medium text-[var(--muted)]">
          <a href="#privacy" className="hover:text-indigo-400 transition-colors">Privacy</a>
          <span className="text-[var(--line)] select-none">·</span>
          <a href="#terms" className="hover:text-indigo-400 transition-colors">Terms</a>
          <span className="text-[var(--line)] select-none">·</span>
          <a href="#support" className="hover:text-indigo-400 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};
