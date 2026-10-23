import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { DEMO_USERS } from '../utils/mockData';
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
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Attempt to verify with backend if available
          try {
            const res = await api.get('/auth/me');
            if (res.data && res.data.user) {
              setUser(res.data.user);
              localStorage.setItem('user', JSON.stringify(res.data.user));
            }
          } catch (err) {
            // Backend offline or mock mode - preserve stored user
            console.info('Backend unreachable, running with cached session:', err.message);
          }
        } catch (err) {
          console.error('Failed to parse cached user:', err);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } else {
        // Default to demo student for immediate preview if not set
        const defaultStudent = DEMO_USERS.student;
        setUser(defaultStudent);
        setToken('demo-token-student');
        localStorage.setItem('user', JSON.stringify(defaultStudent));
        localStorage.setItem('token', 'demo-token-student');
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Standard Login
  const login = async (username, password, rememberMe = true) => {
    setLoading(true);
    try {
      // First try real backend API
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
        // Fallback to match mock demo users
        const matchedDemo = Object.values(DEMO_USERS).find(
          (u) =>
            u.username.toLowerCase() === username.toLowerCase() ||
            u.email.toLowerCase() === username.toLowerCase()
        );

        if (matchedDemo) {
          const fakeToken = `demo-token-${matchedDemo.role}`;
          setUser(matchedDemo);
          setToken(fakeToken);
          if (rememberMe) {
            localStorage.setItem('token', fakeToken);
            localStorage.setItem('user', JSON.stringify(matchedDemo));
          }
          toast.success(`Welcome, ${matchedDemo.full_name}!`);
          setLoading(false);
          return { success: true, user: matchedDemo };
        } else {
          // If neither, fallback to a student session
          const genericUser = {
            id: `u-${Date.now()}`,
            username,
            full_name: username.charAt(0).toUpperCase() + username.slice(1),
            email: `${username}@student.edu.eg`,
            role: 'student',
            grade: '11',
            exam_target: 'SAT & EST',
          };
          setUser(genericUser);
          setToken('demo-token-generic');
          if (rememberMe) {
            localStorage.setItem('token', 'demo-token-generic');
            localStorage.setItem('user', JSON.stringify(genericUser));
          }
          toast.success(`Logged in as ${genericUser.full_name}`);
          setLoading(false);
          return { success: true, user: genericUser };
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Quick switch role (vital for easy testing and presentations)
  const switchDemoRole = (roleKey) => {
    const targetUser = DEMO_USERS[roleKey] || DEMO_USERS.student;
    const fakeToken = `demo-token-${targetUser.role}`;
    setUser(targetUser);
    setToken(fakeToken);
    localStorage.setItem('user', JSON.stringify(targetUser));
    localStorage.setItem('token', fakeToken);
    toast.success(`Switched role to: ${targetUser.role.toUpperCase()} (${targetUser.full_name})`);
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        switchDemoRole,
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
