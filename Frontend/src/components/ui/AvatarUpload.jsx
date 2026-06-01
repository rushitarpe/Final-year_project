import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AvatarUpload = ({ size = 'md', className = '' }) => {
    const { user, uploadAvatar } = useAuth();
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const sizeMap = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-40 h-40',
    };
    const iconSizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5', xl: 'w-6 h-6' };
    const badgeMap = {
        sm: 'w-5 h-5 bottom-0 right-0',
        md: 'w-7 h-7 bottom-0 right-0',
        lg: 'w-9 h-9 bottom-1 right-1',
        xl: 'w-10 h-10 bottom-1 right-1',
    };

    const profilePic = user?.profileImage || user?.profilePhoto?.url || user?.avatar || null;
    const initials = user ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() : '?';

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return toast.error('Please select an image file');
        }
        if (file.size > 5 * 1024 * 1024) {
            return toast.error('Image must be less than 5MB');
        }

        setIsUploading(true);
        try {
            await uploadAvatar(file);
            toast.success('Profile picture updated!');
        } catch (err) {
            toast.error(err?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className={`relative inline-block ${className}`}>
            {/* Avatar */}
            <div className={`${sizeMap[size]} rounded-full overflow-hidden bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl ring-4 ring-slate-800 shadow-xl`}>
                {profilePic ? (
                    <img
                        src={profilePic}
                        alt={initials}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="select-none">{initials}</span>
                )}
                {/* Loading overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Upload Button Badge */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`absolute ${badgeMap[size]} bg-violet-600 hover:bg-violet-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Change profile picture"
            >
                <Camera className={iconSizeMap[size]} />
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
            />
        </div>
    );
};

export default AvatarUpload;
