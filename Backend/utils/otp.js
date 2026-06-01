const crypto = require('crypto');

/**
 * Generate a cryptographically random 6-digit OTP.
 * @returns {string} 6-digit numeric OTP
 */
const generateOTP = () => {
    // Use crypto.randomInt for unbiased uniform distribution
    return String(crypto.randomInt(100000, 999999));
};

/**
 * Hash an OTP using SHA-256.
 * We NEVER store the raw OTP — only the hash.
 * @param {string} otp
 * @returns {string} hex-encoded SHA-256 hash
 */
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify a submitted OTP against the stored hash.
 * @param {string} submittedOtp - plain OTP from user
 * @param {string} storedHash - SHA-256 hash from DB
 * @returns {boolean}
 */
const verifyOTP = (submittedOtp, storedHash) => {
    const submittedHash = hashOTP(submittedOtp);
    // Use timingSafeEqual to prevent timing attacks
    const a = Buffer.from(submittedHash);
    const b = Buffer.from(storedHash);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
};

/**
 * Mask an email for display: m***@gmail.com
 * @param {string} email
 * @returns {string}
 */
const maskEmail = (email) => {
    const [local, domain] = email.split('@');
    const visible = local[0];
    const masked = visible + '*'.repeat(Math.min(3, local.length - 1));
    return `${masked}@${domain}`;
};

module.exports = { generateOTP, hashOTP, verifyOTP, maskEmail };
