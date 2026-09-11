export const Footer = () => {
  return (
    <footer
      className="py-4 px-6 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 rounded-xl mt-2"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold gradient-text">HackVerse</span>
        <span style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} All rights reserved.
        </span>
      </div>
      <div className="flex items-center gap-5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <a href="#privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
        <a href="#terms" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
        <a href="#support" className="hover:text-indigo-400 transition-colors">Support</a>
      </div>
    </footer>
  );
};
