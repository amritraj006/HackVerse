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
    if (onSortChange) onSortChange({ sortBy: e.target.value, order });
  };

  const toggleOrder = () => {
    if (onSortChange) onSortChange({ sortBy, order: order === 'asc' ? 'desc' : 'asc' });
  };

  const selectStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-normal)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    padding: '6px 10px',
    borderRadius: '8px',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
      <select value={sortBy} onChange={handleFieldChange} style={selectStyle}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#0d1220' }}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={toggleOrder}
        className="p-1.5 rounded-lg cursor-pointer transition-all duration-150"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-normal)', color: '#818cf8' }}
        title={order === 'asc' ? 'Ascending' : 'Descending'}
      >
        {order === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default SortDropdown;
