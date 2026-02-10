import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { doctorAuthService } from '@/services/doctor/doctorAuthService';
import { supabase } from '@/config/supabase';
import toast from 'react-hot-toast';
import { Loader2, Mail, Lock } from 'lucide-react';

export function DoctorLogin() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        setLoading(true);
        // const result = await doctorAuthService.signup(data, new File([], ""), new File([], "")); // REMOVED: Should not call signup on login
        // Wait, I should use signInWithPassword. doctorAuthService doesn't have login yet or I missed it? 
        // Checking previous steps... I didn't add login to doctorAuthService explicitly in the tool call 58. 
        // I only added signup, getDoctorProfile, updateProfile, getCurrentDoctor.
        // I will use direct supabase auth here as per plan, or update service.
        // The plan said "Simple login form... const { data, error } = await supabase.auth.signInWithPassword..."

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            });

            if (authError) throw authError;

            // Check if doctor and verified
            const doctor = await doctorAuthService.getDoctorProfile(authData.user.id);

            if (!doctor) {
                toast.error("This account is not registered as a doctor");
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            if (!doctor.is_verified) {
                navigate('/doctor/pending');
            } else {
                navigate('/doctor/dashboard');
            }

            toast.success("Welcome back, Dr. " + doctor.full_name);

        } catch (error: any) {
            toast.error(error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Doctor Login</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Access your VitaVoice dashboard</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Email Address</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                            <input
                                {...register("email", { required: "Email is required" })}
                                type="email"
                                className="w-full pl-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="doctor@hospital.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Password</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                            <input
                                {...register("password", { required: "Password is required" })}
                                type="password"
                                className="w-full pl-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-slate-300" />
                            <span className="text-slate-600 dark:text-slate-400">Remember me</span>
                        </label>
                        <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-600/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm mt-8 text-slate-600 dark:text-slate-400">
                    Check application status? <Link to="/doctor/pending" className="text-blue-600 hover:underline font-medium">Check here</Link>
                </p>
                <p className="text-center text-sm mt-2 text-slate-600 dark:text-slate-400">
                    New to VitaVoice? <Link to="/doctor/signup" className="text-blue-600 hover:underline font-medium">Apply now</Link>
                </p>

                {/* Temporary shortcut for testing */}
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400 mb-2">FOR TESTING/DEMO:</p>
                    <Link to="/doctor/dashboard" className="text-xs text-blue-500 hover:underline">Skip Login & Go to Dashboard</Link>
                </div>
            </div>
        </div>
    );
}
