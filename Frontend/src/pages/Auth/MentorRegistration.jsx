import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Upload, Video, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// Form validation schema using Zod
const mentorSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    jobTitle: z.string().min(2, 'Job title is required'),
    company: z.string().min(2, 'Company is required'),
    companyId: z.string().optional(),
    education: z.string().min(5, 'Education details required'),
    employment: z.string().min(5, 'Employment history required'),
    category: z.string().min(2, 'Please select a category'),
    skills: z.string().min(2, 'Please list some skills'),
    bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must be less than 500 characters'),
    linkedinUrl: z.string().refine(val => !val || /^(https?:\/\/)?(www\.)?linkedin\.com/i.test(val), 'Invalid LinkedIn URL').optional(),
    whyMentor: z.string().min(20, 'Please explain why you want to be a mentor'),
    greatestAchievement: z.string().min(20, 'Please share your greatest achievement'),
    hourlyRate: z.string().optional(),
});

const categoryOptions = {
    engineering: {
        skills: ["React", "Node.js", "Python", "Java", "System Design", "AWS", "Docker", "Kubernetes", "TypeScript"]
    },
    design: {
        skills: ["Figma", "Sketch", "Prototyping", "User Research", "Wireframing", "Adobe Creative Suite", "Motion Design"]
    },
    product: {
        skills: ["Agile/Scrum", "Roadmapping", "A/B Testing", "Data Analysis", "User Interviews", "Jira", "Go-To-Market"]
    },
    marketing: {
        skills: ["SEO/SEM", "Content Strategy", "Social Media", "Email Marketing", "Google Analytics", "Copywriting"]
    },
    data: {
        skills: ["SQL", "Python", "R", "Machine Learning", "Data Visualization", "Pandas", "Tableau", "TensorFlow"]
    }
};

