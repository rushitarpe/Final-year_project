import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Camera, Save, Trash2, ShieldCheck, Briefcase } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        jobTitle: '',
        company: '',
        hourlyRate: '',
        expertise: [],
        skills: []
    });
    
    const [currentTag, setCurrentTag] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: user.bio || '',
                jobTitle: user.jobTitle || '',
                company: user.company || '',
                hourlyRate: user.hourlyRate || '',
                expertise: user.expertise || [],
                skills: user.skills || []
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddTag = (e, type) => {
        if (e.key === 'Enter' && currentTag.trim() !== '') {
            e.preventDefault();
            if (!formData[type].includes(currentTag.trim())) {
                setFormData({ ...formData, [type]: [...formData[type], currentTag.trim()] });
            }
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove, type) => {
        setFormData({ ...formData, [type]: formData[type].filter(t => t !== tagToRemove) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = { 
                ...formData,
                hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : 0 
            };
            const res = await api.put('/auth/updatedetails', payload);
            if (res.data.success) {
                const updatedUser = { ...user, ...res.data.data };
                login(localStorage.getItem('token') || '', updatedUser);
                toast.success('Profile updated!');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const uploadRes = await api.post('/upload', uploadData);
            if (uploadRes.data.success) {
                const imageUrl = uploadRes.data.data.url;
                const updateRes = await api.put('/auth/updatedetails', { profileImage: imageUrl });
                
                if (updateRes.data.success) {
                    const updatedUser = { ...user, profileImage: imageUrl };
                    login(localStorage.getItem('token') || '', updatedUser);
                    toast.success('Photo updated!');
                }
            }
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Strictly sure? This cannot be undone!')) return;
        try {
            const res = await api.delete('/auth/delete');
            if (res.data.success) {
                toast.success('Account deleted');
                logout();
                navigate('/');
            }
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Profile Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your public identity and platform preferences.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Identity Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-8 text-center border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem]">
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-800 shadow-xl flex items-center justify-center">
                                    {isUploading ? (
                                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent animate-spin rounded-full" />
                                    ) : user.profileImage ? (
                                        <img src={user.profileImage} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <User className="w-12 h-12 text-slate-300" />
                                    )}
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-[-10px] right-[-10px] w-12 h-12 bg-primary-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-all border-4 border-white dark:border-slate-900"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user.firstName} {user.lastName}</h3>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-100 dark:border-primary-800 mb-6">
                                <ShieldCheck className="w-3 h-3" />
                                {user.role}
                            </div>

                            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{user.email}</span>
                                </div>
                            </div>
                        </Card>

                        <Button 
                            variant="outline" 
                            className="w-full h-14 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold"
                            onClick={handleDeleteAccount}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Deactivate Account
                        </Button>
                    </div>

                    {/* Information Form */}
                    <div className="lg:col-span-2">
                        <Card className="p-8 md:p-10 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem]">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                                    <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                                </div>

                                {user.role === 'mentor' && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />
                                            <Input label="Company" name="company" value={formData.company} onChange={handleChange} />
                                        </div>
                                        <Input label="Hourly Rate ($)" name="hourlyRate" type="number" value={formData.hourlyRate} onChange={handleChange} />

                                        <div className="space-y-4 md:col-span-2 mt-4 text-left">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Expertise (Press Enter to add)</label>
                                            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-[2rem] min-h-[56px] border border-slate-100 dark:border-slate-800 focus-within:ring-2 focus-within:ring-primary-500/20">
                                                {formData.expertise.map((tag) => (
                                                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-sm">
                                                        {tag}
                                                        <button type="button" onClick={() => handleRemoveTag(tag, 'expertise')} className="hover:text-primary-200 transition-colors">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                                <input 
                                                    type="text" 
                                                    value={currentTag} 
                                                    onChange={(e) => setCurrentTag(e.target.value)} 
                                                    onKeyDown={(e) => handleAddTag(e, 'expertise')} 
                                                    placeholder={formData.expertise.length === 0 ? "e.g., React, Python, UI Design" : "Add more..."} 
                                                    className="flex-1 bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-0 min-w-[120px]" 
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {user.role === 'mentee' && (
                                    <div className="space-y-4 md:col-span-2 mt-4 text-left">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Skills (Press Enter to add)</label>
                                        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-[2rem] min-h-[56px] border border-slate-100 dark:border-slate-800 focus-within:ring-2 focus-within:ring-primary-500/20">
                                            {formData.skills.map((tag) => (
                                                <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-sm">
                                                    {tag}
                                                    <button type="button" onClick={() => handleRemoveTag(tag, 'skills')} className="hover:text-violet-200 transition-colors">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            <input 
                                                type="text" 
                                                value={currentTag} 
                                                onChange={(e) => setCurrentTag(e.target.value)} 
                                                onKeyDown={(e) => handleAddTag(e, 'skills')} 
                                                placeholder={formData.skills.length === 0 ? "e.g., JavaScript, Marketing, CSS" : "Add more..."} 
                                                className="flex-1 bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-0 min-w-[120px]" 
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bio & Experience</label>
                                    <textarea 
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-primary-500/20 transition-all min-h-[160px]"
                                        placeholder="Share your journey..."
                                    />
                                </div>

                                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <Button type="submit" disabled={isSaving} className="w-full md:w-auto px-10 h-14 rounded-2xl shadow-xl shadow-primary-500/20 transition-transform active:scale-95">
                                        {isSaving ? 'Updating...' : 'Save Configuration'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
