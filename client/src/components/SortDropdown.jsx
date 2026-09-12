import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Reusable SortDropdown component
 */
export const SortDropdown = ({
  options = [],
  sortBy = '',
  order = 'desc',
  onSortChange,
  className = '',
}) => {
  const handleFieldChange = (e) => {
    const newField = e.target.value;
    if (onSortChange) {
      onSortChange({ sortBy: newField, order });
    }
  };

  const toggleOrder = () => {
    const newOrder = order === 'asc' ? 'desc' : 'asc';
    if (onSortChange) {
      onSortChange({ sortBy, order: newOrder });
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-1 text-slate-400">
        <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
      </div>
      <select
        value={sortBy}
        onChange={handleFieldChange}
        className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={toggleOrder}
        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition-colors"
        title={order === 'asc' ? 'Ascending (click for Descending)' : 'Descending (click for Ascending)'}
      >
        {order === 'asc' ? (
          <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
        )}
      </button>
    </div>
  );
};

export default SortDropdown;
