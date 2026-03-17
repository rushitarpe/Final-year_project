import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Rocket, Twitter, Linkedin, Github, ArrowRight, Mail, MapPin, Zap } from 'lucide-react';

const FooterLink = ({ to, children }) => (
    <Link
        to={to}
        className="text-slate-500 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors duration-200 text-sm font-medium"
    >
        {children}
    </Link>
);

export const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
        }
    };

    const socials = [
        { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: Github, href: 'https://github.com', label: 'GitHub' },
    ];

    return (
        <footer className="relative w-full overflow-hidden bg-slate-50 dark:bg-[#080c14] border-t border-slate-200 dark:border-white/[0.04]">
            {/* Ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
            <div className="absolute -top-32 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-32 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                {/* Main grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand column */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-2.5 mb-5 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                                <img src="/logo.png" alt="GuideMe" className="w-5 h-5 object-contain filter invert opacity-90" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                Guide<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-500">Me</span>
                            </span>
                        </Link>

                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 max-w-[220px]">
                            Connect with world-class mentors. Build real skills. Launch the career you deserve.
                        </p>

                        {/* Social icons */}
                        <div className="flex items-center gap-3">
                            {socials.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:border-violet-200 dark:hover:border-violet-500/30 transition-all duration-200"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform links */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-5">Platform</h4>
                        <ul className="space-y-3">
                            <li><FooterLink to="/mentors">Find Mentors</FooterLink></li>
                            <li><FooterLink to="/dashboard/mentee">Dashboard</FooterLink></li>
                            <li><FooterLink to="/leaderboard">Leaderboard</FooterLink></li>
                            <li><FooterLink to="/chat">Messages</FooterLink></li>
                            <li><FooterLink to="/blog">Blog</FooterLink></li>
                        </ul>
                    </div>

                    {/* Company links */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-5">Company</h4>
                        <ul className="space-y-3">
                            <li><FooterLink to="/about">About Us</FooterLink></li>
                            <li><FooterLink to="#">Privacy Policy</FooterLink></li>
                            <li><FooterLink to="#">Terms of Service</FooterLink></li>
                            <li><FooterLink to="#">Contact Us</FooterLink></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-5">Stay Updated</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                            Get the latest mentorship tips and platform updates.
                        </p>
                        {subscribed ? (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                                <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">You&apos;re subscribed! 🎉</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 dark:focus:border-violet-500/50 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 active:scale-95"
                                >
                                    Subscribe <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Bottom divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/[0.06] to-transparent mb-8" />

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-600">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> India
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>© {new Date().getFullYear()} GuideMe Inc. All rights reserved.</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-600">
                        Made with ❤️ for learners worldwide.
                    </p>
                </div>
            </div>
        </footer>
    );
};
