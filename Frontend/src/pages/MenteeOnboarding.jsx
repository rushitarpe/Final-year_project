import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight, ChevronLeft, CheckCircle, User, GraduationCap,
    Target, Code2, Calendar, Camera, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    MENTOR_CATEGORIES, EDUCATION_STREAMS, DEGREE_TYPES, SKILL_OPTIONS,
    LANGUAGES, EXPERIENCE_LEVELS, SESSION_DURATIONS, SESSION_FREQUENCIES,
    MENTORSHIP_TYPES, AVAILABLE_DAYS, AVAILABLE_TIMES, INDIAN_STATES,
    GOAL_OPTIONS, INTEREST_OPTIONS, COMPANY_TYPES
} from '../utils/constants';

// ── Shared sub-components ────────────────────────────────────────
const Label = ({ children, required }) => (
    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);
const Field = ({ label, required, children, error }) => (
    <div>
        {label && <Label required={required}>{label}</Label>}
        {children}
        {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1">⚠ {error}</p>}
    </div>
);
const ic = (err) =>
    `w-full h-11 rounded-xl border ${err ? 'border-red-400 ring-2 ring-red-900/40' : 'border-white/10 focus:ring-2 focus:ring-violet-500 focus:border-transparent'} bg-white/5 px-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-600`;
const sc = (err) => `${ic(err)} cursor-pointer select-dark`;
const textareaCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-600";

const MultiSelect = ({ options, selected = [], onChange, placeholder, searchable = false, hasError = false }) => {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const toggle = (val) => {
        onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
    };
    const filtered = searchable
        ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
        : options;
    return (
        <div className="relative" ref={ref}>
            {/* Trigger */}
            <div
                onClick={() => setOpen(!open)}
                className={`min-h-[44px] rounded-xl border ${
                    hasError
                        ? 'border-red-400 ring-2 ring-red-900/40'
                        : open
                            ? 'border-violet-500 ring-2 ring-violet-500/20'
                            : 'border-white/10 hover:border-white/20'
                } bg-white/5 px-3 py-2 cursor-pointer flex flex-wrap gap-1.5 items-center transition-all`}>
                {selected.length === 0 && <span className="text-sm text-slate-600">{placeholder}</span>}
                {selected.map(v => (
                    <span key={v} onClick={e => { e.stopPropagation(); toggle(v); }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold cursor-pointer hover:bg-violet-500/30 transition-colors">
                        {v} <span className="opacity-60 hover:opacity-100">✕</span>
                    </span>
                ))}
                <span className="ml-auto text-slate-600 flex-shrink-0">
                    <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none"><path d="M2 5l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
            </div>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl shadow-black/60 max-h-64 overflow-auto backdrop-blur-xl">
                    {searchable && (
                        <div className="p-2 border-b border-white/8 sticky top-0 bg-[#0d1117]">
                            <input
                                autoFocus
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-600"
                                placeholder="Search options..."
                            />
                        </div>
                    )}
                    <div className="p-1">
                        {filtered.map(opt => (
                            <div key={opt} onClick={() => toggle(opt)}
                                className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors flex items-center justify-between ${
                                    selected.includes(opt)
                                        ? 'bg-violet-600/20 text-violet-300 font-semibold'
                                        : 'text-slate-300 hover:bg-white/6 hover:text-white'
                                }`}>
                                <span>{opt}</span>
                                {selected.includes(opt) && (
                                    <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                )}
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <p className="text-sm text-slate-500 px-3 py-3 text-center">No results found</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const TOTAL_STEPS = 5;
const stepInfo = [
    { icon: User, label: 'Personal' },
    { icon: GraduationCap, label: 'Education' },
    { icon: Target, label: 'Goals' },
    { icon: Code2, label: 'Skills' },
    { icon: Calendar, label: 'Preferences' },
];

// ── Per-step validation ──────────────────────────────────────────
const validateStep = (step, form) => {
    const e = {};
    if (step === 1) {
        if (!form.phone?.trim()) e.phone = 'Phone number is required';
        if (!form.gender) e.gender = 'Please select your gender';
        if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
        if (!form.city?.trim()) e.city = 'City is required';
        if (!form.state) e.state = 'Please select your state';
    }
    if (step === 2) {
        if (!form.degree) e.degree = 'Degree is required';
        if (!form.fieldOfStudy) e.fieldOfStudy = 'Field of study is required';
        if (!form.institution?.trim()) e.institution = 'Institution name is required';
    }
    if (step === 3) {
        if (!form.currentRole?.trim()) e.currentRole = 'Current role is required';
        if (!form.experienceLevel) e.experienceLevel = 'Experience level is required';
        if (!form.preferredCategories?.length) e.preferredCategories = 'Select at least 1 mentor category';
        if (!form.goals?.length) e.goals = 'Select at least 1 goal';
        if (!form.mentorshipTypes?.length) e.mentorshipTypes = 'Select at least 1 mentorship type';
    }
    if (step === 4) {
        if (!form.skills?.length || form.skills.length < 2) e.skills = 'Select at least 2 skills';
        if (!form.interests?.length) e.interests = 'Select at least 1 interest';
        if (!form.languages?.length) e.languages = 'Select at least 1 language';
    }
    if (step === 5) {
        if (!form.availableDays?.length) e.availableDays = 'Select at least 1 available day';
        if (!form.availableTimeSlots?.length) e.availableTimeSlots = 'Select at least 1 time slot';
    }
    return e;
};

// ── Main Component ───────────────────────────────────────────────
const MenteeOnboarding = () => {
    const navigate = useNavigate();
    const { user, updateUser, uploadAvatar } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef(null);

    const [form, setForm] = useState({
        bio: '', phone: '', gender: '', dateOfBirth: '', city: '', state: '',
        degree: '', fieldOfStudy: '', institution: '', university: '',
        boardOrBody: '', yearOfGraduation: '', currentlyStudying: true, grade: '',
        achievements: [],
        currentRole: '', currentCompany: '', targetRole: '',
        targetCompanies: [], workExperience: '0', experienceLevel: 'beginner',
        goals: [], mentorshipTypes: [], preferredCategories: [],
        skills: [], interests: [], languages: [],
        linkedinUrl: '', githubUrl: '', portfolioUrl: '',
        preferredSessionDuration: 60, sessionFrequency: 'biweekly',
        availableDays: [], availableTimeSlots: [],
        budgetMin: 0, budgetMax: 5000, preferOnlineSessions: true,
    });
    const [achievementInput, setAchievementInput] = useState('');

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setIsUploadingAvatar(true);
        try {
            await uploadAvatar(file);
            toast.success('Profile photo uploaded!');
        } catch {
            toast.error('Photo upload failed');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const nextStep = () => {
        const errs = validateStep(step, form);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setStep(s => Math.min(s + 1, TOTAL_STEPS));
    };
    const prevStep = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)); };

    const onSubmit = async () => {
        const errs = validateStep(5, form);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setIsSubmitting(true);
        try {
            const payload = {
                bio: form.bio, phone: form.phone, gender: form.gender,
                dateOfBirth: form.dateOfBirth,
                location: { city: form.city, state: form.state, country: 'India' },
                education: {
                    degree: form.degree, fieldOfStudy: form.fieldOfStudy,
                    institution: form.institution, university: form.university,
                    boardOrBody: form.boardOrBody,
                    yearOfGraduation: form.yearOfGraduation ? parseInt(form.yearOfGraduation) : undefined,
                    currentlyStudying: form.currentlyStudying, grade: form.grade,
                    achievements: form.achievements,
                },
                currentRole: form.currentRole, currentCompany: form.currentCompany,
                targetRole: form.targetRole, targetCompanies: form.targetCompanies,
                workExperience: parseFloat(form.workExperience) || 0,
                experienceLevel: form.experienceLevel,
                goals: form.goals, mentorshipTypes: form.mentorshipTypes,
                preferredCategories: form.preferredCategories,
                skills: form.skills, interests: form.interests, languages: form.languages,
                linkedinUrl: form.linkedinUrl, githubUrl: form.githubUrl, portfolioUrl: form.portfolioUrl,
                preferredSessionDuration: form.preferredSessionDuration,
                sessionFrequency: form.sessionFrequency,
                availableDays: form.availableDays, availableTimeSlots: form.availableTimeSlots,
                budgetRange: { min: form.budgetMin, max: form.budgetMax, currency: 'INR' },
                preferOnlineSessions: form.preferOnlineSessions,
                profileComplete: true, onboardingStep: 5,
            };
            const res = await api.put('/auth/updatedetails', payload);
            if (res.data.success) {
                updateUser(res.data.data);
                toast.success('Profile saved! Welcome to MentorConnect! 🎉');
                navigate('/dashboard/mentee');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const Toggle = ({ value, onChange }) => (
        <button type="button" onClick={() => onChange(!value)}
            className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${value ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-0.5'}`} />
        </button>
    );

    const canGoNext = Object.keys(validateStep(step, form)).length === 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-black uppercase tracking-widest mb-5">
                        🚀 Complete Your Profile
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Mentee Onboarding</h1>
                    <p className="text-slate-500 mt-2">Help us find you the perfect mentors</p>
                </div>

                {/* Progress bar */}
                <div className="mb-10">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute inset-y-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
                        <div className="absolute inset-y-1/2 left-0 h-0.5 bg-gradient-to-r from-emerald-600 to-teal-500 -z-10 transition-all duration-500"
                            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }} />
                        {stepInfo.map(({ icon: Icon, label }, i) => {
                            const n = i + 1;
                            const done = step > n, active = step === n;
                            return (
                                <div key={n} className="flex flex-col items-center gap-1.5">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${done ? 'bg-emerald-600 border-emerald-600 text-white' : active ? 'bg-white dark:bg-slate-900 border-emerald-600 text-emerald-600 shadow-lg shadow-emerald-500/30' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'}`}>
                                        {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                                    </div>
                                    <span className={`text-[10px] font-bold hidden sm:block ${active ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                            {/* ── STEP 1: Personal ── */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Personal Info</h2>

                                    {/* Avatar */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex-shrink-0">
                                            {avatarPreview
                                                ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">{user?.firstName?.[0] || '?'}</div>}
                                            {isUploadingAvatar && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Profile Photo</p>
                                            <p className="text-xs text-slate-400 mb-2">Optional — upload a clear face photo</p>
                                            <button type="button" onClick={() => avatarInputRef.current?.click()}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                <Camera className="w-3.5 h-3.5" /> Change Photo
                                            </button>
                                            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                        </div>
                                    </div>

                                    <Field label="Bio">
                                        <textarea className={textareaCls} rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell us about yourself..." maxLength={500} />
                                        <p className="text-xs text-slate-400 mt-1 text-right">{form.bio.length}/500</p>
                                    </Field>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field label="Phone" required error={errors.phone}>
                                            <input className={ic(!!errors.phone)} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                                        </Field>
                                        <Field label="Gender" required error={errors.gender}>
                                            <select className={sc(!!errors.gender)} value={form.gender} onChange={e => set('gender', e.target.value)}>
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="non-binary">Non-binary</option>
                                                <option value="prefer-not-to-say">Prefer not to say</option>
                                            </select>
                                        </Field>
                                        <Field label="Date of Birth" required error={errors.dateOfBirth}>
                                            <input className={ic(!!errors.dateOfBirth)} type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                                        </Field>
                                        <Field label="City" required error={errors.city}>
                                            <input className={ic(!!errors.city)} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Pune" />
                                        </Field>
                                        <Field label="State" required error={errors.state}>
                                            <select className={sc(!!errors.state)} value={form.state} onChange={e => set('state', e.target.value)}>
                                                <option value="">Select State</option>
                                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Country">
                                            <input className={ic(false)} value="India" readOnly />
                                        </Field>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 2: Education ── */}
                            {step === 2 && (
                                <div className="space-y-5">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Education</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field label="Degree" required error={errors.degree}>
                                            <select className={sc(!!errors.degree)} value={form.degree} onChange={e => set('degree', e.target.value)}>
                                                <option value="">Select degree</option>
                                                {DEGREE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Field of Study" required error={errors.fieldOfStudy}>
                                            <select className={sc(!!errors.fieldOfStudy)} value={form.fieldOfStudy} onChange={e => set('fieldOfStudy', e.target.value)}>
                                                <option value="">Select stream</option>
                                                {EDUCATION_STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Institution / College" required error={errors.institution}>
                                            <input className={ic(!!errors.institution)} value={form.institution} onChange={e => set('institution', e.target.value)} placeholder="e.g. SPPU, IIT Bombay" />
                                        </Field>
                                        <Field label="University">
                                            <input className={ic(false)} value={form.university} onChange={e => set('university', e.target.value)} placeholder="e.g. Pune University" />
                                        </Field>
                                        <Field label="Board / Governing Body">
                                            <input className={ic(false)} value={form.boardOrBody} onChange={e => set('boardOrBody', e.target.value)} placeholder="e.g. CBSE, UGC" />
                                        </Field>
                                        <Field label="Year of Graduation">
                                            <input className={ic(false)} type="number" min="1990" max="2035" value={form.yearOfGraduation} onChange={e => set('yearOfGraduation', e.target.value)} placeholder="2025" disabled={form.currentlyStudying} />
                                        </Field>
                                        <Field label="Grade / CGPA">
                                            <input className={ic(false)} value={form.grade} onChange={e => set('grade', e.target.value)} placeholder="e.g. 8.7 CGPA" />
                                        </Field>
                                        <div className="flex items-center gap-3 h-11 self-end">
                                            <Toggle value={form.currentlyStudying} onChange={v => set('currentlyStudying', v)} />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Currently Studying</span>
                                        </div>
                                    </div>
                                    <Field label="Academic Achievements (optional)">
                                        <div className="flex gap-2">
                                            <input className={ic(false)} value={achievementInput} onChange={e => setAchievementInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), (() => {
                                                    if (!achievementInput.trim()) return;
                                                    set('achievements', [...form.achievements, achievementInput.trim()]);
                                                    setAchievementInput('');
                                                })())}
                                                placeholder="e.g. University Rank 1 — press Enter to add" />
                                            <button type="button"
                                                onClick={() => { if (!achievementInput.trim()) return; set('achievements', [...form.achievements, achievementInput.trim()]); setAchievementInput(''); }}
                                                className="px-4 h-11 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors">Add</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {form.achievements.map((a, i) => (
                                                <span key={i} onClick={() => set('achievements', form.achievements.filter((_, idx) => idx !== i))}
                                                    className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold cursor-pointer hover:opacity-80">
                                                    {a} ✕
                                                </span>
                                            ))}
                                        </div>
                                    </Field>
                                </div>
                            )}

                            {/* ── STEP 3: Career & Goals ── */}
                            {step === 3 && (
                                <div className="space-y-5">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Career & Goals</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field label="Current Role" required error={errors.currentRole}>
                                            <input className={ic(!!errors.currentRole)} value={form.currentRole} onChange={e => set('currentRole', e.target.value)} placeholder="e.g. Final Year Student" />
                                        </Field>
                                        <Field label="Current Company / College">
                                            <input className={ic(false)} value={form.currentCompany} onChange={e => set('currentCompany', e.target.value)} placeholder="e.g. MIT Pune" />
                                        </Field>
                                        <Field label="Target Role">
                                            <input className={ic(false)} value={form.targetRole} onChange={e => set('targetRole', e.target.value)} placeholder="e.g. ML Engineer" />
                                        </Field>
                                        <Field label="Work Experience (years)">
                                            <input className={ic(false)} type="number" min="0" step="0.5" value={form.workExperience} onChange={e => set('workExperience', e.target.value)} placeholder="0" />
                                        </Field>
                                    </div>
                                    <Field label="Experience Level" required error={errors.experienceLevel}>
                                        <div className="flex flex-wrap gap-3">
                                            {EXPERIENCE_LEVELS.map(level => (
                                                <button type="button" key={level} onClick={() => set('experienceLevel', level)}
                                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors capitalize ${form.experienceLevel === level ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400'}`}>
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field label="Target Companies">
                                        <MultiSelect options={COMPANY_TYPES} selected={form.targetCompanies} onChange={v => set('targetCompanies', v)} placeholder="Select target company types..." />
                                    </Field>
                                    <Field label="Your Goals" required error={errors.goals}>
                                        <MultiSelect options={GOAL_OPTIONS} selected={form.goals} onChange={v => set('goals', v)} placeholder="What do you want to achieve?" hasError={!!errors.goals} />
                                    </Field>
                                    <Field label="What Kind of Help Do You Need?" required error={errors.mentorshipTypes}>
                                        <MultiSelect options={MENTORSHIP_TYPES} selected={form.mentorshipTypes} onChange={v => set('mentorshipTypes', v)} placeholder="Select mentorship types..." hasError={!!errors.mentorshipTypes} />
                                    </Field>
                                    <Field label="Preferred Mentor Categories" required error={errors.preferredCategories}>
                                        <MultiSelect options={MENTOR_CATEGORIES} selected={form.preferredCategories} onChange={v => set('preferredCategories', v)} placeholder="What fields should your mentor be in?" hasError={!!errors.preferredCategories} />
                                    </Field>
                                </div>
                            )}

                            {/* ── STEP 4: Skills & Interests ── */}
                            {step === 4 && (
                                <div className="space-y-5">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Skills & Interests</h2>
                                    <Field label="Your Current Skills" required error={errors.skills}>
                                        <MultiSelect options={SKILL_OPTIONS} selected={form.skills} onChange={v => set('skills', v)} placeholder="Select your skills..." searchable hasError={!!errors.skills} />
                                        <p className="text-xs text-slate-400 mt-1">{form.skills.length} selected (min 2 required)</p>
                                    </Field>
                                    <Field label="Areas of Interest" required error={errors.interests}>
                                        <MultiSelect options={INTEREST_OPTIONS} selected={form.interests} onChange={v => set('interests', v)} placeholder="What topics excite you?" hasError={!!errors.interests} />
                                    </Field>
                                    <Field label="Languages You Speak" required error={errors.languages}>
                                        <MultiSelect options={LANGUAGES} selected={form.languages} onChange={v => set('languages', v)} placeholder="Select languages..." hasError={!!errors.languages} />
                                    </Field>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <Field label="LinkedIn URL">
                                            <input className={ic(false)} value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="linkedin.com/in/..." />
                                        </Field>
                                        <Field label="GitHub URL">
                                            <input className={ic(false)} value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)} placeholder="github.com/..." />
                                        </Field>
                                        <Field label="Portfolio URL">
                                            <input className={ic(false)} value={form.portfolioUrl} onChange={e => set('portfolioUrl', e.target.value)} placeholder="yoursite.com" />
                                        </Field>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 5: Session Preferences ── */}
                            {step === 5 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Session Preferences</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field label="Preferred Session Duration">
                                            <select className={sc(false)} value={form.preferredSessionDuration} onChange={e => set('preferredSessionDuration', parseInt(e.target.value))}>
                                                {SESSION_DURATIONS.map(d => <option key={d} value={d}>{d} minutes</option>)}
                                            </select>
                                        </Field>
                                        <Field label="Session Frequency">
                                            <div className="grid grid-cols-2 gap-2">
                                                {SESSION_FREQUENCIES.map(freq => (
                                                    <button type="button" key={freq} onClick={() => set('sessionFrequency', freq)}
                                                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors capitalize ${form.sessionFrequency === freq ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400'}`}>
                                                        {freq}
                                                    </button>
                                                ))}
                                            </div>
                                        </Field>
                                    </div>
                                    <Field label="Available Days" required error={errors.availableDays}>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_DAYS.map(day => (
                                                <button type="button" key={day}
                                                    onClick={() => set('availableDays', form.availableDays.includes(day) ? form.availableDays.filter(d => d !== day) : [...form.availableDays, day])}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.availableDays.includes(day) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400'}`}>
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field label="Available Time Slots" required error={errors.availableTimeSlots}>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_TIMES.map(time => (
                                                <button type="button" key={time}
                                                    onClick={() => set('availableTimeSlots', form.availableTimeSlots.includes(time) ? form.availableTimeSlots.filter(t => t !== time) : [...form.availableTimeSlots, time])}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.availableTimeSlots.includes(time) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400'}`}>
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field label={`Budget Range: ₹${form.budgetMin.toLocaleString('en-IN')} – ₹${form.budgetMax.toLocaleString('en-IN')} / session`}>
                                        <div className="space-y-3">
                                            {[['budgetMin', 'Min'], ['budgetMax', 'Max']].map(([key, label]) => (
                                                <div key={key} className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-500 w-16">{label} ₹</span>
                                                    <input type="range" min="0" max="10000" step="500" value={form[key]}
                                                        onChange={e => set(key, parseInt(e.target.value))}
                                                        className="flex-1 accent-emerald-600" />
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-20 text-right">
                                                        ₹{form[key].toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </Field>
                                    <div className="flex items-center gap-3">
                                        <Toggle value={form.preferOnlineSessions} onChange={v => set('preferOnlineSessions', v)} />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Prefer Online Sessions</span>
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
                                className={`flex items-center gap-2 px-8 h-11 rounded-xl font-bold text-sm transition-all ${canGoNext ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-lg shadow-emerald-500/25' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button type="button" onClick={onSubmit} disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {isSubmitting
                                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                    : <><CheckCircle className="w-4 h-4" /> Complete Profile</>}
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-4">
                    <button onClick={() => navigate('/dashboard/mentee')} className="hover:text-slate-600 underline underline-offset-2">
                        Skip for now — complete later
                    </button>
                </p>
            </div>
        </div>
    );
};

export default MenteeOnboarding;
