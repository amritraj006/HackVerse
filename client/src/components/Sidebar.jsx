import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../utils/constants';

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar navigation drawer */}
      <aside
        className={`fixed md:sticky top-0 md:top-[49px] left-0 z-40 h-[calc(100vh)] md:h-[calc(100vh-49px)] w-56 bg-white border-r border-slate-200/80 flex flex-col justify-between p-3 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Section: Main Menu */}
          <div>
            <p className="px-2 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Main Menu
            </p>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Section: System & Support */}
          <div>
            <p className="px-2 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              System
            </p>
            <nav className="space-y-0.5">
              {SECONDARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="pt-3 border-t border-slate-100 px-2">
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/60 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-800 truncate">Platform Active</p>
              <p className="text-[10px] text-slate-500 truncate">v1.0.0 MVC Standard</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
