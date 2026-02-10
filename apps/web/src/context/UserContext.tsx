'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

interface UserContextType {
    user: any;
    role: 'PATIENT' | 'VERIFIED_DOCTOR' | null;
    profileId: string | null;
    loading: boolean;
    loggingOut: boolean;
    signOut: () => Promise<void>;
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
    const [role, setRole] = useState<'PATIENT' | 'VERIFIED_DOCTOR' | null>(null);
    const [profileId, setProfileId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    const fetchRole = async (userId: string) => {
        try {
            console.log('Fetching role for userId:', userId);

            // 1. Check if user is a doctor in Supabase
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
        const fetchUserAndRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                setUser(session.user);
                await fetchRole(session.user.id);
            }
            setLoading(false);
        };

        fetchUserAndRole();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
            if (session?.user) {
                setUser(session.user);
                await fetchRole(session.user.id);
            } else {
                setUser(null);
                setRole(null);
                setProfileId(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            setLoggingOut(true);
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
            setRole(null);
            setProfileId(null);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, role, profileId, loading, loggingOut, signOut }}>
            {children}
        </UserContext.Provider>
    );
};
