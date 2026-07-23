import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook to manage state synchronized with URL Query Parameters.
 * Helps keep shareable URLs and handles back/forward browser navigation seamlessly.
 *
 * @param {Object} defaultParams - Object containing default parameter key-value pairs
 * @returns {[Object, Function, Function]} [queryParams, setQueryParam, resetQueryParams]
 */
export const useQueryParams = (defaultParams = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current query params, falling back to defaultParams
  const getQueryParams = useCallback(() => {
    const params = { ...defaultParams };
    for (const [key, value] of searchParams.entries()) {
      if (value !== undefined && value !== '') {
        params[key] = value;
      }
    }
    return params;
  }, [searchParams, defaultParams]);

  // Set one or multiple query parameters
  const setQueryParams = useCallback(
    (newParams) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(newParams).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '' || value === defaultParams[key]) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, defaultParams]
  );

  // Reset parameters back to default
  const resetQueryParams = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return [getQueryParams(), setQueryParams, resetQueryParams];
};

export default useQueryParams;
