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

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-200 ${className}`}>
      <div className="flex items-center gap-3">
        <span>
          Showing page <span className="font-semibold text-slate-700">{page}</span> of{' '}
          <span className="font-semibold text-slate-700">{pages}</span>
          {total > 0 && <span className="ml-1 text-slate-400">({total} items total)</span>}
        </span>

        {showLimitSelector && onLimitChange && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-[11px] text-slate-400">Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="py-1 px-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:bg-white"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </Button>

        {/* Dynamic page numbers if pages <= 7 */}
        {pages <= 7 &&
          Array.from({ length: pages }, (_, idx) => idx + 1).map((pNum) => (
            <button
              key={pNum}
              onClick={() => onPageChange(pNum)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                page === pNum
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {pNum}
            </button>
          ))}

        <Button
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
