import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { ConfirmModal } from '../components/ConfirmModal';
import { registrationService } from '../services/registrationService';
import { formatDate } from '../utils/helpers';
import {
  Trophy,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const RegistrationHistory = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [alert, setAlert] = useState({ type: 'info', message: '' });

  const [cancelModal, setCancelModal] = useState({ open: false, hackathonId: null, title: '' });
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchRegistrations = useCallback(() => {
    let isMounted = true;
    const startFetch = () => {
      setLoading(true);
      registrationService.getMyRegistrations({ status: statusFilter, page: pagination.page, limit: 10 })
        .then((res) => {
          if (isMounted && res?.data) {
            setRegistrations(res.data.registrations || []);
            if (res.data.pagination) setPagination(res.data.pagination);
          }
        })
        .catch((err) => {
          if (isMounted) setAlert({ type: 'error', message: err.message || 'Failed to load registrations.' });
        })
        .finally(() => { if (isMounted) setLoading(false); });
    };
    startFetch();
    return () => { isMounted = false; };
  }, [statusFilter, pagination.page]);

  useEffect(() => fetchRegistrations(), [fetchRegistrations]);

  const handleFilterChange = (val) => {
    setStatusFilter(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCancelOpen = (hackathon) => {
    setCancelModal({ open: true, hackathonId: hackathon._id, title: hackathon.title });
  };

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    try {
      await registrationService.cancel(cancelModal.hackathonId);
      setAlert({ type: 'success', message: 'Registration cancelled successfully.' });
      setCancelModal({ open: false, hackathonId: null, title: '' });
      // Refresh list
      setRegistrations((prev) =>
        prev.map((r) =>
          (r.hackathon?._id || r.hackathon) === cancelModal.hackathonId
            ? { ...r, status: 'cancelled' }
            : r
        )
      );
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to cancel.' });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-base font-bold text-slate-900">Registration History</h1>
          <p className="text-xs text-slate-500">
            All your hackathon registrations — active and cancelled.
            {pagination.total > 0 && (
              <span className="ml-1 font-semibold text-slate-700">{pagination.total} total.</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setStatusFilter(''); setPagination({ page: 1, pages: 1, total: 0 }); }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Link to="/hackathons">
            <Button size="sm" variant="primary">
              Browse Events <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: 'info', message: '' })} />

      {/* Filters */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
              statusFilter === f.value
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Registration Cards */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-xs text-slate-500 gap-2">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            Loading registrations...
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-slate-500">
              {statusFilter ? `No ${statusFilter} registrations found.` : 'You have no registration history yet.'}
            </p>
            <Link to="/hackathons">
              <Button size="sm" variant="primary">
                <Trophy className="w-3.5 h-3.5" /> Explore Hackathons
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {registrations.map((reg) => {
              const h = reg.hackathon;
              if (!h) return null;
              const isActive = reg.status === 'active';

              return (
                <div key={reg._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-emerald-50' : 'bg-slate-100'
                    }`}>
                      {isActive
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        : <XCircle className="w-4 h-4 text-slate-400" />
                      }
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-bold text-slate-900">{h.title}</h3>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${
                            h.status === 'ongoing'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : h.status === 'upcoming'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {h.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isActive ? 'Active' : 'Cancelled'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-slate-400" /> {h.prizePool || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(h.startDate)} → {formatDate(h.endDate)}
                        </span>
                        <span className="text-slate-400">
                          Registered: {formatDate(reg.registeredAt || reg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link to={`/hackathons/${h._id}`}>
                      <Button size="sm" variant="outline">View Details</Button>
                    </Link>
                    {isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => handleCancelOpen(h)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Pagination */}
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

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={cancelModal.open}
        title="Cancel Registration"
        message={`Are you sure you want to cancel your registration for "${cancelModal.title}"? You can re-register if registrations are still open.`}
        confirmText="Yes, Cancel"
        confirmVariant="danger"
        loading={isCancelling}
        onClose={() => setCancelModal({ open: false, hackathonId: null, title: '' })}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};
