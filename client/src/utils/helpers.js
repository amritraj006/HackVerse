/**
 * Format Date to readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

/**
 * Format Date and Time to readable 12-hour AM/PM string (e.g. "Mar 25, 2026, 10:00 AM")
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 80) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Merge class names helper
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Resolve asset URL (handles Cloudinary, uploads, and local backend URLs)
 */
export const getAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8341/api/v1';
  const serverBase = apiBase.replace(/\/api\/v1\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${serverBase}${cleanPath}`;
};

