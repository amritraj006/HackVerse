import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

/**
 * Reusable SearchBar component with debounced callback
 */
export const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceDelay = 350,
  loading = false,
  className = '',
  id = 'search-input',
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  useEffect(() => { setSearchTerm(value); }, [value]);

  useEffect(() => {
    if (onChange && debouncedSearchTerm !== value) onChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onChange, value]);

  const handleClear = () => { setSearchTerm(''); if (onChange) onChange(''); };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--text-muted)' }}
      />
      <input
        id={id}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-8 py-2 text-xs rounded-lg outline-none transition-all duration-150"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-normal)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid var(--border-normal)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }}
      />
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin" style={{ color: '#818cf8' }} />
      ) : searchTerm ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
};

export default SearchBar;
