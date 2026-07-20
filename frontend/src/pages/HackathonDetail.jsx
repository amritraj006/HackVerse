import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input, Badge, Modal, Loader } from '../components/common/UI';
import {
  Calendar,
  Users,
  Trophy,
  ClipboardList,
  FileCode,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const HackathonDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [hackathon, setHackathon] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [team, setTeam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  // Modal forms states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Form inputs
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  
  // Submission form inputs
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [screenshotFiles, setScreenshotFiles] = useState([]);

  const fetchData = async () => {
    try {
      const resHack = await api.get(`/hackathons/${id}`);
      setHackathon(resHack.data.data.hackathon);

      if (user) {
        // Fetch registration status
        try {
          const resReg = await api.get(`/registrations/my/${id}`);
          setRegistration(resReg.data.data.registration);
        } catch (e) {
          setRegistration(null);
        }

        // Fetch team status
        try {
          const resTeam = await api.get(`/teams/my/${id}`);
          setTeam(resTeam.data.data.team);
        } catch (e) {
          setTeam(null);
        }
      }

      // Fetch leaderboard
      const resLeader = await api.get(`/reviews/leaderboard/${id}`);
      setLeaderboard(resLeader.data.data.leaderboard);

      // Fetch submissions (if organizer/judge/admin)
      if (user && ['organizer', 'judge', 'admin'].includes(user.role)) {
        const resSub = await api.get(`/submissions/hackathon/${id}`);
        setSubmissions(resSub.data.data.submissions);
      }
    } catch (err) {
      showToast('Failed to load hackathon details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const handleRegister = async () => {
    try {
      await api.post('/registrations', { hackathonId: id });
      showToast('Successfully registered for this hackathon!', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName) return;

    setModalLoading(true);
    try {
      await api.post('/teams', { name: teamName, hackathon: id });
      showToast(`Team "${teamName}" created successfully!`, 'success');
      setIsTeamModalOpen(false);
      setTeamName('');
      fetchData();
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
      setIsJoinModalOpen(false);
      setInviteCode('');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to join team', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!team) return;
    if (!window.confirm(team.leader._id === user._id ? 'Warning: As the leader, leaving will disband the team for all members. Continue?' : 'Are you sure you want to leave the team?')) {
      return;
    }

    try {
      await api.delete(`/teams/${team._id}/leave`);
      showToast('Left team successfully', 'info');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.id === 'pdf') {
      setPdfFile(e.target.files[0]);
    } else {
      setScreenshotFiles(Array.from(e.target.files));
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectName || !projectDescription || !repositoryUrl) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setModalLoading(true);
    try {
      const formData = new FormData();
      formData.append('hackathonId', id);
      formData.append('projectName', projectName);
      formData.append('projectDescription', projectDescription);
      formData.append('repositoryUrl', repositoryUrl);
      formData.append('demoUrl', demoUrl);
      if (pdfFile) {
        formData.append('presentationPdf', pdfFile);
      }
      if (screenshotFiles.length > 0) {
        screenshotFiles.forEach((file) => {
          formData.append('screenshots', file);
        });
      }

      await api.post('/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Project submission recorded successfully!', 'success');
      setIsSubmitModalOpen(false);
      // Reset form
      setProjectName('');
      setProjectDescription('');
      setRepositoryUrl('');
      setDemoUrl('');
      setPdfFile(null);
      setScreenshotFiles([]);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-10 h-10" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-500">Hackathon not found</p>
      </div>
    );
  }

  const deadlinePassed = new Date() > new Date(hackathon.registrationDeadline);
  const hackathonOngoing = new Date() >= new Date(hackathon.startDate) && new Date() <= new Date(hackathon.endDate);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-subtle">
        <div className="h-44 bg-gray-100 relative">
          {hackathon.bannerImage ? (
            <img src={hackathon.bannerImage} alt={hackathon.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-50 to-primary-50 flex items-center justify-center text-primary-200" />
          )}
          <div className="absolute top-4 right-4">
            <Badge variant={hackathon.status === 'ongoing' ? 'emerald' : hackathon.status === 'upcoming' ? 'blue' : 'gray'}>
              {hackathon.status}
            </Badge>
          </div>
        </div>

        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{hackathon.theme}</span>
            <h1 className="text-lg font-bold text-gray-800">{hackathon.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {hackathon.mode === 'online' ? 'Online' : hackathon.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Ends: {new Date(hackathon.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Registration Action */}
            {user?.role === 'participant' && (
              <>
                {!registration ? (
                  <Button onClick={handleRegister} disabled={deadlinePassed}>
                    {deadlinePassed ? 'Registration Closed' : 'Register for Event'}
                  </Button>
                ) : (
                  <Badge variant="emerald" className="py-2 px-3 text-xs">
                    ✓ Registered
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Detail Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 flex gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-1 border-b-2 ${activeTab === 'details' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400'}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`pb-2 px-1 border-b-2 ${activeTab === 'leaderboard' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400'}`}
            >
              Leaderboard
            </button>
            {user && ['organizer', 'judge', 'admin'].includes(user.role) && (
              <button
                onClick={() => setActiveTab('submissions')}
                className={`pb-2 px-1 border-b-2 ${activeTab === 'submissions' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400'}`}
              >
                Submissions ({submissions.length})
              </button>
            )}
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wider">About Hackathon</h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{hackathon.description}</p>
              </div>

              {hackathon.requirements && (
                <div>
                  <h3 className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wider">Requirements</h3>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{hackathon.requirements}</p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wider">Event Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="border border-gray-100 p-3 rounded">
                    <span className="text-gray-400 block font-medium">Registration Deadline</span>
                    <span className="font-bold text-gray-700 mt-1 block">
                      {new Date(hackathon.registrationDeadline).toLocaleString()}
                    </span>
                  </div>
                  <div className="border border-gray-100 p-3 rounded">
                    <span className="text-gray-400 block font-medium">Hackathon Period</span>
                    <span className="font-bold text-gray-700 mt-1 block">
                      {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle">
              <h3 className="text-xs font-bold text-gray-800 mb-4 uppercase tracking-wider">Competition Standings</h3>
              {leaderboard.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">Leaderboard is empty. Submissions have not been evaluated yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Rank</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Team Name</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Project</th>
                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase">Tech Score</th>
                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase">Total Average</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaderboard.map((item, idx) => (
                        <tr key={item._id} className={idx === 0 ? 'bg-yellow-50/30' : idx === 1 ? 'bg-slate-50/50' : ''}>
                          <td className="px-4 py-3 font-bold text-xs text-gray-600">
                            {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{item.team?.name}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{item.projectName}</td>
                          <td className="px-4 py-3 text-center text-xs text-gray-400">
                            {item.avgTechnical ? item.avgTechnical.toFixed(1) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-primary-600">
                            {item.averageScore ? item.averageScore.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Submissions Tab (Admin/Organizer/Judge Only) */}
          {activeTab === 'submissions' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Submissions Queue</h3>
              {submissions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No projects submitted yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {submissions.map((sub) => (
                    <div key={sub._id} className="border border-gray-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/10">
                      <div>
                        <h4 className="font-bold text-sm text-gray-800">{sub.projectName}</h4>
                        <p className="text-xs text-gray-400 mt-1">Submitted by: {sub.team?.name} (Leader: {sub.submittedBy?.name})</p>
                      </div>
                      <div className="flex gap-2">
                        {user.role === 'judge' && (
                          <Button
                            onClick={() => navigate(`/judge/reviews?subId=${sub._id}`)}
                            size="sm"
                          >
                            Grade Project
                          </Button>
                        )}
                        <Link to={`/submissions/${sub._id}`} className="text-xs font-bold text-primary-600 border border-gray-200 py-1.5 px-3 rounded hover:bg-gray-50 flex items-center gap-1">
                          <span>Details</span>
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Organizer Info / Team Status Panel */}
        <div className="space-y-6">
          {/* Organizer details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Host Details</h3>
            <div className="flex items-center gap-3">
              {hackathon.organizer.profileImage ? (
                <img src={hackathon.organizer.profileImage} alt={hackathon.organizer.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                  {hackathon.organizer.name.charAt(0)}
                </div>
              )}
              <div>
                <span className="font-bold text-xs text-gray-800 block">{hackathon.organizer.name}</span>
                <span className="text-[10px] text-gray-400 block">{hackathon.organizer.email}</span>
              </div>
            </div>
            {hackathon.organizer.bio && (
              <p className="text-[11px] text-gray-500 italic leading-relaxed">"{hackathon.organizer.bio}"</p>
            )}
          </div>

          {/* Judges details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Evaluation Judges ({hackathon.judges?.length || 0})</h3>
            <div className="space-y-3">
              {hackathon.judges?.map((j) => (
                <div key={j._id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] uppercase">
                    {j.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-800">{j.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Console for registered participants */}
          {user?.role === 'participant' && registration && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-subtle space-y-4">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Team Center</h3>
              
              {!team ? (
                <div className="space-y-3 text-center">
                  <p className="text-xs text-gray-500">You are registered but do not have a team yet.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => setIsTeamModalOpen(true)} size="sm" variant="primary">
                      Form Team
                    </Button>
                    <Button onClick={() => setIsJoinModalOpen(true)} size="sm" variant="secondary">
                      Join Team
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Active Team</span>
                    <span className="text-sm font-bold text-gray-800 block">{team.name}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 p-3 rounded space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400">Invite Code:</span>
                      <code className="bg-gray-100 px-1 rounded text-primary-600 font-bold select-all text-xs">
                        {team.inviteCode}
                      </code>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400">Team Size:</span>
                      <span className="font-semibold text-gray-700">
                        {team.members?.length} / {hackathon.maxTeamSize}
                      </span>
                    </div>
                  </div>

                  {/* Submission triggers */}
                  {hackathonOngoing && (
                    <Button onClick={() => setIsSubmitModalOpen(true)} className="w-full flex items-center justify-center gap-1">
                      <FileCode size={14} />
                      <span>Submit Project</span>
                    </Button>
                  )}

                  <Button onClick={handleLeaveTeam} variant="ghost" className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                    Leave / Disband Team
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE TEAM MODAL */}
      <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title="Form a New Hackathon Team">
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
            <Button onClick={() => setIsTeamModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Create Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* JOIN TEAM MODAL */}
      <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title="Join Existing Team">
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
            <Button onClick={() => setIsJoinModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Join Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* SUBMIT PROJECT MODAL */}
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Submit Project Deliverables" size="lg">
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <Input
            label="Project Name"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="BlockPay decentralized invoicing"
            required
          />

          <div>
            <label htmlFor="projectDescription" className="block text-xs font-semibold text-gray-600 mb-1">
              Project Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="projectDescription"
              rows="4"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="block w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 shadow-subtle placeholder-gray-400"
              placeholder="What problem does it solve? What is the technical implementation?"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Repository URL (e.g. GitHub)"
              id="repositoryUrl"
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/username/project"
              required
            />
            <Input
              label="Live Demo Link (Optional)"
              id="demoUrl"
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://project.vercel.app"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <label htmlFor="pdf" className="block text-xs font-semibold text-gray-600 mb-1">
                Presentation Slides (PDF only)
              </label>
              <input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer w-full"
              />
            </div>
            <div>
              <label htmlFor="screenshots" className="block text-xs font-semibold text-gray-600 mb-1">
                Screenshots (up to 4 images)
              </label>
              <input
                id="screenshots"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button onClick={() => setIsSubmitModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Submit Deliverables
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HackathonDetail;
