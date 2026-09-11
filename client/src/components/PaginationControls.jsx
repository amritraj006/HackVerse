import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

/**
 * Reusable PaginationControls component
 */
export const PaginationControls = ({
  pagination = { page: 1, pages: 1, total: 0, limit: 10 },
  onPageChange,
  onLimitChange,
  limitOptions = [6, 10, 12, 24, 50],
  showLimitSelector = true,
  className = '',
}) => {
  const { page = 1, pages = 1, total = 0, limit = 10 } = pagination;

  if (total <= 0 && pages <= 1) return null;

  const selectStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-normal)',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    padding: '3px 6px',
    borderRadius: '6px',
    outline: 'none',
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-3 ${className}`}
      style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
    >
      <div className="flex items-center gap-3">
        <span>
          Page{' '}
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{page}</span>
          {' '}of{' '}
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pages}</span>
          {total > 0 && <span className="ml-1" style={{ color: 'var(--text-muted)' }}>({total} items)</span>}
        </span>

        {showLimitSelector && onLimitChange && (
          <div
            className="flex items-center gap-1.5 pl-3"
            style={{ borderLeft: '1px solid var(--border-subtle)' }}
          >
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              style={selectStyle}
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt} style={{ background: '#0d1220' }}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </Button>

        {pages <= 7 && Array.from({ length: pages }, (_, idx) => idx + 1).map((pNum) => (
          <button
            key={pNum}
            onClick={() => onPageChange(pNum)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-150"
            style={
              page === pNum
                ? {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 0 12px rgba(99,102,241,0.3)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-normal)',
                  }
            }
          >
            {pNum}
          </button>
        ))}

        <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="flex items-center gap-1">
          Next <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
