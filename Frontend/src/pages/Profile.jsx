import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import AvatarUpload from '../components/ui/AvatarUpload';
import {
    Mail, Save, Trash2, ShieldCheck, MapPin, Phone,
    Github, Linkedin, Globe, FileText, ExternalLink, User,
    Briefcase, GraduationCap, Code2, Target, Calendar, IndianRupee,
    Upload, Video, FilePlus2, X, Plus, Loader2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    SKILL_OPTIONS, LANGUAGES, MENTOR_CATEGORIES, INDIAN_STATES,
    EXPERIENCE_LEVELS, MENTORSHIP_TYPES, GOAL_OPTIONS, INTEREST_OPTIONS,
    SESSION_DURATIONS, SESSION_FREQUENCIES, AVAILABLE_DAYS, AVAILABLE_TIMES,
    DEGREE_TYPES, EDUCATION_STREAMS
} from '../utils/constants';

// ── Shared style strings ─────────────────────────────────────────
const inp = 'w-full h-10 rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600';
const sel = `${inp} cursor-pointer select-dark`;
const ta  = 'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-600';

// ── UI atoms ─────────────────────────────────────────────────────
const Label = ({ children, required }) => (
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/8">
        <Icon className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">{title}</h3>
    </div>
);

const TagPill = ({ value, onRemove, color = 'violet' }) => {
    const colors = {
        violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
        emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        blue:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
        amber:  'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${colors[color] || colors.violet}`}>
            {value}
            {onRemove && (
                <button type="button" onClick={onRemove} className="ml-0.5 hover:opacity-70 transition-opacity">✕</button>
            )}
        </span>
    );
};

const MultiTagSelect = ({ options, selected = [], onChange, placeholder, color }) => (
    <div>
        <select
            className={sel}
            value=""
            onChange={e => { if (e.target.value && !selected.includes(e.target.value)) onChange([...selected, e.target.value]); }}
        >
            <option value="">{placeholder || 'Select...'}</option>
            {options.filter(o => !selected.includes(o)).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
                {selected.map(v => <TagPill key={v} value={v} color={color} onRemove={() => onChange(selected.filter(s => s !== v))} />)}
            </div>
        )}
    </div>
);

