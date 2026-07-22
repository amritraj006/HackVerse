import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'));
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
            } else {
              setUser(null);
              localStorage.removeItem('token');
              setToken(null);
            }
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error('[AuthContext] Failed to load current user:', err);
            setUser(null);
            localStorage.removeItem('token');
            setToken(null);
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
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
      setToken(jwtToken);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      const errMsg = err.message || 'Registration failed. Please try again.';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore server logout failures
    } finally {
      localStorage.removeItem('token');
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
        logout,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
