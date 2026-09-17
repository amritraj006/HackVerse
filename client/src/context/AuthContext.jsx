import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token') && !localStorage.getItem('user'));
  const [error, setError] = useState(null);

  // Verify and fetch user profile when token is present
  useEffect(() => {
    let isMounted = true;
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      authService.getCurrentUser()
        .then((res) => {
          if (isMounted) {
            if (res && res.data && res.data.user) {
              setUser(res.data.user);
              localStorage.setItem('user', JSON.stringify(res.data.user));
            }
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('[AuthContext] Background session check:', err?.message || err);
            // CRITICAL FIX: Only destroy the session if the server explicitly replied with 401 Unauthorized (expired/invalid token).
            // Do NOT log out on temporary network issues, Render spin-up/cold starts, 500, or 429 rate limits!
            if (err.statusCode === 401) {
              setUser(null);
              setToken(null);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (credentials) => {
    setError(null);
    try {
      const res = await authService.login(credentials);
      const { user: userData, token: jwtToken } = res.data;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errMsg = err.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const signup = async (userData) => {
    setError(null);
    try {
      const res = await authService.signup(userData);
      const { user: newUser, token: jwtToken } = res.data;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(jwtToken);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      const errMsg = err.message || 'Registration failed. Please try again.';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...updatedData };
      try {
        localStorage.setItem('user', JSON.stringify(updated));
      } catch {
        // ignore quota error
      }
      return updated;
    });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore server logout failures
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        signup,
        updateUser,
        logout,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
