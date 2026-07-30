import toast from 'react-hot-toast';

const toastStyle = {
  style: {
    borderRadius: '12px',
    background: '#0f172a',
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: '500',
    padding: '12px 16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  duration: 4000,
};

export const notify = {
  success: (message) => {
    if (!message) return;
    toast.success(message, {
      ...toastStyle,
      iconTheme: {
        primary: '#10b981',
        secondary: '#ffffff',
      },
    });
  },

  error: (message) => {
    if (!message) return;
    toast.error(message, {
      ...toastStyle,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
    });
  },

  warning: (message) => {
    if (!message) return;
    toast(message, {
      ...toastStyle,
      icon: '⚠️',
    });
  },

  info: (message) => {
    if (!message) return;
    toast(message, {
      ...toastStyle,
      icon: 'ℹ️',
    });
  },

  promise: (promise, { loading, success, error }) => {
    return toast.promise(
      promise,
      {
        loading,
        success,
        error,
      },
      toastStyle
    );
  },
};

export default notify;
