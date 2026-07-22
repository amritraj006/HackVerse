import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { HackathonCard } from '../components/HackathonCard';
import { hackathonService } from '../services/hackathonService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../hooks/useAuth';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'ended', label: 'Ended' },
];

export const Hackathons = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  // Track registration state per hackathon id
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [registeringId, setRegisteringId] = useState(null);

  // Load hackathons
  useEffect(() => {
    let isMounted = true;
    hackathonService.getAll({
      search,
      status: statusFilter,
      page: pagination.page,
      limit: 12,
    })
      .then((res) => {
        if (isMounted && res?.data) {
          setHackathons(res.data.hackathons || res.data);
          if (res.data.pagination) setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to load hackathons.' });
      })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [search, statusFilter, pagination.page]);

  // Load user's active registrations to display "Registered" badge
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    registrationService.getMyRegistrations({ status: 'active', limit: 100 })
      .then((res) => {
        if (isMounted && res?.data?.registrations) {
          const ids = new Set(
            res.data.registrations
              .filter((r) => r.status === 'active')
              .map((r) => r.hackathon?._id || r.hackathon)
          );
          setRegisteredIds(ids);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [user]);

  const handleRegister = async (hackathonId) => {
    if (!user) {
      setAlert({ type: 'error', message: 'Please log in to register for a hackathon.' });
      return;
    }
    setRegisteringId(hackathonId);
    try {
      await registrationService.register(hackathonId);
      setRegisteredIds((prev) => new Set([...prev, hackathonId]));
      setAlert({ type: 'success', message: 'Successfully registered for the hackathon! 🎉' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to register.' });
    } finally {
      setRegisteringId(null);
    }
  };

  const handleCancel = async (hackathonId) => {
    setRegisteringId(hackathonId);
    try {
      await registrationService.cancel(hackathonId);
      setRegisteredIds((prev) => {
        const next = new Set(prev);
        next.delete(hackathonId);
        return next;
      });
      setAlert({ type: 'success', message: 'Registration cancelled successfully.' });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to cancel registration.' });
    } finally {
      setRegisteringId(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">Explore Hackathons</h1>
          <p className="text-xs text-slate-500">
            Discover active, upcoming, and past hackathons worldwide.
            {pagination.total > 0 && (
              <span className="ml-1 font-semibold text-slate-700">{pagination.total} total events.</span>
            )}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => {
          setSearch('');
          setStatusFilter('');
          setPagination({ page: 1, pages: 1, total: 0 });
        }}>
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="hackathon-search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search hackathons by title..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                statusFilter === opt.value
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hackathons Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px] text-xs text-slate-500 gap-2">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading hackathons...</span>
        </div>
      ) : hackathons.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center gap-2">
          <p className="text-xs text-slate-500">No hackathons found.</p>
          {(search || statusFilter) && (
            <Button size="sm" variant="outline" onClick={() => { setSearch(''); setStatusFilter(''); }}>
              <Filter className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hackathons.map((item) => (
            <HackathonCard
              key={item._id}
              hackathon={item}
              isRegistered={registeredIds.has(item._id)}
              onRegister={handleRegister}
              onCancel={handleCancel}
              registering={registeringId === item._id}
              showActions
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
          <span>
            Page <span className="font-semibold text-slate-700">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-700">{pagination.pages}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              ← Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