const MentorRegistration = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [globalError, setGlobalError] = useState('');
    const [step, setStep] = useState(1);

    const prefilledData = location.state || {};

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(mentorSchema),
        defaultValues: {
            firstName: prefilledData.firstName || '',
            lastName: prefilledData.lastName || '',
            email: prefilledData.email || '',
            password: prefilledData.password || '',
            category: '',
            skills: '',
        }
    });

    const watchResume = watch('resume');
    const watchVideo = watch('introVideo');
    const selectedCategory = watch('category');

    const onSubmit = async (data) => {
        setGlobalError('');
        try {
            const formData = new FormData();

            Object.keys(data).forEach(key => {
                if (key !== 'resume' && key !== 'introVideo' && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            formData.append('role', 'mentor');

            if (data.resume && data.resume[0]) {
                formData.append('resume', data.resume[0]);
            }
            if (data.introVideo && data.introVideo[0]) {
                formData.append('introVideo', data.introVideo[0]);
            }

            const res = await api.post('/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                login(res.data.token, res.data.user);
                toast.success('Registration successful! Welcome as a mentor.');
                navigate('/dashboard/mentor');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            const msg = error.response?.data?.error || 'Registration failed. Please check your inputs.';
            setGlobalError(msg);
            toast.error(msg);
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
                        Become a Mentor
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        Join our elite community and share your knowledge with aspiring talent.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full" />
                    <div 
                        className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 rounded-full transition-all duration-500"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                        {[1, 2, 3].map(s => (
                            <div 
                                key={s}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}
                            >
                                {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                            </div>
                        ))}
                    </div>
                </div>

                {globalError && (
                    <div className="mb-8 p-4 bg-red-100/10 border border-red-500/20 text-red-500 rounded-xl text-center font-medium">
                        {globalError}
                    </div>
                )}

                <Card className="p-8 md:p-12 shadow-2xl border-none bg-white dark:bg-slate-900">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Step 1: Account Info */}
                        {step === 1 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="text-2xl font-bold mb-6">Account Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
                                    <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
                                    <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message} className="md:col-span-2" />
                                    <Input label="Password" type="password" {...register('password')} error={errors.password?.message} className="md:col-span-2" />
                                </div>
                                <div className="flex justify-end pt-6">
                                    <Button type="button" onClick={nextStep} className="px-8 h-12 font-bold">
                                        Next Component <ChevronRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Professional Info */}
                        {step === 2 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="text-2xl font-bold mb-6">Professional Profile</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Job Title" {...register('jobTitle')} error={errors.jobTitle?.message} />
                                    <Input label="Company" {...register('company')} error={errors.company?.message} />
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-widest text-[11px]">Primary Category</label>
                                        <select
                                            {...register('category')}
                                            className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="engineering">Software Engineering</option>
                                            <option value="design">Design & UX</option>
                                            <option value="product">Product Management</option>
                                            <option value="marketing">Marketing</option>
                                            <option value="data">Data Science</option>
                                        </select>
                                        {errors.category?.message && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input label="Skills (comma separated)" placeholder="React, Node.js, System Design" {...register('skills')} error={errors.skills?.message} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-widest text-[11px]">Short Bio</label>
                                        <textarea
                                            {...register('bio')}
                                            rows={4}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                                            placeholder="Tell us about your background and what you can offer..."
                                        />
                                        {errors.bio?.message && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-between pt-6">
                                    <Button type="button" variant="outline" onClick={prevStep} className="px-8 h-12 font-bold">
                                        <ChevronLeft className="mr-2 w-5 h-5" /> Back
                                    </Button>
                                    <Button type="button" onClick={nextStep} className="px-8 h-12 font-bold">
                                        Next Component <ChevronRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Experience & Verification */}
                        {step === 3 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="text-2xl font-bold mb-6">Verification & Experience</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <Input label="Education" placeholder="e.g. Stanford University, M.S. Computer Science" {...register('education')} error={errors.education?.message} />
                                    <Input label="Employment History" placeholder="e.g. Senior Software Engineer at Google" {...register('employment')} error={errors.employment?.message} />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="LinkedIn URL" {...register('linkedinUrl')} error={errors.linkedinUrl?.message} />
                                        <Input label="Hourly Rate ($)" type="number" {...register('hourlyRate')} error={errors.hourlyRate?.message} />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-widest text-[11px]">Greatest Achievement</label>
                                        <textarea
                                            {...register('greatestAchievement')}
                                            rows={3}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                                        />
                                        {errors.greatestAchievement?.message && <p className="text-xs text-red-500 mt-1">{errors.greatestAchievement.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-widest text-[11px]">Motivation for Mentoring</label>
                                        <textarea
                                            {...register('whyMentor')}
                                            rows={3}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                                        />
                                        {errors.whyMentor?.message && <p className="text-xs text-red-500 mt-1">{errors.whyMentor.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                        <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                                            <Upload className={`w-10 h-10 ${watchResume && watchResume.length > 0 ? 'text-green-500' : 'text-primary-500'} mb-3 group-hover:scale-110 transition-transform`} />
                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                                {watchResume && watchResume.length > 0 ? watchResume[0].name : 'Upload Resume'}
                                            </span>
                                            <input type="file" className="hidden" accept=".pdf,.docx" {...register('resume')} />
                                        </label>

                                        <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                                            <Video className={`w-10 h-10 ${watchVideo && watchVideo.length > 0 ? 'text-green-500' : 'text-blue-500'} mb-3 group-hover:scale-110 transition-transform`} />
                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                                {watchVideo && watchVideo.length > 0 ? watchVideo[0].name : 'Intro Video'}
                                            </span>
                                            <input type="file" className="hidden" accept="video/*" {...register('introVideo')} />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-8">
                                    <Button type="button" variant="outline" onClick={prevStep} className="px-8 h-12 font-bold">
                                        <ChevronLeft className="mr-2 w-5 h-5" /> Back
                                    </Button>
                                    <Button type="submit" size="lg" disabled={isSubmitting} className="px-12 h-12 font-bold shadow-xl shadow-primary-500/20">
                                        {isSubmitting ? 'Processing...' : 'Complete Registration'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default MentorRegistration;
