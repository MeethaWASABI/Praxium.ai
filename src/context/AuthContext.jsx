import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial Data Seeding
  useEffect(() => {
    const initAuth = () => {
      console.log('Auth: Starting Init...');
      try {
        const rawUsers = localStorage.getItem('users');
        let users = [];

        if (rawUsers) {
          try {
            users = JSON.parse(rawUsers);
          } catch (e) {
            console.error('Auth: JSON Parse Error, resetting.', e);
            localStorage.clear();
          }
        }

        // Default Users
        const defaultUsers = [
          { id: 'admin1', role: 'admin', name: 'Admin User', email: 'admin@praxium.ai', password: 'Admin@123' },
          { id: 'teacher1', role: 'teacher', name: 'Teacher Dave', email: 'teacher@praxium.ai', password: 'password' },
          { id: 'student1', role: 'student', name: 'Student John', email: 'student@praxium.ai', password: 'password' }
        ];

        defaultUsers.forEach(defUser => {
          const idx = users.findIndex(u => u.email === defUser.email);
          if (idx === -1) {
            users.push(defUser);
            console.log('Auth: Seeded ' + defUser.role);
          } else if (users[idx].password !== defUser.password) {
            // updates password if mismatch/corrupted
            users[idx] = defUser;
            console.log('Auth: Updated ' + defUser.role);
          }
        });

        localStorage.setItem('users', JSON.stringify(users));

        // Load Session
        const session = localStorage.getItem('user');
        if (session) {
          setUser(JSON.parse(session));
        }

      } catch (e) {
        console.error('Auth: Critical Init Error', e);
      } finally {
        console.log('Auth: Init Complete.');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }

      // --- Smart Login Fallback (Client-side) ---
      // If backend fails/user not found, we still keep the smart login for demo purposes
      // But only if the error specifically means user not found or we want to allow demo mode
      if (res.status === 401 || res.status === 404) {
        const lowerEmail = identifier.toLowerCase();
        let detectedRole = null;

        if (lowerEmail.includes('admin')) detectedRole = 'admin';
        else if (lowerEmail.includes('teacher')) detectedRole = 'teacher';
        else if (lowerEmail.includes('student')) detectedRole = 'student';

        if (detectedRole) {
          console.log(`Auth: Smart Login detected role '${detectedRole}' for ${identifier}.`);
          // Note: In real production, we'd sync this back to DB. 
          // For now, we trust the backend is the source of truth, but if it's a new "smart" user, we allow local.
          // Actually, let's just use the backend response and only fallback if it's a specific developer flag.
        }
      }

      return { success: false, message: data.message || 'Login Failed' };
    } catch (e) {
      console.error('Login error:', e);
      return { success: false, message: 'Auth system unreachable' };
    }
  };

  const signup = (name, email, password, role = 'student') => {
    // Simplistic Signup
    return { success: false, message: 'Signup disabled in debug mode' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const refreshUser = () => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const freshUser = users.find(u => u.id === user.id);
    if (freshUser) {
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    }
  };

  const resetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
      const { password, ...safeUser } = users[idx];
      setUser(safeUser);
      localStorage.setItem('user', JSON.stringify(safeUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, resetData, refreshUser, updateProfile, loading }}>
      {/* Prevent flash of login screen by waiting for init */}
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
