import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    Mail, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle,
    ShieldCheck, RefreshCcw, Loader2, Star, BookOpen
} from 'lucide-react';

// ── Shared styled input ───────────────────────────────────────────────────────
const inputCls = "w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all placeholder:text-slate-400";

// ── Email validation ─────────────────────────────────────────────────────────
const EMAIL_RE = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// ── Password strength calculator ──────────────────────────────────────────────
const getPasswordStrength = (pw) => {
    if (!pw) return null;
    const checks = {
        length: pw.length >= 8,
        upper: /[A-Z]/.test(pw),
        lower: /[a-z]/.test(pw),
        digit: /\d/.test(pw),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
    };
    const score = Object.values(checks).filter(Boolean).length;
    if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '20%' };
    if (score === 2) return { label: 'Fair', color: '#f97316', width: '40%' };
    if (score === 3 || score === 4) return { label: 'Good', color: '#eab308', width: '65%' };
    return { label: 'Strong', color: '#22c55e', width: '100%' };
};

// ── Framer Motion slide variants ──────────────────────────────────────────────
const slide = (dir) => ({
    initial: { opacity: 0, x: dir * 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: dir * -40 },
    transition: { duration: 0.25, ease: 'easeOut' },
});

// ── Countdown hook ────────────────────────────────────────────────────────────
const useCountdown = (seconds, active) => {
    const [remaining, setRemaining] = useState(seconds);
    useEffect(() => {
        if (!active) { setRemaining(seconds); return; }
        setRemaining(seconds);
        const id = setInterval(() => setRemaining(r => {
            if (r <= 1) { clearInterval(id); return 0; }
            return r - 1;
        }), 1000);
        return () => clearInterval(id);
    }, [active, seconds]);
    return remaining;
};

