import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Upload, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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
    twitterHandle: z.string().optional(),
    website: z.string().refine(val => !val || /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})/i.test(val), 'Invalid website URL').optional(),
    introVideo: z.any().optional(), // File upload
    featuredArticle: z.string().refine(val => !val || /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})/i.test(val), 'Invalid article URL').optional(),
    whyMentor: z.string().min(20, 'Please explain why you want to be a mentor'),
    greatestAchievement: z.string().min(20, 'Please share your greatest achievement'),
    resume: z.any().optional(), // File upload
    hourlyRate: z.coerce.number().min(0, 'Hourly rate cannot be negative').optional(),
});

type MentorFormValues = z.infer<typeof mentorSchema>;

const categoryOptions = {
    engineering: {
        education: ["B.S. Computer Science", "Bootcamp Graduate", "Self-Taught", "M.S. Computer Science", "Ph.D. Computer Science"],
        employment: ["Junior Developer", "Mid-Level Developer", "Senior Developer", "Tech Lead", "Engineering Manager", "CTO"],
        skills: ["React", "Node.js", "Python", "Java", "System Design", "AWS", "Docker", "Kubernetes", "TypeScript"]
    },
    design: {
        education: ["B.A. Graphic Design", "BFA Interaction Design", "Human-Computer Interaction", "Self-Taught", "Architecture"],
        employment: ["Junior Designer", "UX Designer", "UI/UX Designer", "Product Designer", "Design Lead", "Head of Design"],
        skills: ["Figma", "Sketch", "Prototyping", "User Research", "Wireframing", "Adobe Creative Suite", "Motion Design"]
    },
    product: {
        education: ["MBA", "B.S. Business Admin", "Certified Scrum Product Owner", "B.S. Computer Science", "Economics"],
        employment: ["Associate PM", "Product Manager", "Senior PM", "Group Product Manager", "VP of Product", "Founder"],
        skills: ["Agile/Scrum", "Roadmapping", "A/B Testing", "Data Analysis", "User Interviews", "Jira", "Go-To-Market"]
    },
    marketing: {
        education: ["B.A. Marketing", "B.A. Communications", "MBA", "Self-Taught", "Digital Marketing Cert"],
        employment: ["Digital Marketer", "Growth Hacker", "Marketing Manager", "Director of Marketing", "VP of Marketing"],
        skills: ["SEO/SEM", "Content Strategy", "Social Media", "Email Marketing", "Google Analytics", "Copywriting"]
    },
    data: {
        education: ["B.S. Data Science", "M.S. Data Science", "Ph.D. Computer Science", "B.S. Mathematics", "Statistics"],
        employment: ["Data Analyst", "Data Scientist", "Machine Learning Engineer", "Data Engineer", "Head of Data"],
        skills: ["SQL", "Python", "R", "Machine Learning", "Data Visualization", "Pandas", "Tableau", "TensorFlow"]
    }
};

