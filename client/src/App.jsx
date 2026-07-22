import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Hackathons } from './pages/Hackathons';
import { HackathonDetail } from './pages/HackathonDetail';
import { ManageHackathon } from './pages/organizer/ManageHackathon';
import { Projects } from './pages/Projects';
import { Teams } from './pages/Teams';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';
import { AdminConsole } from './pages/admin/AdminConsole';
import { RegistrationHistory } from './pages/RegistrationHistory';

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
                <Route path="registrations" element={<RegistrationHistory />} />
                <Route path="profile" element={<Profile />} />
                <Route path="teams" element={<Teams />} />
              </Route>

              {/* Organizer / Admin Only Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['organizer', 'admin']} />}>
                <Route path="hackathons/:id/manage" element={<ManageHackathon />} />
                <Route path="hackathons/new" element={<Dashboard />} />
              </Route>

              {/* Admin Only Exclusive Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin" element={<AdminConsole />} />
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
