import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Hackathons } from './pages/Hackathons';
import { HackathonDetail } from './pages/HackathonDetail';
import { Projects } from './pages/Projects';
import { Teams } from './pages/Teams';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main Application Routes inside MainLayout */}
            <Route path="/" element={<MainLayout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="hackathons" element={<Hackathons />} />
              <Route path="hackathons/:id" element={<HackathonDetail />} />
              <Route path="projects" element={<Projects />} />
              <Route path="unauthorized" element={<Unauthorized />} />

              {/* Protected Routes (Requires Login) */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="teams" element={<Teams />} />
              </Route>

              {/* Organizer / Admin Only Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['organizer', 'admin']} />}>
                <Route
                  path="hackathons/new"
                  element={
                    <div className="p-4 bg-white rounded-lg border border-slate-200 text-xs">
                      <h2 className="font-bold text-sm text-slate-900 mb-1">Host New Hackathon</h2>
                      <p className="text-slate-500">Organizer & Admin exclusive route protected by Role-Based Authorization.</p>
                    </div>
                  }
                />
              </Route>

              {/* Fallback 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Authentication Routes inside AuthLayout */}
            <Route element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
