'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
    doctorVerificationStatus?: string;
    avatar?: string;
    banner?: string;
    bio?: string;
    specialty?: string;
    pincode?: string;
}

interface AuthContextType {
    user: User | null;
    role: 'PATIENT' | 'DOCTOR' | 'VERIFIED_DOCTOR' | 'ADMIN' | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isDoctorVerified: boolean;
    isDoctorPending: boolean;
}

const JWTAuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    login: () => {},
    logout: () => {},
    refreshUser: async () => {},
    isDoctorVerified: false,
    isDoctorPending: false,
});

export const useJWTAuth = () => useContext(JWTAuthContext);

export const JWTAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'VERIFIED_DOCTOR' | 'ADMIN' | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = () => {
            try {
                const token = localStorage.getItem('auth_token');
                const userData = localStorage.getItem('user');

                if (token && userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    
                    // Map role
                    if (parsedUser.role === 'DOCTOR' && parsedUser.doctorVerificationStatus === 'APPROVED') {
                        setRole('VERIFIED_DOCTOR');
                    } else {
                        setRole(parsedUser.role);
                    }
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        loadUser();

        // Listen for storage changes (login/logout in other tabs)
        window.addEventListener('storage', loadUser);
        return () => window.removeEventListener('storage', loadUser);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        if (userData.role === 'DOCTOR' && userData.doctorVerificationStatus === 'APPROVED') {
            setRole('VERIFIED_DOCTOR');
        } else {
            setRole(userData.role);
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
        setRole(null);
    };

    // Re-fetch user profile from API and update localStorage + state.
    // Use this after saving pincode/profile so /trends picks it up immediately.
    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/profile/me/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return;
            const json = await res.json();
            if (!json.success) return;
            const fresh: User = {
                id: json.data.id,
                username: json.data.username,
                email: json.data.email,
                role: json.data.role,
                doctorVerificationStatus: json.data.doctorVerificationStatus,
                avatar: json.data.avatar,
                banner: json.data.banner,
                bio: json.data.bio,
                specialty: json.data.specialty,
                pincode: json.data.pincode,
            };
            localStorage.setItem('user', JSON.stringify(fresh));
            setUser(fresh);
            if (fresh.role === 'DOCTOR' && fresh.doctorVerificationStatus === 'APPROVED') {
                setRole('VERIFIED_DOCTOR');
            } else {
                setRole(fresh.role);
            }
        } catch {
            // non-critical
        }
    };

    const isDoctorVerified = user?.role === 'DOCTOR' && user?.doctorVerificationStatus === 'APPROVED';
    const isDoctorPending = user?.role === 'DOCTOR' && 
        (user?.doctorVerificationStatus === 'PENDING' || user?.doctorVerificationStatus === 'UNDER_REVIEW');

    return (
        <JWTAuthContext.Provider value={{ 
            user, 
            role, 
            loading, 
            login, 
            logout,
            refreshUser,
            isDoctorVerified,
            isDoctorPending
        }}>
            {children}
        </JWTAuthContext.Provider>
    );
};
