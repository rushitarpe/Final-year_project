import { useState, useEffect, useRef } from 'react';

import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Camera, Save, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, login, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        jobTitle: '',
        company: '',
        hourlyRate: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: (user as any).bio || '',
                jobTitle: (user as any).jobTitle || '',
                company: (user as any).company || '',
                hourlyRate: (user as any).hourlyRate || ''
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = { ...formData };
            if (payload.hourlyRate === '') {
                (payload as any).hourlyRate = 0;
            } else {
                (payload as any).hourlyRate = Number(payload.hourlyRate);
            }

            const res = await api.put('/auth/updatedetails', payload);
            if (res.data.success && user) {
                const updatedUser = { ...user, ...res.data.data };
                login(localStorage.getItem('token') || '', updatedUser);
                toast.success('Profile updated successfully!');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'mentor_connect/profiles');

        try {
            const uploadRes = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data.success) {
                const imageUrl = uploadRes.data.data.url;

                const updateRes = await api.put('/auth/updatedetails', { profileImage: imageUrl });

                if (updateRes.data.success && user) {
                    const updatedUser = { ...user, ...updateRes.data.data };
                    login(localStorage.getItem('token') || '', updatedUser);
                    toast.success('Profile photo updated!');
                }
            }
        } catch (error: any) {
            toast.error('Failed to upload image.');
            console.error(error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you strictly sure you want to completely delete your account? This action cannot be undone!')) {
            return;
        }

        try {
            const res = await api.delete('/auth/delete');
            if (res.data.success) {
                toast.success('Your account has been deleted.');
                logout();
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete account.');
        }
    };

    if (!user) {
        return <div className="p-8 text-center text-slate-500">Please log in to view this page.</div>;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Profile Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Update your personal information and preferences.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Avatar */}
                    <div className="col-span-1">
                        <Card glass className="p-6 flex flex-col justify-center items-center text-center">
                            <div className="relative group w-32 h-32 mb-4">
                                <div className="w-full h-full rounded-full overflow-hidden bg-primary-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center font-bold text-primary-500">
                                    {isUploading ? (
                                        <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
                                    ) : user.profileImage ? (
                                        <img src={user.profileImage} alt={user.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} />
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-slate-900 shadow-lg hover:bg-primary-600 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <Camera size={18} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{user.firstName} {user.lastName}</h3>
                            <p className="text-sm font-medium text-primary-500 capitalize mb-1">{user.role}</p>

                            {user.role === 'mentor' && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                                    {(user as any).jobTitle || 'No Title'} @ {(user as any).company || 'No Company'}
                                </p>
                            )}

                            <div className="mt-6 w-full flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <Mail size={16} className="text-slate-400 shrink-0" />
                                <span className="truncate font-medium">{user.email}</span>
                            </div>
                        </Card>
                    </div>

                    {/* Main Form */}
                    <div className="col-span-1 md:col-span-2">
                        <Card glass className="p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Input
                                            label="First Name"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            label="Last Name"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {user.role === 'mentor' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Input
                                                label="Job Title"
                                                name="jobTitle"
                                                value={formData.jobTitle}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Input
                                                label="Company"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2 md:w-1/2">
                                            <Input
                                                label="Hourly Fee ($)"
                                                type="number"
                                                name="hourlyRate"
                                                value={formData.hourlyRate}
                                                onChange={handleChange}
                                                placeholder="e.g. 50"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Bio & Background
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-slate-900 dark:text-white"
                                        placeholder="Tell us a little bit about yourself..."
                                    />
                                </div>


                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleDeleteAccount}
                                        className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                                    </Button>

                                    <Button type="submit" disabled={isSaving} className="w-full sm:w-auto min-w-[140px]">
                                        {isSaving ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                                Saving...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Save size={18} /> Save Changes
                                            </span>
                                        )}
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