// ── Format seconds as MM:SS ───────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ─────────────────────────────────────────────────────────────────────────────
const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [step, setStep] = useState(1);
    const [dir, setDir] = useState(1); // 1 = forward, -1 = back
    const goTo = (n) => { setDir(n > step ? 1 : -1); setStep(n); };

    // ── Step 1 state ──────────────────────────────────────────────────────────
    const [email, setEmail] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [sendLoading, setSendLoading] = useState(false);

    // ── Step 2 state ──────────────────────────────────────────────────────────
    const OTP_LEN = 6;
    const [digits, setDigits] = useState(Array(OTP_LEN).fill(''));
    const [otpError, setOtpError] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [otpSentAt, setOtpSentAt] = useState(null);
    const [resendCooldown, setResendCooldown] = useState(false);
    const [resendCount, setResendCount] = useState(0);
    const boxRefs = useRef([]);

    const otpTimer = useCountdown(600, step === 2); // 10 min
    const resendTimer = useCountdown(60, resendCooldown);

    useEffect(() => {
        if (resendTimer === 0) setResendCooldown(false);
    }, [resendTimer]);

    // ── Step 3 state ──────────────────────────────────────────────────────────
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('mentee');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');

    const strength = getPasswordStrength(password);
    const pwMatch = confirmPassword.length > 0 && password === confirmPassword;
    const pwNoMatch = confirmPassword.length > 0 && password !== confirmPassword;
    const canSubmit = firstName && lastName && password && confirmPassword && pwMatch &&
        strength && strength.label !== 'Weak' && strength.label !== 'Fair';

    // ── Step 1: Send OTP ──────────────────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e?.preventDefault();
        setEmailError('');
        if (!EMAIL_RE.test(email.trim())) {
            setEmailError('Please enter a valid email address.');
            return;
        }
        setSendLoading(true);
        try {
            const res = await api.post('/auth/send-otp', { email: email.trim() });
            if (res.data.success) {
                setMaskedEmail(res.data.maskedEmail);
                setOtpSentAt(Date.now());
                setResendCooldown(true);
                setDigits(Array(OTP_LEN).fill(''));
                setOtpError('');
                goTo(2);
                setTimeout(() => boxRefs.current[0]?.focus(), 300);
            }
        } catch (err) {
            setEmailError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setSendLoading(false);
        }
    };

    // ── OTP box handlers ──────────────────────────────────────────────────────
    const handleDigitChange = (i, val) => {
        if (!/^\d*$/.test(val)) return;
        const newDigits = [...digits];
        newDigits[i] = val.slice(-1);
        setDigits(newDigits);
        if (val && i < OTP_LEN - 1) boxRefs.current[i + 1]?.focus();
        if (newDigits.every(d => d) && newDigits.join('').length === OTP_LEN) {
            handleVerifyOtp(newDigits.join(''));
        }
    };

    const handleDigitKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) {
            boxRefs.current[i - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
        if (pasted.length === OTP_LEN) {
            setDigits(pasted.split(''));
            boxRefs.current[OTP_LEN - 1]?.focus();
            handleVerifyOtp(pasted);
        }
    };

    // ── Step 2: Verify OTP ────────────────────────────────────────────────────
    const handleVerifyOtp = async (otp) => {
        setOtpError('');
        setOtpLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email: email.trim(), otp });
            if (res.data.success) {
                // Brief success state, then go to step 3
                setTimeout(() => goTo(3), 400);
            }
        } catch (err) {
            setOtpError(err.response?.data?.error || 'Incorrect OTP. Try again.');
            setShake(true);
            setDigits(Array(OTP_LEN).fill(''));
            setTimeout(() => { setShake(false); boxRefs.current[0]?.focus(); }, 600);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown || sendLoading) return;
        setResendCount(c => c + 1);
        await handleSendOtp();
    };

    // ── Step 3: Complete Registration ─────────────────────────────────────────
    const handleRegister = async (e) => {
        e?.preventDefault();
        setRegisterError('');
        if (!canSubmit) return;

        // If mentor, redirect to mentor apply flow with pre-filled data
        if (role === 'mentor') {
            navigate('/mentor/apply', { state: { firstName, lastName, email: email.trim(), verified: true } });
            return;
        }

        setRegisterLoading(true);
        try {
            const res = await api.post('/auth/complete-register', {
                email: email.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                password,
                confirmPassword,
                role,
            });
            if (res.data.success) {
                login(res.data.token, res.data.user);
                navigate('/mentee/onboarding');
            }
        } catch (err) {
            setRegisterError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setRegisterLoading(false);
        }
    };

    const emailValid = EMAIL_RE.test(email.trim());

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 relative">
            {/* bg blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10">

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${step >= n ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-300 dark:border-slate-700 text-slate-400'}`}>
                                {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                            </div>
                            {n < 3 && <div className={`w-12 h-0.5 transition-all duration-500 ${step > n ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                        </div>
                    ))}
                </div>

                <Card className="p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 overflow-hidden">
                    <AnimatePresence mode="wait" custom={dir}>
                        {/* ── STEP 1: Email ── */}
                        {step === 1 && (
                            <motion.div key="s1" {...slide(dir)}>
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-7 h-7 text-violet-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Create your account</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your email to get started</p>
                                </div>

                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Email Address</label>
                                        <div className="relative">
                                            <input
                                                className={`${inputCls} pr-10 ${emailError ? 'border-red-400 focus:ring-red-400' : emailValid ? 'border-green-400 focus:ring-green-400' : ''}`}
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                                                autoFocus
                                                required
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {email && (emailValid
                                                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    : <XCircle className="w-4 h-4 text-red-400" />)}
                                            </div>
                                        </div>
                                        {emailError && <p className="text-xs text-red-500 mt-1.5">{emailError}</p>}
                                    </div>

                                    <button type="submit" disabled={sendLoading || !emailValid}
                                        className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-violet-500 hover:to-blue-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                                        {sendLoading
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                                            : <>Continue <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </form>

                                <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-violet-600 font-bold hover:underline">Sign in</Link>
                                </div>
                            </motion.div>
                        )}

                        {/* ── STEP 2: OTP ── */}
                        {step === 2 && (
                            <motion.div key="s2" {...slide(dir)}>
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck className="w-7 h-7 text-emerald-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Check your email</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        We sent a 6-digit code to<br />
                                        <span className="font-bold text-violet-600 dark:text-violet-400">{maskedEmail}</span>
                                    </p>
                                </div>

                                {/* 6-box OTP input */}
                                <motion.div
                                    className="flex gap-2 justify-center mb-4"
                                    animate={shake ? { x: [-6, 6, -6, 6, -4, 4, 0] } : {}}
                                    transition={{ duration: 0.4 }}
                                    onPaste={handlePaste}
                                >
                                    {digits.map((d, i) => (
                                        <input
                                            key={i}
                                            ref={el => boxRefs.current[i] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={d}
                                            onChange={e => handleDigitChange(i, e.target.value)}
                                            onKeyDown={e => handleDigitKeyDown(i, e)}
                                            className={`w-12 h-14 text-center text-2xl font-black rounded-xl border-2 outline-none transition-all
                                                bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                                                ${d ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700'}
                                                focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
                                                ${shake ? 'border-red-400' : ''}`}
                                        />
                                    ))}
                                </motion.div>

                                {otpLoading && (
                                    <div className="flex justify-center mb-3">
                                        <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                                    </div>
                                )}

                                {otpError && (
                                    <p className="text-xs text-red-500 text-center mb-3">{otpError}</p>
                                )}

                                {/* Timer */}
                                <div className="text-center mb-4">
                                    {otpTimer > 0 ? (
                                        <p className="text-sm text-slate-500">
                                            Code expires in <span className={`font-bold ${otpTimer < 60 ? 'text-red-500' : 'text-violet-600'}`}>{fmt(otpTimer)}</span>
                                        </p>
                                    ) : (
                                        <p className="text-sm font-bold text-red-500">OTP expired — please request a new code</p>
                                    )}
                                </div>

                                {/* Resend */}
                                <div className="text-center mb-4">
                                    {resendCooldown ? (
                                        <p className="text-xs text-slate-400">
                                            Resend available in <span className="font-bold text-slate-600 dark:text-slate-300">{resendTimer}s</span>
                                        </p>
                                    ) : (
                                        <button onClick={handleResend} disabled={sendLoading}
                                            className="flex items-center gap-1.5 mx-auto text-sm text-violet-600 font-bold hover:text-violet-500 transition-colors disabled:opacity-50">
                                            <RefreshCcw className="w-3.5 h-3.5" /> Resend OTP
                                        </button>
                                    )}
                                </div>

                                <button onClick={() => goTo(1)}
                                    className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Change email
                                </button>
                            </motion.div>
                        )}

                        {/* ── STEP 3: Name + Password ── */}
                        {step === 3 && (
                            <motion.div key="s3" {...slide(dir)}>
                                <div className="text-center mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-7 h-7 text-violet-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Almost there!</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Complete your profile to get started</p>
                                </div>

                                {/* Verified email */}
                                <div className="flex items-center gap-2 h-11 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-600/30 mb-5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <span className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold truncate">{email.trim()}</span>
                                    <span className="ml-auto text-[10px] font-black uppercase text-emerald-600 tracking-widest flex-shrink-0">Verified</span>
                                </div>

                                {registerError && (
                                    <div className="mb-4 p-3 bg-red-100/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">{registerError}</div>
                                )}

                                <form onSubmit={handleRegister} className="space-y-4">
                                    {/* Names */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">First Name</label>
                                            <input className={inputCls} placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Last Name</label>
                                            <input className={inputCls} placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
                                        </div>
                                    </div>

                                    {/* Role selector */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">I want to</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button type="button" onClick={() => setRole('mentee')}
                                                className={`py-3.5 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${role === 'mentee' ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                                <BookOpen className="w-4 h-4" /> Be Mentee
                                            </button>
                                            <button type="button" onClick={() => setRole('mentor')}
                                                className={`py-3.5 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2 ${role === 'mentor' ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                                <Star className="w-4 h-4" /> Be Mentor
                                            </button>
                                        </div>
                                        {role === 'mentor' && (
                                            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                                                You'll complete the mentor application next →
                                            </p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Password</label>
                                        <div className="relative">
                                            <input
                                                className={`${inputCls} pr-11`}
                                                type={showPw ? 'text' : 'password'}
                                                placeholder="Create a password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPw(!showPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {/* Strength bar */}
                                        {password && strength && (
                                            <div className="mt-2">
                                                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full rounded-full transition-all duration-300"
                                                        animate={{ width: strength.width, backgroundColor: strength.color }}
                                                    />
                                                </div>
                                                <p className="text-[11px] font-bold mt-1" style={{ color: strength.color }}>{strength.label}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                className={`${inputCls} pr-11 ${pwMatch ? 'border-green-400' : pwNoMatch ? 'border-red-400' : ''}`}
                                                type={showConf ? 'text' : 'password'}
                                                placeholder="Repeat your password"
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                            <button type="button" onClick={() => setShowConf(!showConf)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {pwMatch && (
                                            <p className="flex items-center gap-1 text-[11px] text-green-500 font-bold mt-1">
                                                <CheckCircle2 className="w-3 h-3" /> Passwords match
                                            </p>
                                        )}
                                        {pwNoMatch && (
                                            <p className="flex items-center gap-1 text-[11px] text-red-500 font-bold mt-1">
                                                <XCircle className="w-3 h-3" /> Passwords do not match
                                            </p>
                                        )}
                                    </div>

                                    <button type="submit" disabled={registerLoading || !canSubmit}
                                        className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-violet-500 hover:to-blue-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                                        {registerLoading
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                                            : role === 'mentor'
                                                ? <>Continue to Application <ArrowRight className="w-4 h-4" /></>
                                                : <>Create Account <CheckCircle2 className="w-4 h-4" /></>}
                                    </button>
                                </form>

                                <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-violet-600 font-bold hover:underline">Sign in</Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
};

export default Signup;
