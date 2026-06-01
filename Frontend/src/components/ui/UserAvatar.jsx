/**
 * UserAvatar — shared avatar component
 *
 * - Uses crossOrigin="anonymous" so CORS-enabled CDNs (e.g. Cloudinary) respond
 *   with proper CORS headers. This prevents Firefox's OpaqueResponseBlocking on
 *   404 / failed cross-origin image requests; the onError handler fires instead.
 * - Falls back to coloured initials when the image is missing, empty, a legacy
 *   relative filename (e.g. "default.jpg", "mentor7.png"), or returns a 404.
 */
import { useState } from 'react';

const isAbsoluteUrl = (src) =>
    typeof src === 'string' &&
    (src.startsWith('http://') || src.startsWith('https://'));

const UserAvatar = ({
    src,
    firstName = '',
    lastName = '',
    /** Tailwind size classes, e.g. "w-10 h-10"  */
    size = 'w-10 h-10',
    /** Tailwind border-radius classes, e.g. "rounded-full" or "rounded-2xl" */
    shape = 'rounded-full',
    /** Extra Tailwind classes forwarded to the outer wrapper */
    className = '',
    alt = '',
}) => {
    const [imgError, setImgError] = useState(false);

    const initial1 = (firstName?.[0] || '').toUpperCase();
    const initial2 = (lastName?.[0] || '').toUpperCase();
    const initials = initial1 + initial2 || '?';

    // Only attempt to render an <img> if src is a proper absolute URL
    const showImage = !imgError && isAbsoluteUrl(src);

    const wrapperCls =
        `${size} ${shape} overflow-hidden flex-shrink-0 flex items-center justify-center ` +
        `bg-gradient-to-br from-violet-500 to-blue-600 text-white font-black select-none ${className}`;

    return (
        <div className={wrapperCls}>
            {showImage ? (
                <img
                    src={src}
                    alt={alt || `${firstName} ${lastName}`.trim() || 'Avatar'}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <span className="text-[0.6em] leading-none">{initials}</span>
            )}
        </div>
    );
};

export default UserAvatar;
