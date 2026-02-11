'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Stethoscope, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Phone, FileText, Camera, Upload, Check, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: contextLoading } = useUser();
  
  // Get type from URL, default to patient
  const typeParam = searchParams.get('type');
  const initialType = typeParam === 'doctor' ? 'doctor' : 'patient';
  
  const [userType, setUserType] = useState<'patient' | 'doctor'>(initialType);
  const [step, setStep] = useState(1);
  
  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Doctor-specific fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !contextLoading) {
      router.push('/');
    }
  }, [user, contextLoading, router]);

  // Update userType when URL parameter changes
  useEffect(() => {
    if (typeParam === 'doctor' || typeParam === 'patient') {
      setUserType(typeParam);
    }
  }, [typeParam]);

  const specializations = [
    "General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Pediatrician",
    "Orthopedic", "Gynecologist", "Psychiatrist", "ENT", "Ophthalmologist",
    "Urologist", "Pulmonologist", "Gastroenterologist", "Endocrinologist", "Nephrologist"
  ];

  const handleStep1Next = () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Please fill all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!licenseNumber || !specialization || !hospitalName || !hospitalAddress || !yearsExperience) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleDoctorSignup = async () => {
    if (!licenseFile) {
      setError('Please upload your medical license');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: 'doctor',
            phone,
            license_number: licenseNumber,
            specialization,
            hospital_name: hospitalName,
            hospital_address: hospitalAddress,
            years_experience: yearsExperience,
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        alert('Doctor account created! Your application is pending verification. You will receive an email once approved.');
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setError('Please fill all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: 'patient',
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        alert('Signup successful! Please check your email to verify your account.');
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLicenseFile(e.target.files[0]);
    }
  };

  // Render doctor multi-step signup
  if (userType === 'doctor') {
    return (
      <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-200/30 rounded-full blur-[100px]" />

        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel - Progress */}
          <div className="md:w-1/3 bg-blue-600 p-8 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Join MedThread</h2>
              <p className="text-blue-100 text-sm">The AI-powered healthcare platform for modern doctors.</p>
            </div>

            <div className="space-y-6">
              <div className={`flex items-center gap-3 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step > 1 ? 'bg-white text-blue-600 border-white' : step === 1 ? 'bg-white text-blue-600 border-white' : 'border-white/50 text-white'}`}>
                  {step > 1 ? <Check className="w-5 h-5" /> : "1"}
                </div>
                <span className="font-medium">Account Details</span>
              </div>
              <div className={`flex items-center gap-3 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step > 2 ? 'bg-white text-blue-600 border-white' : step === 2 ? 'bg-white text-blue-600 border-white' : 'border-white/50 text-white'}`}>
                  {step > 2 ? <Check className="w-5 h-5" /> : "2"}
                </div>
                <span className="font-medium">Professional Info</span>
              </div>
              <div className={`flex items-center gap-3 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === 3 ? 'bg-white text-blue-600 border-white' : 'border-white/50 text-white'}`}>
                  3
                </div>
                <span className="font-medium">Verification</span>
              </div>
            </div>

            <div className="text-xs text-blue-200">
              © 2026 MedThread Healthcare
            </div>
          </div>

          {/* Right Panel - Forms */}
          <div className="flex-1 p-8 overflow-y-auto max-h-screen">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Doctor Registration</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Step 1: Account Details */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 h-11 px-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="Dr. John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 h-11 px-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone (+91)</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 h-11 px-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 h-11 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  onClick={handleStep1Next}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center mt-6 transition-colors"
                >
                  Next Step <ChevronRight className="w-5 h-5 ml-2" />
                </button>

                <p className="text-center text-sm mt-4 text-slate-600">
                  Already have an account? <Link href="/login" className="text-blue-600 hover:underline font-medium">Login here</Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Professional Info */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Medical License Number</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="MCI-12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Hospital / Clinic Name</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="City Hospital"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Hospital Address</label>
                  <textarea
                    value={hospitalAddress}
                    onChange={(e) => setHospitalAddress(e.target.value)}
                    className="w-full h-20 px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                    placeholder="Full address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Years of Experience</label>
                  <input
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    placeholder="5"
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-slate-100 text-slate-700 font-medium h-12 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStep2Next}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center transition-colors"
                  >
                    Next Step <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Verification */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> License Document
                  </h3>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                    <input
                      type="file"
                      id="license"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleLicenseUpload}
                    />
                    <label htmlFor="license" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-10 h-10 text-slate-400 mb-3" />
                      <span className="text-slate-700 font-medium">Click to upload Medical License</span>
                      <span className="text-xs text-slate-400 mt-1">PDF, JPG or PNG (Max 5MB)</span>
                      {licenseFile && (
                        <span className="mt-3 text-green-600 text-sm font-bold flex items-center gap-2">
                          <Check className="w-4 h-4" /> {licenseFile.name}
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="w-1/3 bg-slate-100 text-slate-700 font-medium h-12 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDoctorSignup}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center disabled:opacity-70 transition-colors"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render patient signup (userType is 'patient' here)
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-200/30 rounded-full blur-[100px]" />

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
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-blue-100 text-sm mt-1">Join MedThread as a Patient</p>
        </div>

        {/* Role Tabs */}
        <div className="flex p-2 gap-2 bg-slate-50 border-b border-slate-100">
          <button
            onClick={() => router.push('/signup?type=patient')}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all bg-white text-blue-600 shadow-sm border border-slate-200"
          >
            <User className="w-4 h-4" /> Patient
          </button>
          <button
            onClick={() => router.push('/signup?type=doctor')}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-slate-500 hover:text-slate-700"
          >
            <Stethoscope className="w-4 h-4" /> Doctor
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handlePatientSignup} className="space-y-5">
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
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
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
                  placeholder="Minimum 6 characters"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all ${
                loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-slate-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