const Toggle = ({ value, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full flex-shrink-0 transition-colors relative ${value ? 'bg-violet-600' : 'bg-slate-700'}`}
    >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} />
    </button>
);

// ── Empty education entry (for mentor array) ─────────────────────
const emptyEdu = () => ({
    degree: '', fieldOfStudy: '', institution: '', university: '',
    grade: '', startYear: '', endYear: '', currentlyEnrolled: false,
    country: 'India', isHighestDegree: false,
});

// ── Main Component ───────────────────────────────────────────────
const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate   = useNavigate();
    const resumeRef  = useRef(null);
    const videoRef   = useRef(null);

    const [isSaving, setIsSaving]     = useState(false);
    const [activeTab, setActiveTab]   = useState('personal');

    // Mentor education array (separate from flat form)
    const [mentorEdu, setMentorEdu] = useState([emptyEdu()]);
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo]   = useState(false);
    const [resumeFileName, setResumeFileName] = useState('');
    const [videoFileName, setVideoFileName]   = useState('');

    // ── Form state ───────────────────────────────────────────────
    const [form, setForm] = useState({
        // Personal
        firstName: '', lastName: '', bio: '', phone: '', gender: '',
        dateOfBirth: '', city: '', state: '',
        linkedinUrl: '', githubUrl: '', portfolioUrl: '',
        languages: [],
        // Education (mentee — single object)
        degree: '', fieldOfStudy: '', institution: '', university: '',
        grade: '', currentlyStudying: true,
        // Career (mentee + mentor shared)
        currentRole: '', currentCompany: '', targetRole: '',
        workExperience: '0', experienceLevel: 'intermediate',
        // Goals & interests (mentee)
        goals: [], mentorshipTypes: [], preferredCategories: [],
        skills: [], interests: [],
        // Mentee session prefs
        preferredSessionDuration: 60, sessionFrequency: 'biweekly',
        availableDays: [], availableTimeSlots: [],
        budgetMin: 0, budgetMax: 5000, preferOnlineSessions: true,
        // Mentor-specific
        jobTitle: '', company: '', sessionPrice: '',
        mentorSkills: [], mentorCategory: '', mentorSubCategories: [],
        // Mentor availability
        mentorAvailableDays: [], mentorAvailableTimeSlots: [], mentorSessionDuration: 60,
    });

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    // ── Populate from user ───────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        setForm(f => ({
            ...f,
            firstName:    user.firstName || '',
            lastName:     user.lastName  || '',
            bio:          user.bio       || '',
            phone:        user.phone     || '',
            gender:       user.gender    || '',
            dateOfBirth:  user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
            city:         user.location?.city  || '',
            state:        user.location?.state || '',
            linkedinUrl:  user.linkedinUrl  || '',
            githubUrl:    user.githubUrl    || '',
            portfolioUrl: user.portfolioUrl || '',
            languages:    user.languages || [],

            // Mentee fields
            degree:              user.education?.degree       || '',
            fieldOfStudy:        user.education?.fieldOfStudy || '',
            institution:         user.education?.institution  || '',
            university:          user.education?.university   || '',
            grade:               user.education?.grade        || '',
            currentlyStudying:   user.education?.currentlyStudying ?? true,
            currentRole:         user.currentRole    || '',
            currentCompany:      user.currentCompany || '',
            targetRole:          user.targetRole     || '',
            workExperience:      user.workExperience?.toString() || '0',
            experienceLevel:     user.experienceLevel || 'beginner',
            goals:               user.goals             || [],
            mentorshipTypes:     user.mentorshipTypes    || [],
            preferredCategories: user.preferredCategories || [],
            skills:              user.skills    || [],
            interests:           user.interests || [],
            preferredSessionDuration: user.preferredSessionDuration || 60,
            sessionFrequency:         user.sessionFrequency || 'biweekly',
            availableDays:       user.availableDays      || [],
            availableTimeSlots:  user.availableTimeSlots || [],
            budgetMin:           user.budgetRange?.min || 0,
            budgetMax:           user.budgetRange?.max || 5000,
            preferOnlineSessions: user.preferOnlineSessions ?? true,

            // Mentor fields
            jobTitle:          user.jobTitle    || '',
            company:           user.company     || '',
            sessionPrice:      user.sessionPrice?.toString() || user.hourlyRate?.toString() || '',
            mentorSkills:      user.skills      || user.expertise || [],
            mentorCategory:    (Array.isArray(user.categories) ? user.categories[0] : user.category) || '',
            mentorSubCategories: user.subCategories || [],
            mentorAvailableDays:     user.availableDays  || user.availability?.days       || [],
            mentorAvailableTimeSlots: user.availableTimeSlots || user.availability?.timeSlots || [],
            mentorSessionDuration:   user.availability?.sessionDuration || 60,
        }));

        // Populate mentor education array
        if (user.role === 'mentor') {
            if (Array.isArray(user.education) && user.education.length > 0) {
                setMentorEdu(user.education);
            } else {
                setMentorEdu([emptyEdu()]);
            }
        }

        // Set existing media filenames
        if (user.resumeUrl || user.resume) setResumeFileName('(existing resume)');
        if (user.introVideoUrl || user.introVideo) setVideoFileName('(existing video)');
    }, [user]);

    // ── Mentor education helpers ─────────────────────────────────
    const setEduField = (idx, key, val) => {
        setMentorEdu(prev => prev.map((e, i) => i === idx ? { ...e, [key]: val } : e));
    };
    const addEdu    = () => setMentorEdu(prev => [...prev, emptyEdu()]);
    const removeEdu = (idx) => setMentorEdu(prev => prev.filter((_, i) => i !== idx));

    // ── Resume upload ────────────────────────────────────────────
    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingResume(true);
        setResumeFileName(file.name);
        try {
            const fd = new FormData();
            fd.append('resume', file);
            const res = await api.post('/upload/resume', fd);
            if (res.data.success) {
                updateUser({ resumeUrl: res.data.data.url, resume: res.data.data.url });
                toast.success('Resume uploaded!');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Resume upload failed');
            setResumeFileName('');
        } finally {
            setIsUploadingResume(false);
            if (resumeRef.current) resumeRef.current.value = '';
        }
    };

    // ── Video upload ─────────────────────────────────────────────
    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingVideo(true);
        setVideoFileName(file.name);
        try {
            const fd = new FormData();
            fd.append('video', file);
            const res = await api.post('/upload/video', fd);
            if (res.data.success) {
                updateUser({ introVideoUrl: res.data.data.url, introVideo: res.data.data.url });
                toast.success('Intro video uploaded!');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Video upload failed');
            setVideoFileName('');
        } finally {
            setIsUploadingVideo(false);
            if (videoRef.current) videoRef.current.value = '';
        }
    };

    // ── Save handler ─────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                firstName: form.firstName,
                lastName:  form.lastName,
                bio:       form.bio,
                phone:     form.phone,
                gender:    form.gender,
                dateOfBirth: form.dateOfBirth || undefined,
                location: { city: form.city, state: form.state, country: 'India' },
                linkedinUrl:  form.linkedinUrl,
                githubUrl:    form.githubUrl,
                portfolioUrl: form.portfolioUrl,
                languages: form.languages,

                // Mentee-specific payload
                ...(user?.role === 'mentee' && {
                    education: {
                        degree: form.degree, fieldOfStudy: form.fieldOfStudy,
                        institution: form.institution, university: form.university,
                        grade: form.grade, currentlyStudying: form.currentlyStudying,
                    },
                    currentRole:    form.currentRole,
                    currentCompany: form.currentCompany,
                    targetRole:     form.targetRole,
                    workExperience: parseFloat(form.workExperience) || 0,
                    experienceLevel: form.experienceLevel,
                    goals:              form.goals,
                    mentorshipTypes:    form.mentorshipTypes,
                    preferredCategories: form.preferredCategories,
                    skills:    form.skills,
                    interests: form.interests,
                    preferredSessionDuration: form.preferredSessionDuration,
                    sessionFrequency: form.sessionFrequency,
                    availableDays:      form.availableDays,
                    availableTimeSlots: form.availableTimeSlots,
                    budgetRange: { min: form.budgetMin, max: form.budgetMax, currency: 'INR' },
                    preferOnlineSessions: form.preferOnlineSessions,
                }),

                // Mentor-specific payload (corrected field names matching Mentor.js)
                ...(user?.role === 'mentor' && {
                    jobTitle:         form.jobTitle,
                    company:          form.company,
                    currentRole:      form.currentRole,
                    workExperience:   parseFloat(form.workExperience) || 0,
                    experienceLevel:  form.experienceLevel,
                    sessionPrice:     form.sessionPrice ? Number(form.sessionPrice) : undefined,
                    hourlyRate:       form.sessionPrice ? Number(form.sessionPrice) : undefined,
                    skills:           form.mentorSkills,          // ✅ correct field name
                    category:         form.mentorCategory,        // ✅ correct field name
                    subCategories:    form.mentorSubCategories,   // ✅ correct field name
                    availableDays:    form.mentorAvailableDays,   // ✅ top-level, not nested
                    availableTimeSlots: form.mentorAvailableTimeSlots, // ✅ top-level
                    education:        mentorEdu,                  // ✅ array for mentor
                }),
            };

            const res = await api.put('/auth/updatedetails', payload);
            if (res.data.success) {
                updateUser(res.data.data);
                toast.success('Profile updated successfully!');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure? This action cannot be undone!')) return;
        try {
            await api.delete('/auth/delete');
            toast.success('Account deleted');
            logout();
            navigate('/');
        } catch {
            toast.error('Deletion failed');
        }
    };

    if (!user) return null;

    const resumeUrl = user.resumeUrl || user.resume;
    const videoUrl  = user.introVideoUrl || user.introVideo;
    const isMentor  = user.role === 'mentor';
    const isMentee  = user.role === 'mentee';
    const initials  = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

    const tabs = [
        { id: 'personal', label: 'Personal', icon: User },
        ...(isMentee ? [
            { id: 'education',   label: 'Education',    icon: GraduationCap },
            { id: 'career',      label: 'Career & Goals', icon: Target },
            { id: 'skills',      label: 'Skills',       icon: Code2 },
            { id: 'preferences', label: 'Preferences',  icon: Calendar },
        ] : []),
        ...(isMentor ? [
            { id: 'education',     label: 'Education',   icon: GraduationCap },
            { id: 'professional',  label: 'Professional', icon: Briefcase },
            { id: 'skills',        label: 'Expertise',   icon: Code2 },
            { id: 'availability',  label: 'Availability', icon: Calendar },
        ] : []),
        { id: 'media', label: 'Media', icon: Upload },
    ];

    return (
        <div className="text-white min-h-full">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-black text-white mb-1">Profile Settings</h1>
                <p className="text-slate-500 text-sm mb-8">Manage your public profile and account preferences.</p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── Left Column ── */}
                        <div className="space-y-4">
                            {/* Avatar card */}
                            <div className="bg-[#0d1117] border border-white/8 rounded-2xl p-6 text-center">
                                <div className="flex justify-center mb-4">
                                    <AvatarUpload size="xl" />
                                </div>
                                <h3 className="text-lg font-bold text-white">{user.firstName} {user.lastName}</h3>
                                <p className="text-slate-500 text-xs mt-1">{user.email}</p>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isMentor ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : isMentee ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                                        <ShieldCheck className="w-3 h-3" />{user.role}
                                    </span>
                                </div>

                                {/* Resume link */}
                                {resumeUrl && (
                                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                                        className="mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors">
                                        <FileText className="w-4 h-4 text-violet-400" />
                                        View Resume
                                        <ExternalLink className="w-3 h-3 opacity-50" />
                                    </a>
                                )}

                                {/* Social links */}
                                <div className="mt-4 space-y-2">
                                    {user.linkedinUrl && (
                                        <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                            <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                                        </a>
                                    )}
                                    {user.githubUrl && (
                                        <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                                            <Github className="w-3.5 h-3.5" /> GitHub
                                        </a>
                                    )}
                                    {user.portfolioUrl && (
                                        <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                            <Globe className="w-3.5 h-3.5" /> Portfolio
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Save + Delete */}
                            <button type="submit" disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-violet-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {isSaving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
                            </button>

                            <button type="button" onClick={handleDeleteAccount}
                                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-4 h-4" /> Deactivate Account
                            </button>
                        </div>

                        {/* ── Right Column: Tabs ── */}
                        <div className="lg:col-span-2 bg-[#0d1117] border border-white/8 rounded-2xl overflow-hidden">
                            {/* Tab bar */}
                            <div className="flex overflow-x-auto border-b border-white/8 px-2 pt-2 gap-1 scrollbar-hide">
                                {tabs.map(tab => (
                                    <button key={tab.id} type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-lg text-xs font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-white/8 text-white border-b-2 border-violet-500' : 'text-slate-500 hover:text-slate-300'}`}>
                                        <tab.icon className="w-3.5 h-3.5" />{tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 space-y-5">

                                {/* ── Personal ── */}
                                {activeTab === 'personal' && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label required>First Name</Label>
                                                <input className={inp} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="First name" />
                                            </div>
                                            <div>
                                                <Label required>Last Name</Label>
                                                <input className={inp} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Last name" />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Email</Label>
                                            <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl border border-white/8 bg-white/3 text-slate-500 text-sm">
                                                <Mail className="w-4 h-4 text-slate-600" />{user.email}
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Bio</Label>
                                            <textarea className={ta} rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Share your journey..." maxLength={500} />
                                            <p className="text-xs text-slate-600 text-right mt-1">{form.bio.length}/500</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Phone</Label>
                                                <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                                            </div>
                                            <div>
                                                <Label>Gender</Label>
                                                <select className={sel} value={form.gender} onChange={e => set('gender', e.target.value)}>
                                                    <option value="">Select</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="non-binary">Non-binary</option>
                                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                                </select>
                                            </div>
                                            <div>
                                                <Label>Date of Birth</Label>
                                                <input className={inp} type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>City</Label>
                                                <input className={inp} value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Pune" />
                                            </div>
                                            <div>
                                                <Label>State</Label>
                                                <select className={sel} value={form.state} onChange={e => set('state', e.target.value)}>
                                                    <option value="">Select State</option>
                                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <Label>Country</Label>
                                                <input className={inp} value="India" readOnly />
                                            </div>
                                        </div>

                                        <div className="border-t border-white/8 pt-5">
                                            <Label>Social Links</Label>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Linkedin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    <input className={inp} value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="linkedin.com/in/yourprofile" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Github className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                    <input className={inp} value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)} placeholder="github.com/yourusername" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-violet-400 flex-shrink-0" />
                                                    <input className={inp} value={form.portfolioUrl} onChange={e => set('portfolioUrl', e.target.value)} placeholder="yourportfolio.com" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Languages</Label>
                                            <MultiTagSelect options={LANGUAGES} selected={form.languages} onChange={v => set('languages', v)} placeholder="Add a language..." color="blue" />
                                        </div>
                                    </div>
                                )}

                                {/* ── Education (Mentee — single object) ── */}
                                {activeTab === 'education' && isMentee && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Degree</Label>
                                                <select className={sel} value={form.degree} onChange={e => set('degree', e.target.value)}>
                                                    <option value="">Select degree</option>
                                                    {DEGREE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <Label>Field of Study</Label>
                                                <select className={sel} value={form.fieldOfStudy} onChange={e => set('fieldOfStudy', e.target.value)}>
                                                    <option value="">Select stream</option>
                                                    {EDUCATION_STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <Label>Institution / College</Label>
                                                <input className={inp} value={form.institution} onChange={e => set('institution', e.target.value)} placeholder="e.g. IIT Bombay" />
                                            </div>
                                            <div>
                                                <Label>University</Label>
                                                <input className={inp} value={form.university} onChange={e => set('university', e.target.value)} placeholder="e.g. Mumbai University" />
                                            </div>
                                            <div>
                                                <Label>Grade / CGPA</Label>
                                                <input className={inp} value={form.grade} onChange={e => set('grade', e.target.value)} placeholder="e.g. 8.7 CGPA" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Toggle value={form.currentlyStudying} onChange={v => set('currentlyStudying', v)} />
                                            <span className="text-sm text-slate-400">Currently Studying</span>
                                        </div>
                                    </div>
                                )}

                                {/* ── Education (Mentor — array with add/remove) ── */}
                                {activeTab === 'education' && isMentor && (
                                    <div className="space-y-6">
                                        <p className="text-xs text-slate-500">Add all your academic qualifications. Your highest degree appears on your public profile.</p>
                                        {mentorEdu.map((edu, idx) => (
                                            <div key={idx} className="relative bg-white/3 border border-white/8 rounded-xl p-5 space-y-4">
                                                {/* Entry header */}
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                        Degree #{idx + 1}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={edu.isHighestDegree}
                                                                onChange={e => setEduField(idx, 'isHighestDegree', e.target.checked)}
                                                                className="accent-violet-500"
                                                            />
                                                            Highest Degree
                                                        </label>
                                                        {mentorEdu.length > 1 && (
                                                            <button type="button" onClick={() => removeEdu(idx)}
                                                                className="p-1 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Degree</Label>
                                                        <select className={sel} value={edu.degree} onChange={e => setEduField(idx, 'degree', e.target.value)}>
                                                            <option value="">Select degree</option>
                                                            {DEGREE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <Label>Field of Study</Label>
                                                        <select className={sel} value={edu.fieldOfStudy} onChange={e => setEduField(idx, 'fieldOfStudy', e.target.value)}>
                                                            <option value="">Select stream</option>
                                                            {EDUCATION_STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <Label>Institution / College</Label>
                                                        <input className={inp} value={edu.institution} onChange={e => setEduField(idx, 'institution', e.target.value)} placeholder="e.g. IIT Bombay" />
                                                    </div>
                                                    <div>
                                                        <Label>University</Label>
                                                        <input className={inp} value={edu.university} onChange={e => setEduField(idx, 'university', e.target.value)} placeholder="e.g. Mumbai University" />
                                                    </div>
                                                    <div>
                                                        <Label>Start Year</Label>
                                                        <input className={inp} type="number" min="1980" max="2030" value={edu.startYear} onChange={e => setEduField(idx, 'startYear', e.target.value)} placeholder="e.g. 2018" />
                                                    </div>
                                                    <div>
                                                        <Label>End Year</Label>
                                                        <input className={inp} type="number" min="1980" max="2030" value={edu.endYear} onChange={e => setEduField(idx, 'endYear', e.target.value)} placeholder="e.g. 2022" disabled={edu.currentlyEnrolled} />
                                                    </div>
                                                    <div>
                                                        <Label>Grade / CGPA</Label>
                                                        <input className={inp} value={edu.grade} onChange={e => setEduField(idx, 'grade', e.target.value)} placeholder="e.g. 8.5 CGPA" />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <div className="flex items-center gap-3 h-10">
                                                            <Toggle value={edu.currentlyEnrolled} onChange={v => setEduField(idx, 'currentlyEnrolled', v)} />
                                                            <span className="text-sm text-slate-400">Currently Enrolled</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button type="button" onClick={addEdu}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 text-sm text-slate-400 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/5 transition-all w-full justify-center">
                                            <Plus className="w-4 h-4" />
                                            Add Another Degree
                                        </button>
                                    </div>
                                )}

                                {/* ── Career & Goals (Mentee) ── */}
                                {activeTab === 'career' && isMentee && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Current Role</Label>
                                                <input className={inp} value={form.currentRole} onChange={e => set('currentRole', e.target.value)} placeholder="e.g. Final Year Student" />
                                            </div>
                                            <div>
                                                <Label>Current Company / College</Label>
                                                <input className={inp} value={form.currentCompany} onChange={e => set('currentCompany', e.target.value)} placeholder="e.g. MIT Pune" />
                                            </div>
                                            <div>
                                                <Label>Target Role</Label>
                                                <input className={inp} value={form.targetRole} onChange={e => set('targetRole', e.target.value)} placeholder="e.g. ML Engineer" />
                                            </div>
                                            <div>
                                                <Label>Work Experience (years)</Label>
                                                <input className={inp} type="number" min="0" step="0.5" value={form.workExperience} onChange={e => set('workExperience', e.target.value)} />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Experience Level</Label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {EXPERIENCE_LEVELS.map(l => (
                                                    <button key={l} type="button" onClick={() => set('experienceLevel', l)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors capitalize ${form.experienceLevel === l ? 'bg-violet-600 text-white border-violet-600' : 'border-white/10 text-slate-400 hover:border-violet-400'}`}>
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Your Goals</Label>
                                            <MultiTagSelect options={GOAL_OPTIONS} selected={form.goals} onChange={v => set('goals', v)} placeholder="Add a goal..." color="violet" />
                                        </div>
                                        <div>
                                            <Label>Mentorship Types Needed</Label>
                                            <MultiTagSelect options={MENTORSHIP_TYPES} selected={form.mentorshipTypes} onChange={v => set('mentorshipTypes', v)} placeholder="Select mentorship type..." color="emerald" />
                                        </div>
                                        <div>
                                            <Label>Preferred Mentor Categories</Label>
                                            <MultiTagSelect options={MENTOR_CATEGORIES} selected={form.preferredCategories} onChange={v => set('preferredCategories', v)} placeholder="Select category..." color="amber" />
                                        </div>
                                    </div>
                                )}

                                {/* ── Skills (Mentee) ── */}
                                {activeTab === 'skills' && isMentee && (
                                    <div className="space-y-5">
                                        <div>
                                            <Label>Your Skills</Label>
                                            <MultiTagSelect options={SKILL_OPTIONS} selected={form.skills} onChange={v => set('skills', v)} placeholder="Add a skill..." color="violet" />
                                        </div>
                                        <div>
                                            <Label>Areas of Interest</Label>
                                            <MultiTagSelect options={INTEREST_OPTIONS} selected={form.interests} onChange={v => set('interests', v)} placeholder="Add an interest..." color="blue" />
                                        </div>
                                    </div>
                                )}

                                {/* ── Preferences (Mentee) ── */}
                                {activeTab === 'preferences' && isMentee && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Preferred Duration</Label>
                                                <select className={sel} value={form.preferredSessionDuration} onChange={e => set('preferredSessionDuration', parseInt(e.target.value))}>
                                                    {SESSION_DURATIONS.map(d => <option key={d} value={d}>{d} minutes</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <Label>Session Frequency</Label>
                                                <select className={sel} value={form.sessionFrequency} onChange={e => set('sessionFrequency', e.target.value)}>
                                                    {SESSION_FREQUENCIES.map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Available Days</Label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {AVAILABLE_DAYS.map(d => (
                                                    <button key={d} type="button"
                                                        onClick={() => set('availableDays', form.availableDays.includes(d) ? form.availableDays.filter(x => x !== d) : [...form.availableDays, d])}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${form.availableDays.includes(d) ? 'bg-violet-600 text-white border-violet-600' : 'border-white/10 text-slate-400 hover:border-violet-400'}`}>
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Available Time Slots</Label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {AVAILABLE_TIMES.map(t => (
                                                    <button key={t} type="button"
                                                        onClick={() => set('availableTimeSlots', form.availableTimeSlots.includes(t) ? form.availableTimeSlots.filter(x => x !== t) : [...form.availableTimeSlots, t])}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${form.availableTimeSlots.includes(t) ? 'bg-violet-600 text-white border-violet-600' : 'border-white/10 text-slate-400 hover:border-violet-400'}`}>
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Budget Range: ₹{form.budgetMin.toLocaleString('en-IN')} – ₹{form.budgetMax.toLocaleString('en-IN')} / session</Label>
                                            <div className="space-y-3 mt-2">
                                                {[['budgetMin', 'Min'], ['budgetMax', 'Max']].map(([key, label]) => (
                                                    <div key={key} className="flex items-center gap-3">
                                                        <span className="text-xs text-slate-500 w-14">{label} ₹</span>
                                                        <input type="range" min="0" max="10000" step="500" value={form[key]}
                                                            onChange={e => set(key, parseInt(e.target.value))}
                                                            className="flex-1 accent-violet-600" />
                                                        <span className="text-sm font-bold text-slate-300 w-20 text-right">₹{form[key].toLocaleString('en-IN')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Toggle value={form.preferOnlineSessions} onChange={v => set('preferOnlineSessions', v)} />
                                            <span className="text-sm text-slate-400">Prefer Online Sessions</span>
                                        </div>
                                    </div>
                                )}

                                {/* ── Professional (Mentor) ── */}
                                {activeTab === 'professional' && isMentor && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Job Title</Label>
                                                <input className={inp} value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder="e.g. Senior Engineer" />
                                            </div>
                                            <div>
                                                <Label>Company</Label>
                                                <input className={inp} value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Google" />
                                            </div>
                                            <div>
                                                <Label>Current Role</Label>
                                                <input className={inp} value={form.currentRole} onChange={e => set('currentRole', e.target.value)} placeholder="e.g. Lead Developer" />
                                            </div>
                                            <div>
                                                <Label>Years of Experience</Label>
                                                <input className={inp} type="number" min="0" step="0.5" value={form.workExperience} onChange={e => set('workExperience', e.target.value)} />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Session Price (₹ / session)</Label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input className={`${inp} pl-9`} type="number" min="0" value={form.sessionPrice} onChange={e => set('sessionPrice', e.target.value)} placeholder="e.g. 1500" />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Experience Level</Label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {EXPERIENCE_LEVELS.map(l => (
                                                    <button key={l} type="button" onClick={() => set('experienceLevel', l)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors capitalize ${form.experienceLevel === l ? 'bg-violet-600 text-white border-violet-600' : 'border-white/10 text-slate-400 hover:border-violet-400'}`}>
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Primary Category</Label>
                                            <select className={sel} value={form.mentorCategory} onChange={e => set('mentorCategory', e.target.value)}>
                                                <option value="">Select a category</option>
                                                {MENTOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <Label>Sub-Categories</Label>
                                            <MultiTagSelect options={MENTOR_CATEGORIES.filter(c => c !== form.mentorCategory)} selected={form.mentorSubCategories} onChange={v => set('mentorSubCategories', v)} placeholder="Select sub-categories..." color="emerald" />
                                        </div>
                                    </div>
                                )}

                                {/* ── Expertise / Skills (Mentor) ── */}
                                {activeTab === 'skills' && isMentor && (
                                    <div className="space-y-5">
                                        <div>
                                            <Label>Skills & Expertise</Label>
                                            <MultiTagSelect options={SKILL_OPTIONS} selected={form.mentorSkills} onChange={v => set('mentorSkills', v)} placeholder="Add a skill..." color="violet" />
                                        </div>
                                    </div>
                                )}

                                {/* ── Availability (Mentor) ── */}
                                {activeTab === 'availability' && isMentor && (
                                    <div className="space-y-5">
                                        <div>
                                            <Label>Preferred Session Duration</Label>
                                            <select className={sel} value={form.mentorSessionDuration} onChange={e => set('mentorSessionDuration', parseInt(e.target.value))}>
                                                {SESSION_DURATIONS.map(d => <option key={d} value={d}>{d} minutes</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <Label>Available Days</Label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {AVAILABLE_DAYS.map(d => (
                                                    <button key={d} type="button"
                                                        onClick={() => set('mentorAvailableDays', form.mentorAvailableDays.includes(d) ? form.mentorAvailableDays.filter(x => x !== d) : [...form.mentorAvailableDays, d])}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${form.mentorAvailableDays.includes(d) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-white/10 text-slate-400 hover:border-emerald-400'}`}>
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Available Time Slots</Label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {AVAILABLE_TIMES.map(t => (
                                                    <button key={t} type="button"
                                                        onClick={() => set('mentorAvailableTimeSlots', form.mentorAvailableTimeSlots.includes(t) ? form.mentorAvailableTimeSlots.filter(x => x !== t) : [...form.mentorAvailableTimeSlots, t])}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${form.mentorAvailableTimeSlots.includes(t) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-white/10 text-slate-400 hover:border-emerald-400'}`}>
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Media Tab (Resume + Intro Video) ── */}
                                {activeTab === 'media' && (
                                    <div className="space-y-6">
                                        {/* Resume section — all roles */}
                                        <div>
                                            <SectionTitle icon={FileText} title="Resume / CV" />
                                            {resumeUrl && (
                                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/8 transition-colors mb-3 w-fit">
                                                    <FileText className="w-4 h-4 text-violet-400" />
                                                    View Current Resume
                                                    <ExternalLink className="w-3 h-3 opacity-50" />
                                                </a>
                                            )}

                                            {/* Upload zone */}
                                            <div
                                                className="relative border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-violet-500/50 hover:bg-violet-500/3 transition-all cursor-pointer group"
                                                onClick={() => resumeRef.current?.click()}
                                            >
                                                <input
                                                    ref={resumeRef}
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    className="hidden"
                                                    onChange={handleResumeUpload}
                                                />
                                                {isUploadingResume ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                                                        <p className="text-sm text-slate-400">Uploading {resumeFileName}...</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                                                            <FilePlus2 className="w-6 h-6 text-violet-400" />
                                                        </div>
                                                        <p className="text-sm font-semibold text-white">
                                                            {resumeFileName && resumeFileName !== '(existing resume)' ? resumeFileName : 'Click to upload resume'}
                                                        </p>
                                                        <p className="text-xs text-slate-500">PDF or Word document — max 5MB</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Intro Video — mentor only */}
                                        {isMentor && (
                                            <div>
                                                <SectionTitle icon={Video} title="Intro Video" />
                                                <p className="text-xs text-slate-500 mb-4">A short 1–2 minute video introduction helps mentees trust you faster.</p>

                                                {videoUrl && (
                                                    <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
                                                        <video src={videoUrl} controls className="w-full max-h-48 bg-black" />
                                                    </div>
                                                )}

                                                <div
                                                    className="relative border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-emerald-500/50 hover:bg-emerald-500/3 transition-all cursor-pointer group"
                                                    onClick={() => videoRef.current?.click()}
                                                >
                                                    <input
                                                        ref={videoRef}
                                                        type="file"
                                                        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                                                        className="hidden"
                                                        onChange={handleVideoUpload}
                                                    />
                                                    {isUploadingVideo ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                                            <p className="text-sm text-slate-400">Uploading {videoFileName}...</p>
                                                            <p className="text-xs text-slate-600">Videos may take a moment...</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                                                <Video className="w-6 h-6 text-emerald-400" />
                                                            </div>
                                                            <p className="text-sm font-semibold text-white">
                                                                {videoFileName && videoFileName !== '(existing video)' ? videoFileName : 'Click to upload intro video'}
                                                            </p>
                                                            <p className="text-xs text-slate-500">MP4, MOV, AVI or WebM — max 100MB</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
