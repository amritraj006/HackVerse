import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 font-sans relative selection:bg-indigo-500 selection:text-white">
      {/* Subtle ambient lighting */}
      <div className="pointer-events-none fixed top-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed bottom-1/4 left-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />

      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex-1 flex w-full relative z-10">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-3 sm:p-4 md:p-7 min-w-0 flex flex-col justify-between">
          <div className="w-full flex-1 min-w-0 animate-fade-in">
            <Outlet />
          </div>
          <div className="mt-8">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};
