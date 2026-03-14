import { motion } from 'framer-motion';
import { Newspaper, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[calc(100vh-80px)] bg-white dark:bg-slate-950 flex items-center justify-center p-6 text-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg"
            >
                <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Newspaper className="w-12 h-12" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                    Insights Coming <span className="text-primary-500">Soon</span>
                </h1>
                
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
                    We're curating deep dives into technical leadership, career breakthroughs, and the future of collaborative learning.
                </p>
                
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold hover:gap-4 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Safety
                </button>
            </motion.div>
        </div>
    );
};

export default Blog;
