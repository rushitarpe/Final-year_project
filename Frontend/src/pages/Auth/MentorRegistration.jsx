import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronRight, ChevronLeft, CheckCircle, Plus, Trash2,
    Upload, Video, Globe, Linkedin, Github, Twitter, Lock,
    User, Briefcase, GraduationCap, Code2, Calendar, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    MENTOR_CATEGORIES, EDUCATION_STREAMS, DEGREE_TYPES, SKILL_OPTIONS,
    LANGUAGES, EXPERIENCE_LEVELS, SESSION_DURATIONS, MENTORSHIP_TYPES,
    AVAILABLE_DAYS, AVAILABLE_TIMES, INDIAN_STATES, COMPANY_TYPES
} from '../../utils/constants';

// ── Reusable sub-components ──────────────────────────────
const Label = ({ children, required }) => (
    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const Field = ({ label, required, children, error }) => (
    <div>
        {label && <Label required={required}>{label}</Label>}
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

const inputCls = "w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-400";
const selectCls = `${inputCls} cursor-pointer`;
const textareaCls = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all resize-none placeholder:text-slate-400";

const MultiSelect = ({ options, selected = [], onChange, placeholder, searchable = false }) => {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const toggle = (val) => {
        if (selected.includes(val)) onChange(selected.filter(v => v !== val));
        else onChange([...selected, val]);
    };
    const filtered = searchable ? options.filter(o => o.toLowerCase().includes(search.toLowerCase())) : options;

    return (
        <div className="relative">
            <div
                onClick={() => setOpen(!open)}
                className="min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 cursor-pointer flex flex-wrap gap-1.5 items-center"
            >
                {selected.length === 0 && <span className="text-sm text-slate-400">{placeholder}</span>}
                {selected.map(v => (
                    <span key={v} onClick={(e) => { e.stopPropagation(); toggle(v); }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-semibold cursor-pointer hover:bg-violet-200">
                        {v} ✕
                    </span>
                ))}
            </div>
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl max-h-64 overflow-auto">
                    {searchable && (
                        <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-violet-500"
                                placeholder="Search..." />
                        </div>
                    )}
                    <div className="p-1">
                        {filtered.map(opt => (
                            <div key={opt} onClick={() => toggle(opt)}
                                className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${selected.includes(opt)
                                    ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                {opt}
                            </div>
                        ))}
                        {filtered.length === 0 && <p className="text-sm text-slate-400 px-3 py-2">No results</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

const TOTAL_STEPS = 6;
const stepInfo = [
    { icon: User, label: 'Personal Info' },
    { icon: Briefcase, label: 'Professional' },
    { icon: GraduationCap, label: 'Education' },
    { icon: Code2, label: 'Skills' },
    { icon: Calendar, label: 'Availability' },
    { icon: FileText, label: 'Profile' },
];

const emptyEdu = () => ({
    degree: '', fieldOfStudy: '', specialization: '', institution: '',
    university: '', boardOrBody: '', country: 'India', startYear: '',
    endYear: '', currentlyEnrolled: false, grade: '', thesisTitle: '',
    achievements: [], isHighestDegree: false,
});

// ── Main Component ───────────────────────────────────────
const MentorRegistration = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const prefilledData = location.state || {};

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [globalError, setGlobalError] = useState('');

    // Form state
    const [form, setForm] = useState({
        // Step 1 — Personal
        firstName: prefilledData.firstName || '',
        lastName: prefilledData.lastName || '',
        email: prefilledData.email || '',
        password: '',
        phone: '',
        gender: '',
        dateOfBirth: '',
        city: '',
        state: '',
        country: 'India',
        // Step 2 — Professional
        jobTitle: '',
        company: '',
        companyType: '',
        companyWebsite: '',
        yearsOfExperience: '',
        currentlyWorking: true,
        category: '',
        subCategories: [],
        mentorshipTypes: [],
        // Step 3 — Education (array)
        education: [emptyEdu()],
        // Step 4 — Skills
        skills: [],
        languages: [],
        targetMenteeLevel: [],
        // Step 5 — Availability & Pricing
        sessionPrice: '0',
        sessionDuration: 60,
        offersFreeSession: true,
        availableDays: [],
        availableTimeSlots: [],
        // Step 6 — Profile
        bio: '',
        linkedinUrl: '',
        githubUrl: '',
        twitterHandle: '',
        website: '',
        greatestAchievement: '',
        featuredArticle: '',
        whyMentor: '',
    });

    const [files, setFiles] = useState({ profileImage: null, resume: null, introVideo: null });
    const profileImgRef = useRef();
    const resumeRef = useRef();
    const videoRef = useRef();

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
    const setEdu = (i, key, val) => setForm(f => {
        const edu = [...f.education];
        edu[i] = { ...edu[i], [key]: val };
        return { ...f, education: edu };
    });
    const addEdu = () => setForm(f => ({ ...f, education: [...f.education, emptyEdu()] }));
    const removeEdu = (i) => setForm(f => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));

    const nextStep = () => { setGlobalError(''); setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const onSubmit = async () => {
        setGlobalError('');
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('role', 'mentor');

            // Scalar fields
            const scalarKeys = [
                'firstName', 'lastName', 'email', 'password', 'phone', 'gender',
                'dateOfBirth', 'country', 'jobTitle', 'company', 'companyType',
                'companyWebsite', 'yearsOfExperience', 'currentlyWorking',
                'category', 'sessionPrice', 'sessionDuration', 'offersFreeSession',
                'bio', 'linkedinUrl', 'githubUrl', 'twitterHandle', 'website',
                'greatestAchievement', 'featuredArticle', 'whyMentor',
            ];
            scalarKeys.forEach(k => { if (form[k] !== '' && form[k] !== undefined) formData.append(k, form[k]); });

            // Location
            formData.append('location[city]', form.city);
            formData.append('location[state]', form.state);
            formData.append('location[country]', form.country);

            // Arrays
            form.subCategories.forEach(v => formData.append('subCategories[]', v));
            form.mentorshipTypes.forEach(v => formData.append('mentorshipTypes[]', v));
            form.skills.forEach(v => formData.append('skills[]', v));
            form.languages.forEach(v => formData.append('languages[]', v));
            form.targetMenteeLevel.forEach(v => formData.append('targetMenteeLevel[]', v));
            form.availableDays.forEach(v => formData.append('availableDays[]', v));
            form.availableTimeSlots.forEach(v => formData.append('availableTimeSlots[]', v));

            // Education (JSON)
            formData.append('education', JSON.stringify(form.education));

            // Files
            if (files.profileImage) formData.append('profileImage', files.profileImage);
            if (files.resume) formData.append('resume', files.resume);
            if (files.introVideo) formData.append('introVideo', files.introVideo);

            const res = await api.post('/auth/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                login(res.data.token, res.data.user);
                toast.success('Welcome! Your mentor profile is live!');
                navigate('/dashboard/mentor');
            }
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed. Please check your inputs.';
            setGlobalError(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ───────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 text-xs font-black uppercase tracking-widest mb-5">
                        🎓 Mentor Application
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Become a Mentor
                    </h1>
                    <p className="text-slate-500 mt-2">Share your expertise with the next generation</p>
                </div>

                {/* Step Progress */}
                <div className="mb-10">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute inset-y-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
                        <div
                            className="absolute inset-y-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-600 to-blue-500 -z-10 transition-all duration-500"
                            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                        />
                        {stepInfo.map(({ icon: Icon, label }, i) => {
                            const n = i + 1;
                            const done = step > n;
                            const active = step === n;
                            return (
                                <div key={n} className="flex flex-col items-center gap-1.5">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${done ? 'bg-violet-600 border-violet-600 text-white' : active ? 'bg-white dark:bg-slate-900 border-violet-600 text-violet-600 shadow-lg shadow-violet-500/30' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'}`}>
                                        {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                                    </div>
                                    <span className={`text-[10px] font-bold hidden sm:block ${active ? 'text-violet-600' : 'text-slate-400'}`}>{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {globalError && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium text-center">
                        {globalError}
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 md:p-10">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                            {/* ═══ STEP 1: Personal Info ═══ */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Personal Information</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field label="First Name" required>
                                            <input className={inputCls} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="e.g. Priya" />
                                        </Field>
                                        <Field label="Last Name" required>
                                            <input className={inputCls} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="e.g. Sharma" />
                                        </Field>
                                        <Field label="Email Address" required>
                                            <input className={inputCls} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                                        </Field>
                                        <Field label="Password" required>
                                            <input className={inputCls} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" />
                                        </Field>
                                        <Field label="Phone">
                                            <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                                        </Field>
                                        <Field label="Gender">
                                            <select className={selectCls} value={form.gender} onChange={e => set('gender', e.target.value)}>
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="non-binary">Non-binary</option>
                                                <option value="prefer-not-to-say">Prefer not to say</option>
                                            </select>
                                        </Field>
                                        <Field label="Date of Birth">
                                            <input className={inputCls} type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                                        </Field>
                                        <Field label="City">
                                            <input className={inputCls} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Mumbai" />
                                        </Field>
                                        <Field label="State">
                                            <select className={selectCls} value={form.state} onChange={e => set('state', e.target.value)}>
                                                <option value="">Select State</option>
                                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </Field>
                                    </div>
                                </div>
                            )}

                            {/* ═══ STEP 2: Professional ═══ */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Professional Information</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field label="Job Title" required>
                                            <input className={inputCls} value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder="e.g. Senior Software Engineer" />
                                        </Field>
                                        <Field label="Company">
                                            <input className={inputCls} value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Google" />
                                        </Field>
                                        <Field label="Company Type">
                                            <select className={selectCls} value={form.companyType} onChange={e => set('companyType', e.target.value)}>
                                                <option value="">Select type</option>
                                                {COMPANY_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Years of Experience">
                                            <input className={inputCls} type="number" min="0" max="50" value={form.yearsOfExperience} onChange={e => set('yearsOfExperience', e.target.value)} placeholder="e.g. 5" />
                                        </Field>
                                        <Field label="Company Website">
                                            <input className={inputCls} value={form.companyWebsite} onChange={e => set('companyWebsite', e.target.value)} placeholder="https://company.com" />
                                        </Field>
                                        <Field label="Currently Working Here">
                                            <div className="flex items-center gap-3 h-11">
                                                <button type="button" onClick={() => set('currentlyWorking', !form.currentlyWorking)}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${form.currentlyWorking ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.currentlyWorking ? 'left-6' : 'left-0.5'}`} />
                                                </button>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{form.currentlyWorking ? 'Yes' : 'No'}</span>
                                            </div>
                                        </Field>
                                        <Field label="Primary Category" required>
                                            <select className={selectCls} value={form.category} onChange={e => set('category', e.target.value)}>
                                                <option value="">Select category</option>
                                                {MENTOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </Field>
                                        <div className="sm:col-span-2">
                                            <Field label="Sub-Categories (optional)">
                                                <MultiSelect options={MENTOR_CATEGORIES.filter(c => c !== form.category)} selected={form.subCategories} onChange={v => set('subCategories', v)} placeholder="Select additional categories..." />
                                            </Field>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Field label="What kind of mentorship do you offer?" required>
                                                <MultiSelect options={MENTORSHIP_TYPES} selected={form.mentorshipTypes} onChange={v => set('mentorshipTypes', v)} placeholder="Select mentorship types..." />
                                            </Field>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══ STEP 3: Education ═══ */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Education</h2>
                                        <button type="button" onClick={addEdu} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-500 transition-colors">
                                            <Plus className="w-4 h-4" /> Add Degree
                                        </button>
                                    </div>
                                    {form.education.map((edu, i) => (
                                        <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 relative">
                                            {form.education.length > 1 && (
                                                <button type="button" onClick={() => removeEdu(i)} className="absolute top-4 right-4 w-8 h-8 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Field label="Degree">
                                                    <select className={selectCls} value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)}>
                                                        <option value="">Select degree</option>
                                                        {DEGREE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </Field>
                                                <Field label="Field of Study">
                                                    <select className={selectCls} value={edu.fieldOfStudy} onChange={e => setEdu(i, 'fieldOfStudy', e.target.value)}>
                                                        <option value="">Select stream</option>
                                                        {EDUCATION_STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </Field>
                                                <Field label="Specialization">
                                                    <input className={inputCls} value={edu.specialization} onChange={e => setEdu(i, 'specialization', e.target.value)} placeholder="e.g. Artificial Intelligence" />
                                                </Field>
                                                <Field label="Institution / College">
                                                    <input className={inputCls} value={edu.institution} onChange={e => setEdu(i, 'institution', e.target.value)} placeholder="e.g. IIT Bombay" />
                                                </Field>
                                                <Field label="University">
                                                    <input className={inputCls} value={edu.university} onChange={e => setEdu(i, 'university', e.target.value)} placeholder="e.g. Mumbai University" />
                                                </Field>
                                                <Field label="Board / Governing Body">
                                                    <input className={inputCls} value={edu.boardOrBody} onChange={e => setEdu(i, 'boardOrBody', e.target.value)} placeholder="e.g. CBSE, ICAI, UGC" />
                                                </Field>
                                                <Field label="Start Year">
                                                    <input className={inputCls} type="number" min="1950" max="2030" value={edu.startYear} onChange={e => setEdu(i, 'startYear', e.target.value)} placeholder="2018" />
                                                </Field>
                                                <Field label="End Year">
                                                    <input className={inputCls} type="number" min="1950" max="2030" value={edu.endYear} onChange={e => setEdu(i, 'endYear', e.target.value)} placeholder="2022" disabled={edu.currentlyEnrolled} />
                                                </Field>
                                                <Field label="Grade / CGPA">
                                                    <input className={inputCls} value={edu.grade} onChange={e => setEdu(i, 'grade', e.target.value)} placeholder="e.g. 9.2 CGPA, First Class" />
                                                </Field>
                                                <Field label="Thesis / Project Title (if any)">
                                                    <input className={inputCls} value={edu.thesisTitle} onChange={e => setEdu(i, 'thesisTitle', e.target.value)} placeholder="e.g. Deep Learning for NLP" />
                                                </Field>
                                                <div className="sm:col-span-2 flex flex-wrap gap-4">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={edu.currentlyEnrolled} onChange={e => setEdu(i, 'currentlyEnrolled', e.target.checked)} className="w-4 h-4 accent-violet-600" />
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">Currently enrolled</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={edu.isHighestDegree} onChange={e => setEdu(i, 'isHighestDegree', e.target.checked)} className="w-4 h-4 accent-violet-600" />
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">Highest degree</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ═══ STEP 4: Skills ═══ */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Skills & Expertise</h2>
                                    <Field label="Your Skills" required>
                                        <MultiSelect options={SKILL_OPTIONS} selected={form.skills} onChange={v => set('skills', v)} placeholder="Select your skills..." searchable />
                                        <p className="text-xs text-slate-400 mt-1">{form.skills.length} selected</p>
                                    </Field>
                                    <Field label="Languages You Can Mentor In" required>
                                        <MultiSelect options={LANGUAGES} selected={form.languages} onChange={v => set('languages', v)} placeholder="Select languages..." />
                                    </Field>
                                    <Field label="Who Do You Prefer to Mentor?">
                                        <MultiSelect options={EXPERIENCE_LEVELS} selected={form.targetMenteeLevel} onChange={v => set('targetMenteeLevel', v)} placeholder="Select experience levels..." />
                                    </Field>
                                </div>
                            )}

                            {/* ═══ STEP 5: Availability ═══ */}
                            {step === 5 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Session Setup & Availability</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field label="Session Price (₹ INR)">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                                                <input className={`${inputCls} pl-8`} type="number" min="0" value={form.sessionPrice} onChange={e => set('sessionPrice', e.target.value)} placeholder="0 for free" />
                                            </div>
                                        </Field>
                                        <Field label="Session Duration">
                                            <select className={selectCls} value={form.sessionDuration} onChange={e => set('sessionDuration', parseInt(e.target.value))}>
                                                {SESSION_DURATIONS.map(d => <option key={d} value={d}>{d} minutes</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Offer Free Intro Session">
                                            <div className="flex items-center gap-3 h-11">
                                                <button type="button" onClick={() => set('offersFreeSession', !form.offersFreeSession)}
                                                    className={`w-12 h-6 rounded-full transition-colors relative ${form.offersFreeSession ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.offersFreeSession ? 'left-6' : 'left-0.5'}`} />
                                                </button>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{form.offersFreeSession ? 'Yes' : 'No'}</span>
                                            </div>
                                        </Field>
                                    </div>
                                    <Field label="Available Days">
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_DAYS.map(day => (
                                                <button type="button" key={day}
                                                    onClick={() => set('availableDays', form.availableDays.includes(day) ? form.availableDays.filter(d => d !== day) : [...form.availableDays, day])}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.availableDays.includes(day) ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400'}`}>
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field label="Available Time Slots">
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_TIMES.map(time => (
                                                <button type="button" key={time}
                                                    onClick={() => set('availableTimeSlots', form.availableTimeSlots.includes(time) ? form.availableTimeSlots.filter(t => t !== time) : [...form.availableTimeSlots, time])}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.availableTimeSlots.includes(time) ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400'}`}>
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                </div>
                            )}

                            {/* ═══ STEP 6: Profile & Uploads ═══ */}
                            {step === 6 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Profile</h2>

                                    {/* File Uploads */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            { key: 'profileImage', ref: profileImgRef, label: 'Profile Photo', icon: '🖼️', accept: 'image/*' },
                                            { key: 'resume', ref: resumeRef, label: 'Resume (PDF)', icon: '📄', accept: '.pdf,.docx' },
                                            { key: 'introVideo', ref: videoRef, label: 'Intro Video', icon: '🎬', accept: 'video/*' },
                                        ].map(({ key, ref, label, icon, accept }) => (
                                            <label key={key} onClick={() => ref.current?.click()}
                                                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${files[key] ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                                <span className="text-3xl mb-2">{icon}</span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center">
                                                    {files[key] ? files[key].name : label}
                                                </span>
                                                <input ref={ref} type="file" className="hidden" accept={accept}
                                                    onChange={e => setFiles(f => ({ ...f, [key]: e.target.files?.[0] || null }))} />
                                            </label>
                                        ))}
                                    </div>

                                    <Field label="Bio / About You" required>
                                        <textarea className={textareaCls} rows={4} value={form.bio} onChange={e => set('bio', e.target.value)}
                                            placeholder="Tell mentees about your background and what you can help them with..." />
                                        <p className="text-xs text-slate-400 mt-1">{form.bio.length}/1000</p>
                                    </Field>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field label="Greatest Achievement">
                                            <input className={inputCls} value={form.greatestAchievement} onChange={e => set('greatestAchievement', e.target.value)} placeholder="e.g. Led team to 10x ARR growth" />
                                        </Field>
                                        <Field label="Featured Article URL">
                                            <input className={inputCls} value={form.featuredArticle} onChange={e => set('featuredArticle', e.target.value)} placeholder="https://..." />
                                        </Field>
                                        <Field label={<span className="flex items-center gap-1.5"><Linkedin className="w-3 h-3" /> LinkedIn</span>}>
                                            <input className={inputCls} value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="linkedin.com/in/yourprofile" />
                                        </Field>
                                        <Field label={<span className="flex items-center gap-1.5"><Github className="w-3 h-3" /> GitHub</span>}>
                                            <input className={inputCls} value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)} placeholder="github.com/username" />
                                        </Field>
                                        <Field label={<span className="flex items-center gap-1.5"><Twitter className="w-3 h-3" /> Twitter</span>}>
                                            <input className={inputCls} value={form.twitterHandle} onChange={e => set('twitterHandle', e.target.value)} placeholder="@handle" />
                                        </Field>
                                        <Field label={<span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Personal Website</span>}>
                                            <input className={inputCls} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yoursite.com" />
                                        </Field>
                                    </div>

                                    <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl">
                                        <Field label={<span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-amber-600" /> Why do you want to mentor? (Private — not shown publicly)</span>}>
                                            <textarea className={textareaCls} rows={3} value={form.whyMentor} onChange={e => set('whyMentor', e.target.value)}
                                                placeholder="Share your motivations for becoming a mentor. This is private and only visible to the platform team." />
                                        </Field>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={prevStep} disabled={step === 1}
                            className="flex items-center gap-2 px-6 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        {step < TOTAL_STEPS ? (
                            <button type="button" onClick={nextStep}
                                className="flex items-center gap-2 px-8 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/25 transition-all">
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button type="button" onClick={onSubmit} disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {isSubmitting ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                                ) : (
                                    <><CheckCircle className="w-4 h-4" /> Complete Registration</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorRegistration;
