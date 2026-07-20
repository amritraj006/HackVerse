import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input, Badge, Loader, Modal, EmptyState } from '../components/common/UI';
import { Users, Plus, Key, LogOut } from 'lucide-react';

const Teams = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeRegId, setActiveRegId] = useState(null);
  const [activeHackId, setActiveHackId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form fields
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setRegistrations(res.data.data.registrations || []);
    } catch (err) {
      showToast('Failed to load registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [showToast]);

  const handleOpenCreate = (hackId, regId) => {
    setActiveHackId(hackId);
    setActiveRegId(regId);
    setIsCreateOpen(true);
  };

  const handleOpenJoin = (hackId, regId) => {
    setActiveHackId(hackId);
    setActiveRegId(regId);
    setIsJoinOpen(true);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName || !activeHackId) return;

    setModalLoading(true);
    try {
      await api.post('/teams', { name: teamName, hackathon: activeHackId });
      showToast(`Team "${teamName}" created successfully!`, 'success');
      setIsCreateOpen(false);
      setTeamName('');
      fetchTeams();
    } catch (err) {
      showToast(err.message || 'Failed to create team', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!inviteCode) return;

    setModalLoading(true);
    try {
      await api.post('/teams/join', { inviteCode });
      showToast('Joined team successfully!', 'success');
      setIsJoinOpen(false);
      setInviteCode('');
      fetchTeams();
    } catch (err) {
      showToast(err.message || 'Failed to join team', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to leave or disband this team?')) {
      return;
    }

    try {
      await api.delete(`/teams/${teamId}/leave`);
      showToast('Left team successfully', 'info');
      fetchTeams();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Teams Console</h1>
        <p className="text-xs text-gray-500">Manage developer teams and invite codes across your registered events</p>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          title="No Registered Hackathons"
          description="You must register for a hackathon before you can form or join a team."
          icon={<Users size={32} />}
          actionButton={
            <Button onClick={() => navigate('/hackathons')} variant="primary" size="sm">
              Explore Active Lobby
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {registrations.map(({ registration: reg }) => (
            <div key={reg._id} className="bg-white rounded-lg border border-gray-200 shadow-subtle p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{reg.hackathon.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{reg.hackathon.theme} • {reg.hackathon.mode.toUpperCase()}</p>
                </div>
                <Badge variant={reg.hackathon.status === 'ongoing' ? 'emerald' : reg.hackathon.status === 'upcoming' ? 'blue' : 'gray'}>
                  {reg.hackathon.status}
                </Badge>
              </div>

              {!reg.team ? (
                <div className="py-4 text-center space-y-3">
                  <p className="text-xs text-gray-500">You don't have a team for this event yet.</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => handleOpenCreate(reg.hackathon._id, reg._id)} size="sm" className="flex items-center gap-1">
                      <Plus size={14} />
                      <span>Form Team</span>
                    </Button>
                    <Button onClick={() => handleOpenJoin(reg.hackathon._id, reg._id)} size="sm" variant="secondary" className="flex items-center gap-1">
                      <Key size={14} />
                      <span>Join Team</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {/* Left Column: Team Status */}
                  <div className="space-y-3 bg-gray-50/50 p-4 rounded border border-gray-150 text-xs">
                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-gray-400">Team Name:</span>
                      <span className="font-bold text-gray-800">{reg.team.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-gray-400">Team Invite Code:</span>
                      <code className="bg-gray-100 px-1 rounded text-primary-600 font-bold select-all text-xs">
                        {reg.team.inviteCode}
                      </code>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-gray-400">Leader:</span>
                      <span className="font-medium text-gray-700">
                        {reg.team.leader === user._id ? 'You (Leader)' : 'Team Member'}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleLeaveTeam(reg.team._id)}
                      variant="ghost"
                      size="sm"
                      className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center gap-1 mt-2"
                    >
                      <LogOut size={12} />
                      <span>Leave / Disband Team</span>
                    </Button>
                  </div>

                  {/* Middle Column: Member List */}
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Roster Members</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Render team members. In stats.registrations, we populated team but we should check if members list is populated. If not, showing simple count is fine. Wait, in stats.registrations, let's check how team was populated in getParticipantStats. In getParticipantStats: populate('team', 'name inviteCode members leader') - yes, members list is populated with IDs. Wait, to render names we would need them populated with objects, but since they are just IDs here, let's display members count or fetch full details. Let's make sure the details are populated in HackathonDetail lobby, while here we can list IDs or simple count. Let's check how team was populated: in getParticipantStats we did populate('team', 'name inviteCode members leader'). Since members is an array of IDs, we can render "Team Size: members.length". To keep it simple and clean, we can link back to the Hackathon lobby details where they see the full team roster with names and bios. Yes, this is very clean! */}
                      <div className="border border-gray-150 p-4 rounded-lg flex items-center justify-between text-xs w-full bg-white">
                        <div>
                          <p className="font-bold text-gray-800">Team Active Size</p>
                          <p className="text-gray-400 mt-0.5">{reg.team.members?.length} developer(s)</p>
                        </div>
                        <Link to={`/hackathons/${reg.hackathon._id}`} className="text-xs font-bold text-primary-600 hover:underline">
                          View Roster in Lobby →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Form a New Hackathon Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <Input
            label="Team Name"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Syntax Errors"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsCreateOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Create Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* JOIN TEAM MODAL */}
      <Modal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} title="Join Existing Team">
        <form onSubmit={handleJoinTeam} className="space-y-4">
          <Input
            label="Team Invite Code"
            id="inviteCode"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="AIINV1"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsJoinOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Join Team
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teams;
