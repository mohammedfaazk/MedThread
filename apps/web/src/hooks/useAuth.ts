import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  doctorVerificationStatus?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const isDoctor = user?.role === 'DOCTOR';
  const isDoctorVerified = user?.role === 'DOCTOR' && user?.doctorVerificationStatus === 'APPROVED';
  const isDoctorPending = user?.role === 'DOCTOR' && 
    (user?.doctorVerificationStatus === 'PENDING' || user?.doctorVerificationStatus === 'UNDER_REVIEW');

  return {
    user,
    loading,
    isAuthenticated,
    isDoctor,
    isDoctorVerified,
    isDoctorPending,
    logout,
    updateUser,
  };
}
