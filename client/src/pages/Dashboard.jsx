import { useAuth } from '../hooks/useAuth';
import { ParticipantDashboard } from './dashboards/ParticipantDashboard';
import { OrganizerDashboard } from './dashboards/OrganizerDashboard';
import { JudgeDashboard } from './dashboards/JudgeDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

export const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'participant';

  switch (role) {
    case 'admin':
      return <AdminDashboard user={user} />;
    case 'organizer':
      return <OrganizerDashboard user={user} />;
    case 'judge':
      return <JudgeDashboard user={user} />;
    case 'participant':
    default:
      return <ParticipantDashboard user={user} />;
  }
};
