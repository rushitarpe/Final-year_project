import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="w-full relative z-20 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center gap-3 mb-4">
                            <img src="/logo.png" alt="GuideMe" className="h-16 w-auto object-contain drop-shadow-md" />
                            <span className="text-2xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-blue-500 to-teal-400">
                                GuideMe
                            </span>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                            Connecting ambitious mentees with industry-leading mentors to build the careers of tomorrow.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Platform</h4>
                        <ul className="space-y-3">
                            <li><Link to="/mentors" className="text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">Find Mentors</Link></li>
                            <li><Link to="/about" className="text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">About Us</Link></li>
                            <li><Link to="/blog" className="text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <li><Link to="#" className="text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="#" className="text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        © {new Date().getFullYear()} GuideMe. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {/* Social icons can go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
};
