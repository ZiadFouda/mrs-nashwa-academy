import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import platformDb from '../utils/platformDb';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          // Attempt to verify with backend if running locally
          try {
            const res = await api.get('/auth/me');
            if (res.data && res.data.user) {
              setUser(res.data.user);
              localStorage.setItem('user', JSON.stringify(res.data.user));
            }
          } catch (err) {
            // Running in client persistent database mode (e.g. GitHub Pages)
          }
        } catch (err) {
          console.error('Failed to parse cached user:', err);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      } else {
        // No auto-login: user must write their credentials manually
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Standard Login (Validates against real platform database)
  const login = async (username, password, rememberMe = true) => {
    setLoading(true);
    try {
      // 1. First try live backend API if available
      try {
        const response = await api.post('/auth/login', { username, password });
        const { user: apiUser, token: apiToken } = response.data;
        setUser(apiUser);
        setToken(apiToken);
        if (rememberMe) {
          localStorage.setItem('token', apiToken);
          localStorage.setItem('user', JSON.stringify(apiUser));
        }
        toast.success(`Welcome back, ${apiUser.full_name || apiUser.username}!`);
        setLoading(false);
        return { success: true, user: apiUser };
      } catch (apiError) {
        // 2. Validate against real persistent Platform Database
        const authenticatedUser = platformDb.authenticateUser(username, password);
        const realToken = `jwt-token-${authenticatedUser.id}-${Date.now()}`;

        setUser(authenticatedUser);
        setToken(realToken);

        if (rememberMe) {
          localStorage.setItem('token', realToken);
          localStorage.setItem('user', JSON.stringify(authenticatedUser));
        }

        toast.success(`Welcome back, ${authenticatedUser.full_name}!`);
        setLoading(false);
        return { success: true, user: authenticatedUser };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your username and password.';
      toast.error(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Register new student account
  const register = async (userData) => {
    setLoading(true);
    try {
      const newUser = platformDb.addUser(userData);
      toast.success(`Account created for ${newUser.full_name}! Please sign in.`);
      setLoading(false);
      return { success: true, user: newUser };
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    toast.success('Successfully logged out.');
  };

  const updateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    if (user?.id) {
      try {
        platformDb.updateUser(user.id, updatedFields);
      } catch (e) {
        console.warn('Could not update user in platformDb:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
