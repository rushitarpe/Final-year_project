import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Normalises a profileImage value from the database.
 * - Full HTTP/HTTPS URLs (e.g. Cloudinary) are returned as-is.
 * - Relative paths or legacy filenames (e.g. "mentor7.png", "default.jpg")
 *   are replaced with a deterministic ui-avatars URL so the browser never
 *   makes a same-origin request that ends up as OpaqueResponseBlocking.
 *
 * @param {string|undefined} profileImage - raw value from the DB/API
 * @param {string} [firstName=''] - used to generate initials fallback
 * @param {string} [lastName=''] - used to generate initials fallback
 * @returns {string|null} - a fully-qualified URL or null (render initials)
 */
export function getAvatarUrl(profileImage, firstName = '', lastName = '') {
    if (!profileImage) return null;
    // Already a full URL — use as-is
    if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
        return profileImage;
    }
    // Legacy relative path or placeholder → use initials avatar
    const name = `${firstName}+${lastName}`.trim() || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=ffffff&bold=true`;
}
