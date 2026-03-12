import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ChatbotWidget } from '../components/chat/ChatbotWidget';

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-x-hidden">
            {/* Background gradients for modern SaaS look */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />

            <Navbar />

            <main className="flex-1 w-full flex flex-col z-10 pt-[76px]">
                <Outlet />
            </main>

            <Footer />
            <ChatbotWidget />
        </div>
    );
};

export default MainLayout;
