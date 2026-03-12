import { motion } from 'framer-motion';

const Blog = () => {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto"
            >
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
                    </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
                    Our Blog is Coming Soon
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    We're working hard on creating amazing content about mentorship, career growth, and industry trends. Check back later!
                </p>
                <button
                    onClick={() => window.history.back()}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                >
                    &larr; Go Back
                </button>
            </motion.div>
        </div>
    );
};

export default Blog;
