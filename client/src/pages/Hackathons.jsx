import { useState, useEffect, useCallback } from 'react';
import { Filter, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { HackathonCard } from '../components/HackathonCard';
import { SearchBar } from '../components/SearchBar';
import { SortDropdown } from '../components/SortDropdown';
import { PaginationControls } from '../components/PaginationControls';
import { hackathonService } from '../services/hackathonService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../hooks/useAuth';
import { useQueryParams } from '../hooks/useQueryParams';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'ended', label: 'Ended' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Recently Added' },
  { value: 'startDate', label: 'Start Date' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'registrationDeadline', label: 'Deadline' },
];

const DEFAULT_PARAMS = {
  search: '',
  status: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: '1',
  limit: '12',
};

export const Hackathons = () => {
  const { user } = useAuth();
  const [queryParams, setQueryParams, resetQueryParams] = useQueryParams(DEFAULT_PARAMS);

  const search = queryParams.search || '';
  const statusFilter = queryParams.status || '';
  const sortBy = queryParams.sortBy || 'createdAt';
  const order = queryParams.order || 'desc';
  const page = parseInt(queryParams.page || '1', 10);
  const limit = parseInt(queryParams.limit || '12', 10);

  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page, pages: 1, total: 0, limit });
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  // Track registration state per hackathon id
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [registeringId, setRegisteringId] = useState(null);

  // Load hackathons
  const fetchHackathons = useCallback(() => {
    setLoading(true);
    hackathonService
      .getAll({
        search,
        status: statusFilter,
        sortBy,
        order,
        page,
        limit,
      })
      .then((res) => {
        if (res?.data) {
          setHackathons(res.data.hackathons || res.data);
          if (res.data.pagination) setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        setAlert({ type: 'error', message: err.message || 'Failed to load hackathons.' });
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, sortBy, order, page, limit]);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  // Load user's active registrations to display "Registered" badge
  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    registrationService
      .getMyRegistrations({ status: 'active', limit: 100 })
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

    return () => {
      isMounted = false;
    };
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

  const handleSearchChange = (val) => {
    setQueryParams({ search: val, page: 1 });
  };

  const handleStatusChange = (val) => {
    setQueryParams({ status: val, page: 1 });
  };

  const handleSortChange = ({ sortBy: newSort, order: newOrder }) => {
    setQueryParams({ sortBy: newSort, order: newOrder, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setQueryParams({ page: newPage });
  };

  const handleLimitChange = (newLimit) => {
    setQueryParams({ limit: newLimit, page: 1 });
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
        <Button size="sm" variant="outline" onClick={resetQueryParams}>
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </Button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Debounced Search */}
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search hackathons by title, description, tags..."
          loading={loading}
          className="flex-1 max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filters */}
          <div className="flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
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

          {/* Sort Dropdown */}
          <SortDropdown
            options={SORT_OPTIONS}
            sortBy={sortBy}
            order={order}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* Hackathons Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px] text-xs text-slate-500 gap-2">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading hackathons...</span>
        </div>
      ) : hackathons.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center gap-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 py-10">
          <p className="text-xs text-slate-500">No hackathons found matching your criteria.</p>
          {(search || statusFilter) && (
            <Button size="sm" variant="outline" onClick={resetQueryParams}>
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
      {!loading && (
        <PaginationControls
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          limitOptions={[6, 12, 24, 48]}
        />
      )}
    </div>
  );
};
