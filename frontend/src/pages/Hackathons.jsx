import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Input, Select, Badge, Modal, EmptyState } from '../components/common/UI';
import { Calendar, Filter, Search, Plus, MapPin } from 'lucide-react';

const Hackathons = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Hackathons data state
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter form states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [theme, setTheme] = useState(searchParams.get('theme') || '');
  const [mode, setMode] = useState(searchParams.get('mode') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  // Create Hackathon Modal state
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('create') === 'true');
  const [judgesList, setJudgesList] = useState([]);
  
  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [themeInput, setThemeInput] = useState('');
  const [modeInput, setModeInput] = useState('online');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch hackathons
  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (theme) params.theme = theme;
      if (mode) params.mode = mode;
      if (status) params.status = status;

      const res = await api.get('/hackathons', { params });
      setHackathons(res.data.data.hackathons);
    } catch (err) {
      showToast(err.message || 'Failed to retrieve hackathons list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [searchParams]);

  // Fetch judges list when modal opens
  useEffect(() => {
    if (isModalOpen && (user?.role === 'organizer' || user?.role === 'admin')) {
      const fetchJudges = async () => {
        try {
          const res = await api.get('/users/judges');
          setJudgesList(res.data.data.judges);
        } catch (err) {
          showToast('Failed to load judge directory', 'error');
        }
      };
      fetchJudges();
    }
  }, [isModalOpen, user]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (theme) params.theme = theme;
    if (mode) params.mode = mode;
    if (status) params.status = status;
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearch('');
    setTheme('');
    setMode('');
    setStatus('');
    setSearchParams({});
  };

  const handleCreateHackathon = async (e) => {
    e.preventDefault();

    if (!title || !description || !themeInput || !startDate || !endDate || !registrationDeadline) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Date validations
    const regDate = new Date(registrationDeadline);
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);

    if (regDate >= sDate) {
      showToast('Registration deadline must be before hackathon start date', 'error');
      return;
    }

    if (sDate >= eDate) {
      showToast('Start date must be before end date', 'error');
      return;
    }

    setFormLoading(true);
    try {
      await api.post('/hackathons', {
        title,
        description,
        requirements,
        theme: themeInput,
        mode: modeInput,
        location: modeInput === 'in-person' ? location : '',
        startDate: sDate.toISOString(),
        endDate: eDate.toISOString(),
        registrationDeadline: regDate.toISOString(),
        minTeamSize: parseInt(minTeamSize),
        maxTeamSize: parseInt(maxTeamSize),
        judges: selectedJudges,
      });

      showToast('Hackathon event created successfully!', 'success');
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setDescription('');
      setRequirements('');
      setThemeInput('');
      setStartDate('');
      setEndDate('');
      setRegistrationDeadline('');
      setSelectedJudges([]);
      // Refresh list
      fetchHackathons();
    } catch (err) {
      showToast(err.message || 'Failed to create hackathon', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleJudgeToggle = (judgeId) => {
    setSelectedJudges((prev) =>
      prev.includes(judgeId)
        ? prev.filter((id) => id !== judgeId)
        : [...prev, judgeId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Explore Hackathons</h1>
          <p className="text-xs text-gray-500">Register, compete, build innovative prototypes, and win leaderboard rankings</p>
        </div>
        {(user?.role === 'organizer' || user?.role === 'admin') && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1">
            <Plus size={16} />
            <span>Create Hackathon</span>
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-lg border border-gray-200 shadow-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <Input
          label="Search by text"
          id="search"
          placeholder="E.g. AI, Edu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          label="Filter by theme"
          id="theme"
          placeholder="E.g. Finance"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
        <Select
          label="Mode"
          id="mode"
          options={[
            { value: 'online', label: 'Online' },
            { value: 'in-person', label: 'In Person' },
          ]}
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        />
        <Select
          label="Status"
          id="status"
          options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'ongoing', label: 'Ongoing' },
            { value: 'completed', label: 'Completed' },
          ]}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <div className="flex gap-2">
          <Button type="submit" variant="primary" className="flex-1">
            Apply
          </Button>
          <Button type="button" variant="secondary" onClick={handleResetFilters}>
            Reset
          </Button>
        </div>
      </form>

      {/* Results Lobby */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="animate-pulse bg-white border border-gray-200 rounded-lg p-6 h-52 space-y-4" />
          <div className="animate-pulse bg-white border border-gray-200 rounded-lg p-6 h-52 space-y-4" />
        </div>
      ) : hackathons.length === 0 ? (
        <EmptyState
          title="No Hackathons Found"
          description="We couldn't find any hackathons matching your search queries. Try adjusting your filter parameters."
          actionButton={
            <Button onClick={handleResetFilters} variant="secondary" size="sm">
              Clear Search filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map((h) => (
            <div key={h._id} className="bg-white border border-gray-200 hover:border-primary-300 rounded-lg overflow-hidden flex flex-col justify-between shadow-subtle transition-all duration-300">
              <div>
                {/* Banner Image */}
                <div className="h-32 bg-gray-100 relative overflow-hidden">
                  {h.bannerImage ? (
                    <img src={h.bannerImage} alt={h.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-50 to-primary-50 flex items-center justify-center text-primary-200">
                      <Calendar size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={h.status === 'ongoing' ? 'emerald' : h.status === 'upcoming' ? 'blue' : 'gray'}>
                      {h.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{h.theme}</span>
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{h.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{h.description}</p>
                  
                  <div className="flex items-center gap-4 text-[11px] text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{h.mode === 'online' ? 'Online' : h.location || 'In-Person'}</span>
                    </div>
                    <div>
                      <span>Team: {h.minTeamSize}-{h.maxTeamSize} members</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-5 py-4 border-t border-gray-150 bg-gray-50/50 flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  Starts: {new Date(h.startDate).toLocaleDateString()}
                </span>
                <Button onClick={() => navigate(`/hackathons/${h._id}`)} size="sm">
                  View Lobby
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE HACKATHON DIALOG */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Hackathon Event" size="lg">
        <form onSubmit={handleCreateHackathon} className="space-y-4">
          <Input
            label="Hackathon Title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Stanford AI Sprint 2026"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Theme / Category"
              id="themeInput"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              placeholder="E.g. Web3, AI, Biotech"
              required
            />
            <Select
              label="Mode"
              id="modeInput"
              options={[
                { value: 'online', label: 'Online Hackathon' },
                { value: 'in-person', label: 'In-Person Event' },
              ]}
              value={modeInput}
              onChange={(e) => setModeInput(e.target.value)}
              placeholder={null}
            />
          </div>

          {modeInput === 'in-person' && (
            <Input
              label="Location Address"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Innovation Center, Hall A, Stanford CA"
              required
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Registration Deadline"
              id="registrationDeadline"
              type="datetime-local"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              required
            />
            <Input
              label="Hackathon Start Date"
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Hackathon End Date"
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Team Size"
              id="minTeamSize"
              type="number"
              min="1"
              value={minTeamSize}
              onChange={(e) => setMinTeamSize(e.target.value)}
              required
            />
            <Input
              label="Maximum Team Size"
              id="maxTeamSize"
              type="number"
              min="1"
              value={maxTeamSize}
              onChange={(e) => setMaxTeamSize(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-gray-600 mb-1">
              Event Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 shadow-subtle placeholder-gray-400"
              placeholder="What is this event about? What are the core topics?"
              required
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-xs font-semibold text-gray-600 mb-1">
              Submission Requirements (Optional)
            </label>
            <textarea
              id="requirements"
              rows="2"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="block w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 shadow-subtle placeholder-gray-400"
              placeholder="E.g. Must include functional github repository, and record a 2 minute demo video."
            />
          </div>

          {/* Judges checklist selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Assign Panel Judges
            </label>
            {judgesList.length === 0 ? (
              <p className="text-[10px] text-gray-400">No judges available to select. Register a user as Judge first.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-gray-150 rounded p-3 max-h-36 overflow-y-auto bg-gray-50/20">
                {judgesList.map((j) => (
                  <label key={j._id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedJudges.includes(j._id)}
                      onChange={() => handleJudgeToggle(j._id)}
                      className="rounded border-gray-200 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                    />
                    <span className="truncate">{j.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-gray-100">
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              Create Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Hackathons;
