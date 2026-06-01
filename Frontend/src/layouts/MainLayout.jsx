import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ChatbotWidget } from '../components/chat/ChatbotWidget';

const MainLayout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] transition-colors duration-500 relative overflow-x-hidden">
            {/* Advanced Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 dark:bg-violet-900/15 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 dark:bg-blue-900/15 blur-[100px]" />
                <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 dark:bg-indigo-900/10 blur-[140px] animate-pulse duration-[8s]" />
                
                {/* Subtle grid pattern for texture */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }} />
            </div>

            <Navbar />

            <main className="flex-1 w-full flex flex-col z-10 pt-[76px] relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex-1 flex flex-col"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            <Footer />
            <ChatbotWidget />
        </div>
    );
};

export default MainLayout;
