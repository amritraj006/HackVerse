import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-3 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <Logo to="/" size="xs" />
        <span className="text-slate-400">|</span>
        <span>© {new Date().getFullYear()} All rights reserved.</span>
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <a href="#privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
        <a href="#terms" className="hover:text-slate-900 transition-colors">Terms of Service</a>
        <a href="#support" className="hover:text-slate-900 transition-colors">Support</a>
      </div>
    </footer>
  );
};
