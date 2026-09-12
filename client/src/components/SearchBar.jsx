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

  // Sync internal search term when external prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Trigger parent onChange when debounced search term updates
  useEffect(() => {
    if (onChange && debouncedSearchTerm !== value) {
      onChange(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onChange, value]);

  const handleClear = () => {
    setSearchTerm('');
    if (onChange) onChange('');
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        id={id}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
      />
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" />
      ) : searchTerm ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer transition-colors"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
};

export default SearchBar;
