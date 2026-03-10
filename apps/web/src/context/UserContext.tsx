'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

interface UserContextType {
    user: any;
    role: 'PATIENT' | 'DOCTOR' | 'VERIFIED_DOCTOR' | 'ADMIN' | null;
    profileId: string | null;
    loading: boolean;
    loggingOut: boolean;
    signOut: () => Promise<void>;
    doctorVerificationStatus?: string;
}

const UserContext = createContext<UserContextType>({
    user: null,
    role: null,
    profileId: null,
    loading: true,
    loggingOut: false,
    signOut: async () => { },
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'VERIFIED_DOCTOR' | 'ADMIN' | null>(null);
    const [profileId, setProfileId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [doctorVerificationStatus, setDoctorVerificationStatus] = useState<string | undefined>();
    const [useJWT, setUseJWT] = useState(false); // Track if we're using JWT

    const fetchRole = async (userId: string) => {
        try {
            console.log('Fetching role for userId:', userId);

            // 0. First check JWT auth data (highest priority)
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    if (parsedUser.role === 'DOCTOR' && parsedUser.doctorVerificationStatus === 'APPROVED') {
                        console.log('User identified as VERIFIED_DOCTOR from JWT auth');
                        setRole('VERIFIED_DOCTOR');
                        setProfileId(parsedUser.id);
                        return;
                    } else if (parsedUser.role === 'ADMIN') {
                        console.log('User identified as ADMIN from JWT auth');
                        setRole('ADMIN');
                        setProfileId(parsedUser.id);
                        return;
                    } else if (parsedUser.role === 'PATIENT') {
                        console.log('User identified as PATIENT from JWT auth');
                        setRole('PATIENT');
                        setProfileId(parsedUser.id);
                        return;
                    }
                } catch (parseError) {
                    console.warn('Failed to parse JWT user data:', parseError);
                }
            }

            // 1. Check if user is a doctor in Supabase
            try {
                const { data: doctorData, error: dError } = await supabase
                    .from('doctors')
                    .select('id, user_id')
                    .or(`id.eq.${userId},user_id.eq.${userId}`)
                    .maybeSingle();

                if (dError) console.warn('Supabase doctor check error:', dError.message);

                if (doctorData) {
                    console.log('User identified as VERIFIED_DOCTOR from Supabase, profileId:', doctorData.id);
                    setRole('VERIFIED_DOCTOR');
                    setProfileId(doctorData.id);
                    return;
                }
            } catch (supabaseError) {
                console.warn('⚠️ Supabase doctor check failed:', supabaseError);
            }

            // 2. Fallback: Check doctor_data.json for doctor identification
            try {
                const doctorJsonResponse = await fetch('/doctor_data.json');
                if (doctorJsonResponse.ok) {
                    const doctorJsonData = await doctorJsonResponse.json();
                    const matchedDoctor = doctorJsonData.find((doc: any) =>
                        doc.user_id === userId || doc.id === userId
                    );

                    if (matchedDoctor) {
                        console.log('User identified as VERIFIED_DOCTOR from doctor_data.json, profileId:', matchedDoctor.id);
                        setRole('VERIFIED_DOCTOR');
                        setProfileId(matchedDoctor.id);
                        return;
                    }
                }
            } catch (jsonError) {
                console.warn('Failed to load doctor_data.json fallback:', jsonError);
            }

            // 3. Check if user is a patient - try plural name as suggested by user
            try {
                const { data: patientData, error: pError } = await supabase
                    .from('patient_health_records')
                    .select('id')
                    .or(`id.eq.${userId},user_id.eq.${userId}`)
                    .maybeSingle();

                if (pError) {
                    console.warn('Supabase patient check error (plural):', pError.message, 'Trying singular...');
                    const { data: singData } = await supabase
                        .from('patient_health_record')
                        .select('id')
                        .or(`id.eq.${userId},user_id.eq.${userId}`)
                        .maybeSingle();

                    if (singData) {
                        setRole('PATIENT');
                        setProfileId(singData.id);
                        return;
                    }
                }

                if (patientData) {
                    setRole('PATIENT');
                    setProfileId(patientData.id);
                    return;
                }
            } catch (supabaseError) {
                console.warn('⚠️ Supabase patient check failed:', supabaseError);
            }

            // 4. Fallback to API
            console.log('Check API fallback for role...');
            const response = await axios.get(`/api/users/${userId}`);
            if (response.data && response.data.role) {
                setRole(response.data.role);
                setProfileId(response.data.id || userId);
                return;
            }
        } catch (error) {
            console.error('Failed to fetch user role:', error);
        }

        // Final fallback
        console.warn('Could not determine role for:', userId, 'defaulting to PATIENT');
        setRole('PATIENT');
        setProfileId(userId);
    };

    useEffect(() => {
        let mounted = true;

        const loadJWTAuth = () => {
            const token = localStorage.getItem('auth_token');
            const userData = localStorage.getItem('user');

            console.log('🔍 UserContext: Checking JWT auth...');

            if (token && userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    console.log('✅ JWT User found:', parsedUser);

                    if (mounted) {
                        setUseJWT(true); // Mark that we're using JWT
                        setUser(parsedUser);
                        setProfileId(parsedUser.id);
                        setDoctorVerificationStatus(parsedUser.doctorVerificationStatus);

                        // Map role correctly
                        if (parsedUser.role === 'DOCTOR' && parsedUser.doctorVerificationStatus === 'APPROVED') {
                            setRole('VERIFIED_DOCTOR');
                        } else {
                            setRole(parsedUser.role);
                        }

                        setLoading(false);
                    }
                    return true;
                } catch (error) {
                    console.error('❌ Failed to parse JWT user:', error);
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                }
            }
            return false;
        };

        const loadSupabaseAuth = async () => {
            // Skip Supabase if we have JWT auth
            if (localStorage.getItem('auth_token')) {
                console.log('⏭️ Skipping Supabase (JWT available)');
                if (mounted) {
                    setLoading(false);
                }
                return;
            }

            console.log('ℹ️ No JWT, checking Supabase...');
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user && mounted) {
                    console.log('✅ Supabase user found');
                    setUser(session.user);
                    await fetchRole(session.user.id);
                }
            } catch (error) {
                console.warn('⚠️ Supabase connection failed:', error);
                // Continue without Supabase
            }

            if (mounted) {
                setLoading(false);
            }
        };

        // Try JWT first
        const hasJWT = loadJWTAuth();

        // Only try Supabase if no JWT
        if (!hasJWT) {
            loadSupabaseAuth();
        }

        // Listen for storage changes
        const handleStorageChange = () => {
            console.log('🔄 Storage changed');
            const hasJWT = loadJWTAuth();
            if (!hasJWT && mounted) {
                loadSupabaseAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Supabase auth listener - ONLY if not using JWT
        let subscription: any = { unsubscribe: () => {} };
        
        // Only set up Supabase listener if no JWT
        if (!localStorage.getItem('auth_token')) {
            try {
                const { data } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
                    // CRITICAL: Ignore ALL Supabase events if we have JWT
                    if (useJWT || localStorage.getItem('auth_token')) {
                        console.log('⏭️ Ignoring Supabase event (using JWT)');
                        return;
                    }

                    console.log('🔄 Supabase auth changed:', event);
                    if (session?.user && mounted) {
                        setUser(session.user);
                        await fetchRole(session.user.id);
                    } else if (mounted) {
                        setUser(null);
                        setRole(null);
                        setProfileId(null);
                    }
                    if (mounted) {
                        setLoading(false);
                    }
                });
                subscription = data.subscription;
            } catch (error) {
                console.warn('⚠️ Failed to set up Supabase auth listener:', error);
            }
        }

        return () => {
            mounted = false;
            subscription.unsubscribe();
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [useJWT]); // Add useJWT as dependency

    const signOut = async () => {
        try {
            setLoggingOut(true);

            // Clear localStorage (JWT auth)
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');

            // Also sign out from Supabase if using it
            try {
                const { error } = await supabase.auth.signOut();
                if (error) console.warn('Supabase signout error:', error);
            } catch (supabaseError) {
                console.warn('⚠️ Supabase signout failed:', supabaseError);
            }

            setUser(null);
            setRole(null);
            setProfileId(null);
            setDoctorVerificationStatus(undefined);
            setUseJWT(false);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, role, profileId, loading, loggingOut, signOut, doctorVerificationStatus }}>
            {children}
        </UserContext.Provider>
    );
};
