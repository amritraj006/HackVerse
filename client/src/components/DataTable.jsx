import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { SortDropdown } from './SortDropdown';
import { PaginationControls } from './PaginationControls';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  sortOptions = [],
  sortBy = '',
  order = 'desc',
  onSortChange,
  pagination = null,
  emptyMessage = 'No records found.',
}) => {
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchTerm = (val) => {
    setLocalSearch(val);
    if (onSearchChange) onSearchChange(val);
  };

  const filteredData = onSearchChange
    ? data
    : data.filter((item) => {
        if (!localSearch) return true;
        return Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(localSearch.toLowerCase())
        );
      });

  const selectStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-normal)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    padding: '6px 10px',
    borderRadius: '8px',
    outline: 'none',
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <SearchBar
          value={onSearchChange ? searchValue : localSearch}
          onChange={handleSearchTerm}
          placeholder={searchPlaceholder}
          loading={loading}
          className="flex-1 max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          {filters && filters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((f) => (
                <div key={f.id} className="flex items-center gap-1.5">
                  {f.label && (
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {f.label}:
                    </span>
                  )}
                  <select value={f.value} onChange={(e) => f.onChange(e.target.value)} style={selectStyle}>
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value} style={{ background: '#0d1220' }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {sortOptions && sortOptions.length > 0 && onSortChange && (
            <SortDropdown
              options={sortOptions}
              sortBy={sortBy}
              order={order}
              onSortChange={onSortChange}
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(13,18,32,0.95))',
          border: '1px solid var(--border-normal)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{
                  borderBottom: '1px solid var(--border-normal)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'var(--text-muted)',
                }}
              >
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-secondary)' }}>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center">
                    <div className="inline-flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-t-transparent"
                        style={{ borderColor: '#6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}
                      />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIdx) => (
                  <tr
                    key={row._id || row.id || rowIdx}
                    className="transition-colors duration-100"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-3">
                        {col.cell
                          ? col.cell(row)
                          : typeof col.accessor === 'function'
                          ? col.accessor(row)
                          : row[col.accessor] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div
            className="px-4 py-3"
            style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}
          >
            <PaginationControls
              pagination={pagination}
              onPageChange={pagination.onPageChange}
              onLimitChange={pagination.onLimitChange}
              showLimitSelector={Boolean(pagination.onLimitChange)}
              className="border-t-0 pt-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
