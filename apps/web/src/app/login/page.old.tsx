'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Phone, Fingerprint, Eye, EyeOff, AlertCircle, Stethoscope, User, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, role, loading: contextLoading } = useUser();

  // Redirect based on role when user is logged in
  useEffect(() => {
    // Only redirect if we ARE NOT currently trying to log in manually
    // This prevents the context from redirecting a user before handleLogin validation finishes
    if (user && !contextLoading && role && !isLoggingIn) {
      console.log(`[Login] User detected with role ${role}, redirecting to home`);
      router.push('/');
    }
  }, [user, role, contextLoading, router, isLoggingIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');
    setIsLoggingIn(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setIsLoggingIn(false);
        throw authError;
      }

      const userId = data.user.id;
      console.log(`[Login] ID: ${userId}, Type: ${userType}`);

      // Strict Role Validation
      if (userType === 'doctor') {
        const { data: doctorData, error: docError } = await supabase
          .from('doctors')
          .select('id')
          .or(`id.eq.${userId},user_id.eq.${userId}`)
          .maybeSingle();

        if (docError) console.warn('[Login] DB Doctor check error (could be 404):', docError.message);

        let isDoctor = !!doctorData;

        // Fallback: Check doctor_data.json
        if (!isDoctor) {
          console.log('[Login] DB check did not find doctor, checking doctor_data.json...');
          try {
            const doctorJsonResponse = await fetch('/doctor_data.json');
            if (doctorJsonResponse.ok) {
              const doctorJsonData = await doctorJsonResponse.json();
              isDoctor = doctorJsonData.some((doc: any) => doc.user_id === userId || doc.id === userId);
              console.log('[Login] JSON check result:', isDoctor);
            }
          } catch (e) {
            console.warn('Failed to check doctor_data.json fallback during login');
          }
        }

        // Final Doctor validation
        if (!isDoctor) {
          console.warn('[Login] Validation FAILED for doctor portal');
          await supabase.auth.signOut();
          setIsLoggingIn(false);
          throw new Error('This account is not registered as a doctor. Please use the Patient login.');
        }
      } else {
        // Patient login: Ensure they are NOT a doctor
        const { data: dbDoctor, error: dbDocError } = await supabase
          .from('doctors')
          .select('id')
          .or(`id.eq.${userId},user_id.eq.${userId}`)
          .maybeSingle();

        if (dbDocError) console.warn('[Login] DB Patient check anti-doctor error:', dbDocError.message);

        let isActuallyDoctor = !!dbDoctor;

        if (!isActuallyDoctor) {
          try {
            const doctorJsonResponse = await fetch('/doctor_data.json');
            if (doctorJsonResponse.ok) {
              const doctorJsonData = await doctorJsonResponse.json();
              isActuallyDoctor = doctorJsonData.some((doc: any) => doc.user_id === userId || doc.id === userId);
              console.log('[Login] Patient portal anti-doctor JSON check:', isActuallyDoctor);
            }
          } catch (e) { }
        }

        if (isActuallyDoctor) {
          console.warn('[Login] Validation FAILED: Doctor tried to login through patient portal');
          await supabase.auth.signOut();
          setIsLoggingIn(false);
          throw new Error('This account is registered as a doctor. Please use the Doctor login.');
        }

        console.log('[Login] Patient validation PASSED');
      }

      console.log('[Login] Sign in successful and role verified');

      // Now it's safe to redirect
      router.push('/');
      router.refresh();

      // We don't necessarily need to set isLoggingIn(false) if we are redirecting,
      // but it's good practice in case router.push doesn't immediately unmount the component
    } catch (err: any) {
      setIsLoggingIn(false);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergency = () => {
    // router.push('/emergency');
    window.location.href = 'tel:911'; // Example
  };

  if (contextLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-200/30 rounded-full blur-[100px]" />

      {/* Emergency Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleEmergency}
        className="fixed top-6 right-6 z-50 w-14 h-14 bg-red-600 rounded-full shadow-lg shadow-red-600/30 flex items-center justify-center hover:bg-red-700 transition-colors"
        animate={{ boxShadow: ['0 0 0 0 rgba(220, 38, 38, 0.4)', '0 0 0 12px rgba(220, 38, 38, 0)', '0 0 0 0 rgba(220, 38, 38, 0)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Phone className="w-6 h-6 text-white" />
      </motion.button>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <Mail className="w-12 h-12 mx-auto mb-4 text-blue-100" />
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-blue-100 text-sm mt-1">Sign in to your MedThread account</p>
        </div>

        {/* Role Tabs */}
        <div className="flex p-2 gap-2 bg-slate-50 border-b border-slate-100">
          <button
            onClick={() => setUserType('patient')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${userType === 'patient'
              ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <User className="w-4 h-4" /> Patient
          </button>
          <button
            onClick={() => setUserType('doctor')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${userType === 'doctor'
              ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Stethoscope className="w-4 h-4" /> Doctor
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                {userType === 'doctor' ? 'Professional Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={userType === 'doctor' ? "doctor@hospital.com" : "Enter email"}
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link href="/forgot-password" title="Forgot Password" className="text-xs font-medium text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!email || !password || loading}
              className={`w-full h-12 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all ${!email || !password || loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {userType === 'patient' && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 border border-slate-200 hover:border-blue-200 bg-white text-slate-700 hover:bg-blue-50 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Fingerprint className="w-5 h-5 text-blue-600" />
                Sign in with Biometrics
              </motion.button>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-slate-600 text-sm">
            New here?{' '}
            <button
              onClick={() => router.push(`/signup?type=${userType}`)}
              className="text-blue-600 font-bold hover:underline cursor-pointer bg-transparent border-none"
            >
              Create {userType === 'doctor' ? 'Doctor' : 'Patient'} Account
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
