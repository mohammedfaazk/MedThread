import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { CapturePhoto } from '@/app/components/doctor/CapturePhoto';
import { doctorAuthService } from '@/services/doctor/doctorAuthService';
import toast from 'react-hot-toast';
import { Check, ChevronRight, Upload, Loader2, User, FileText, Camera } from 'lucide-react';

const step1Schema = z.object({
    full_name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Valid phone required"),
    password: z.string().min(8, "Min 8 chars").regex(/[A-Z]/, "Need uppercase").regex(/[0-9]/, "Need number"),
    confirm_password: z.string()
}).refine(data => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"]
});

const step2Schema = z.object({
    license_number: z.string().min(1, "License required"),
    specialization: z.string().min(1, "Select specialization"),
    hospital_name: z.string().min(1, "Hospital name required"),
    hospital_address: z.string().min(1, "Address required"),
    years_experience: z.preprocess((val) => Number(val), z.number().min(0))
});

export function DoctorSignup() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState<any>({});
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);

    const { register: register1, handleSubmit: handleSubmit1, formState: { errors: errors1 } } = useForm({
        resolver: zodResolver(step1Schema)
    });

    const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 } } = useForm({
        resolver: zodResolver(step2Schema)
    });

    const onStep1Submit = (data: any) => {
        setFormData((prev: any) => ({ ...prev, ...data }));
        setStep(2);
    };

    const onStep2Submit = (data: any) => {
        setFormData((prev: any) => ({ ...prev, ...data }));
        setStep(3);
    };

    const onFinalSubmit = async () => {
        if (!photoFile) return toast.error("Please capture your photo");
        if (!licenseFile) return toast.error("Please upload license document");

        setLoading(true);
        const result = await doctorAuthService.signup(formData, photoFile, licenseFile);
        setLoading(false);

        if (result.success) {
            toast.success("Account created! Welcome, Doctor.");
            navigate('/doctor/dashboard');
        } else {
            toast.error(result.error || "Signup failed");
        }
    };

    const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setLicenseFile(e.target.files[0]);
        }
    };

    const specializations = [
        "General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Pediatrician",
        "Orthopedic", "Gynecologist", "Psychiatrist", "ENT", "Ophthalmologist",
        "Urologist", "Pulmonologist", "Gastroenterologist", "Endocrinologist", "Nephrologist"
    ];

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                {/* Left Panel - Progress */}
                <div className="md:w-1/3 bg-blue-600 p-8 text-white hidden md:flex flex-col justify-between">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Join VitaVoice</h2>
                        <p className="text-blue-100">The AI-powered healthcare platform for modern doctors.</p>
                    </div>

                    <div className="space-y-6">
                        <div className={`flex items-center gap-3 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-white text-blue-600 border-white' : 'border-white/50 text-white'}`}>
                                {step > 1 ? <Check className="w-5 h-5" /> : "1"}
                            </div>
                            <span className="font-medium">Account Details</span>
                        </div>
                        <div className={`flex items-center gap-3 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-white text-blue-600 border-white' : 'border-white/50 text-white'}`}>
                                {step > 2 ? <Check className="w-5 h-5" /> : "2"}
                            </div>
                            <span className="font-medium">Professional Info</span>
                        </div>
                        <div className={`flex items-center gap-3 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-white text-blue-600 border-white' : 'border-white/50 text-white'}`}>
                                "3"
                            </div>
                            <span className="font-medium">Verification</span>
                        </div>
                    </div>

                    <div className="text-xs text-blue-200">
                        © 2026 VitaVoice Healthcare
                    </div>
                </div>

                {/* Right Panel - Forms */}
                <div className="flex-1 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Doctor Registration</h2>

                    {step === 1 && (
                        <form onSubmit={handleSubmit1(onStep1Submit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                                        <input {...register1("full_name")} className="w-full pl-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900" placeholder="Dr. John Doe" />
                                    </div>
                                    {errors1.full_name && <p className="text-red-500 text-xs mt-1">{errors1.full_name.message as string}</p>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email" {...register1("email")} className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900" />
                                    {errors1.email && <p className="text-red-500 text-xs mt-1">{errors1.email.message as string}</p>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Phone (+91)</label>
                                    <input type="tel" {...register1("phone")} className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900" />
                                    {errors1.phone && <p className="text-red-500 text-xs mt-1">{errors1.phone.message as string}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Password</label>
                                    <input type="password" {...register1("password")} className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900" />
                                    {errors1.password && <p className="text-red-500 text-xs mt-1">{errors1.password.message as string}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Confirm</label>
                                    <input type="password" {...register1("confirm_password")} className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900" />
                                    {errors1.confirm_password && <p className="text-red-500 text-xs mt-1">{errors1.confirm_password.message as string}</p>}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-xl flex items-center justify-center mt-6">
                                Next Step <ChevronRight className="w-5 h-5 ml-2" />
                            </button>
                            <p className="text-center text-sm mt-4">
                                Already have an account? <Link to="/doctor/login" className="text-blue-600 hover:underline">Login here</Link>
                            </p>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit2(onStep2Submit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Medical License Number</label>
                                <input {...register2("license_number")} className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900" />
                                {errors2.license_number && <p className="text-red-500 text-xs mt-1">{errors2.license_number.message as string}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Specialization</label>
                                <select {...register2("specialization")} className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900">
                                    <option value="">Select Specialization</option>
                                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {errors2.specialization && <p className="text-red-500 text-xs mt-1">{errors2.specialization.message as string}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Hospital / Clinic Name</label>
                                <input {...register2("hospital_name")} className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900" />
                                {errors2.hospital_name && <p className="text-red-500 text-xs mt-1">{errors2.hospital_name.message as string}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Hospital Address</label>
                                <textarea {...register2("hospital_address")} className="w-full h-20 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900" />
                                {errors2.hospital_address && <p className="text-red-500 text-xs mt-1">{errors2.hospital_address.message as string}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Years of Experience</label>
                                <input type="number" {...register2("years_experience")} className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900" />
                                {errors2.years_experience && <p className="text-red-500 text-xs mt-1">{errors2.years_experience.message as string}</p>}
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium h-12 rounded-xl">Back</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-xl flex items-center justify-center">
                                    Next Step <ChevronRight className="w-5 h-5 ml-2" />
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-blue-600" /> Live Verification
                                </h3>
                                <CapturePhoto onCapture={setPhotoFile} />
                            </div>

                            <div>
                                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" /> License Document
                                </h3>
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <input type="file" id="license" className="hidden" accept=".pdf,.jpg,.png" onChange={handleLicenseUpload} />
                                    <label htmlFor="license" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                        <span className="text-slate-600 dark:text-slate-300 font-medium">Click to upload Medical License</span>
                                        <span className="text-xs text-slate-400 mt-1">PDF, JPG or PNG (Max 5MB)</span>
                                        {licenseFile && <span className="mt-2 text-green-600 text-sm font-bold">{licenseFile.name}</span>}
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium h-12 rounded-xl">Back</button>
                                <button
                                    onClick={onFinalSubmit}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-xl flex items-center justify-center disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