const MentorRegistration = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [globalError, setGlobalError] = useState('');

    const prefilledData = location.state || {};

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<MentorFormValues>({
        resolver: zodResolver(mentorSchema),
        defaultValues: {
            firstName: prefilledData.firstName || '',
            lastName: prefilledData.lastName || '',
            email: prefilledData.email || '',
            password: prefilledData.password || '',
            hourlyRate: 0,
        }
    });

    const watchResume = watch('resume');
    const watchVideo = watch('introVideo');
    const selectedCategory = watch('category');

    const currentOptions = selectedCategory ? categoryOptions[selectedCategory as keyof typeof categoryOptions] : null;

    const onSubmit = async (data: MentorFormValues) => {
        setGlobalError('');
        try {
            // We need to use FormData because of file uploads
            const formData = new FormData();

            // Append all non-file fields
            Object.keys(data).forEach(key => {
                const k = key as keyof MentorFormValues;
                if (k !== 'resume' && k !== 'introVideo' && data[k] !== undefined) {
                    formData.append(k, data[k] as string);
                }
            });
            formData.append('role', 'mentor');

            // Handle Files (Optional fields)
            if (data.resume && data.resume[0]) {
                formData.append('resume', data.resume[0]);
            }
            if (data.introVideo && data.introVideo[0]) {
                formData.append('introVideo', data.introVideo[0]);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            const res = await api.post('/auth/register', formData, config);

            if (res.data.success) {
                login(res.data.token, res.data.user);
                navigate('/dashboard/mentor');
            }
        } catch (error: any) {
            console.error('Registration failed:', error);
            setGlobalError(error.response?.data?.error || 'Registration failed due to a server error.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
                        Become a Mentor
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Share your expertise, guide the next generation, and grow your network.
                    </p>
                </div>

                {globalError && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-center max-w-2xl mx-auto">
                        {globalError}
                    </div>
                )}

                <Card className="p-8 md:p-12">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Personal Info */}
                        <div>
                            <h3 className="text-xl font-semibold mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
                                <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
                                <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message} className="md:col-span-2" />
                                <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
                                <Input label="Confirm Password" type="password" />
                            </div>
                        </div>

                        {/* Professional Background */}
                        <div>
                            <h3 className="text-xl font-semibold mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">Professional Background</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Job Title" {...register('jobTitle')} error={errors.jobTitle?.message} />
                                <Input label="Company" {...register('company')} error={errors.company?.message} />
                                <Input label="Company ID (Optional)" {...register('companyId')} error={errors.companyId?.message} />
                                <Input label="Hourly Rate ($) - Optional" type="number" {...register('hourlyRate')} error={errors.hourlyRate?.message} placeholder="e.g. 50" />
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Category</label>
                                    <select
                                        {...register('category')}
                                        className="flex h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur-sm"
                                    >
                                        <option value="">Select a category</option>
                                        <option value="engineering">Software Engineering</option>
                                        <option value="design">Design & UX</option>
                                        <option value="product">Product Management</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="data">Data Science</option>
                                    </select>
                                    {errors.category?.message && <span className="text-xs text-red-500 mt-1">{errors.category.message}</span>}
                                </div>
                                <div className="md:col-span-2">
                                    <Input label="Skills (comma separated)" placeholder="React, Node.js, System Design" {...register('skills')} error={errors.skills?.message} />
                                    {currentOptions && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {currentOptions.skills.map(skill => (
                                                <button
                                                    key={skill}
                                                    type="button"
                                                    onClick={() => {
                                                        const currentSkills = watch('skills') || '';
                                                        const skillArray = currentSkills.split(',').map(s => s.trim()).filter(s => s);
                                                        if (!skillArray.includes(skill)) {
                                                            skillArray.push(skill);
                                                            setValue('skills', skillArray.join(', '), { shouldValidate: true });
                                                        }
                                                    }}
                                                    className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium cursor-pointer"
                                                >
                                                    + {skill}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Short Bio</label>
                                    <textarea
                                        {...register('bio')}
                                        rows={4}
                                        className="flex w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur-sm resize-none"
                                        placeholder="Tell mentees about yourself..."
                                    />
                                    {errors.bio?.message && <span className="text-xs text-red-500 mt-1">{errors.bio.message}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Experience & Achievements */}
                        <div>
                            <h3 className="text-xl font-semibold mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">Experience & Achievements</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Input label="Education" list="education-options" placeholder="University, Degree, Year" {...register('education')} error={errors.education?.message} />
                                        {currentOptions && (
                                            <datalist id="education-options">
                                                {currentOptions.education.map(opt => <option key={opt} value={opt} />)}
                                            </datalist>
                                        )}
                                    </div>
                                    <div>
                                        <Input label="Employment History" list="employment-options" placeholder="Previous notable roles" {...register('employment')} error={errors.employment?.message} />
                                        {currentOptions && (
                                            <datalist id="employment-options">
                                                {currentOptions.employment.map(opt => <option key={opt} value={opt} />)}
                                            </datalist>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Greatest Professional Achievement</label>
                                    <textarea
                                        {...register('greatestAchievement')}
                                        rows={3}
                                        className="flex w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur-sm resize-none"
                                    />
                                    {errors.greatestAchievement?.message && <span className="text-xs text-red-500 mt-1">{errors.greatestAchievement.message}</span>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5 flex justify-between">
                                        <span>Why do you want to be a mentor?</span>
                                        <span className="text-slate-400 font-normal">(Private)</span>
                                    </label>
                                    <textarea
                                        {...register('whyMentor')}
                                        rows={3}
                                        className="flex w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur-sm resize-none"
                                    />
                                    {errors.whyMentor?.message && <span className="text-xs text-red-500 mt-1">{errors.whyMentor.message}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Online Presence & Media */}
                        <div>
                            <h3 className="text-xl font-semibold mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">Online Presence & Verification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="LinkedIn URL" {...register('linkedinUrl')} error={errors.linkedinUrl?.message} />
                                <Input label="Twitter Handle" {...register('twitterHandle')} error={errors.twitterHandle?.message} />
                                <Input label="Personal Website" {...register('website')} error={errors.website?.message} />
                                <Input label="Featured Article/Publication (URL)" {...register('featuredArticle')} error={errors.featuredArticle?.message} />

                                {/* File Uploads */}
                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                        <Upload className={`w-8 h-8 ${watchResume && watchResume.length > 0 ? 'text-green-500' : 'text-primary-500'} mb-3 group-hover:scale-110 transition-transform`} />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {watchResume && watchResume.length > 0 ? watchResume[0].name : 'Upload Resume'}
                                        </span>
                                        <span className="text-xs text-slate-500 mt-1">PDF, DOCX up to 5MB</span>
                                        <input type="file" className="hidden" accept=".pdf,.docx" {...register('resume')} />
                                    </label>

                                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                        <Video className={`w-8 h-8 ${watchVideo && watchVideo.length > 0 ? 'text-green-500' : 'text-blue-500'} mb-3 group-hover:scale-110 transition-transform`} />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {watchVideo && watchVideo.length > 0 ? watchVideo[0].name : 'Introduction Video'}
                                        </span>
                                        <span className="text-xs text-slate-500 mt-1">MP4, WebM up to 50MB</span>
                                        <input type="file" className="hidden" accept="video/*" {...register('introVideo')} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto px-12">
                                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default MentorRegistration;
