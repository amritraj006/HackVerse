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
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  // Internal client-side fallback filtering if onSearchChange is not passed
  const filteredData = onSearchChange
    ? data
    : data.filter((item) => {
        if (!localSearch) return true;
        return Object.values(item).some(
          (val) =>
            val &&
            val.toString().toLowerCase().includes(localSearch.toLowerCase())
        );
      });

  return (
    <div className="space-y-3">
      {/* Search & Filter Header Bar */}
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
                    <span className="text-[11px] font-semibold text-slate-500">
                      {f.label}:
                    </span>
                  )}
                  <select
                    value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                    className="py-1 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500"
                  >
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
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

      {/* Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-2.5">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-500">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-slate-400 text-xs"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIdx) => (
                  <tr
                    key={row._id || row.id || rowIdx}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-2.5">
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

        {/* Pagination Footer */}
        {pagination && (
          <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100">
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
