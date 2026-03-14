import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';



// Unique ID counter to avoid SVG gradient ID collisions when multiple instances render
let _avatarCount = 0;

const AnimeBotAvatar = ({ size = 'md' }) => {
    const [uid] = useState(() => `bot${++_avatarCount}`);
    const s = size === 'lg' ? 56 : size === 'md' ? 44 : 32;
    return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill={`url(#${uid}Grad)`} />
            <rect x="22" y="20" width="56" height="48" rx="16" fill="white" fillOpacity="0.95" />
            <line x1="50" y1="8" x2="50" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="7" r="4" fill="#f9a8d4" />
            <circle cx="35" cy="40" r="8" fill={`url(#${uid}EyeL)`} />
            <circle cx="35" cy="40" r="4" fill="#1e1b4b" />
            <circle cx="37" cy="38" r="1.5" fill="white" />
            <circle cx="65" cy="40" r="8" fill={`url(#${uid}EyeR)`} />
            <circle cx="65" cy="40" r="4" fill="#1e1b4b" />
            <circle cx="67" cy="38" r="1.5" fill="white" />
            <ellipse cx="28" cy="52" rx="6" ry="4" fill="#fca5a5" fillOpacity="0.7" />
            <ellipse cx="72" cy="52" rx="6" ry="4" fill="#fca5a5" fillOpacity="0.7" />
            <path d="M38 56 Q50 66 62 56" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" fill="none" />
            <rect x="12" y="35" width="10" height="18" rx="5" fill="#a78bfa" />
            <rect x="78" y="35" width="10" height="18" rx="5" fill="#a78bfa" />
            <rect x="34" y="68" width="32" height="14" rx="7" fill="white" fillOpacity="0.5" />
            <defs>
                <linearGradient id={`${uid}Grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id={`${uid}EyeL`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
                <linearGradient id={`${uid}EyeR`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const ChatbotWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [messages, setMessages] = useState([
        { id: '1', text: "Hi ya! 👋 I'm GuideBot, your AI mentorship assistant! Ask me anything about finding mentors, career advice, or how to make the most of GuideMe! ✨", sender: 'bot', timestamp: new Date() }
    ]);
    const [inputStr, setInputStr] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Show welcome popup after 2 seconds, auto-dismiss after 7 seconds
    useEffect(() => {
        const showTimer = setTimeout(() => setShowWelcome(true), 2000);
        const hideTimer = setTimeout(() => setShowWelcome(false), 9000);
        return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
    }, []);

    // Close welcome when chat opens
    useEffect(() => { if (isOpen) setShowWelcome(false); }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputStr.trim() || isLoading) return;

        const userMsg = {
            id: Date.now().toString(),
            text: inputStr,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputStr('');
        setIsLoading(true);

        try {
            const res = await api.post('/chatbot/ask', { message: inputStr });
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: res.data.message || res.data.data?.message || res.data,
                sender: 'bot',
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error('Failed to get AI response', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "Uh oh! 😅 I'm having a tiny glitch right now. Could you try again in a moment?",
                sender: 'bot',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!user) return null;

    return (
        <>
            {/* Welcome Popup Bubble */}
            <AnimatePresence>
                {showWelcome && !isOpen && (
                    <motion.div
                        key="welcome-bubble"
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className="fixed bottom-28 right-6 z-[199] max-w-[230px] cursor-pointer select-none"
                        onClick={() => { setShowWelcome(false); setIsOpen(true); }}
                    >
                        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white text-sm font-medium px-4 py-3 rounded-2xl rounded-br-none shadow-2xl leading-snug">
                            👋 Hi! I&apos;m <strong>GuideBot</strong>, your AI assistant! Click me to chat.
                            {/* dismiss X */}
                            <button
                                onClick={e => { e.stopPropagation(); setShowWelcome(false); }}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-700 text-white/80 hover:text-white flex items-center justify-center text-[10px] shadow-md"
                            >✕</button>
                        </div>
                        {/* Triangle pointer */}
                        <div className="w-0 h-0 ml-auto mr-5"
                            style={{ borderLeft: '8px solid transparent', borderRight: '0px solid transparent', borderTop: '8px solid #a855f7' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        key="fab"
                        className="fixed bottom-6 right-6 z-[200] w-[70px] h-[70px] rounded-full shadow-2xl flex items-center justify-center p-0 overflow-visible focus:outline-none group"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        onClick={() => setIsOpen(true)}
                    >
                        {/* Pulsing ring */}
                        <span className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
                        <AnimeBotAvatar size="lg" />
                        {/* Sparkle badge */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border border-white/20">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chatbot Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-[200] w-[380px] h-[600px] max-h-[calc(100vh-120px)] bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/10"
                    >
                        {/* Header */}
                        <div className="relative shrink-0 px-5 py-4 flex items-center justify-between"
                            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(168,85,247,0.9) 50%, rgba(236,72,153,0.8) 100%)', backdropFilter: 'blur(20px)' }}>
                            {/* Decorative blobs */}
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-pink-400/20 blur-2xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

                            <div className="flex items-center gap-3 relative z-10">
                                <div className="ring-2 ring-white/20 rounded-full p-0.5">
                                    <AnimeBotAvatar size="md" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base leading-tight flex items-center gap-1.5">
                                        GuideBot
                                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400" />
                                        <p className="text-white/80 text-xs font-medium">Online & ready!</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="relative z-10 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/15 transition-all duration-200"
                            >
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth"
                            style={{ background: 'linear-gradient(to bottom, rgba(15,12,41,0.97), rgba(36,36,62,0.97))' }}>
                            {messages.map((msg, idx) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {msg.sender === 'bot' && (
                                        <div className="shrink-0 mb-0.5">
                                            <AnimeBotAvatar size="sm" />
                                        </div>
                                    )}
                                    <div className={`flex flex-col gap-1 max-w-[78%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.sender === 'user'
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm shadow-purple-900/40'
                                            : 'bg-white/10 backdrop-blur-sm text-white/90 border border-white/10 rounded-bl-sm'
                                            }`}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                        <span className="text-white/30 text-[10px] px-1">{formatTime(msg.timestamp)}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="shrink-0"><AnimeBotAvatar size="sm" /></div>
                                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                                        {[0, 0.2, 0.4].map((delay, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 h-1.5 bg-white/40 rounded-full"
                                                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 0.8, repeat: Infinity, delay }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick prompts */}
                        <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0" style={{ background: 'rgba(15,12,41,0.97)' }}>
                            {['Find a mentor', 'Career advice', 'How it works?'].map(q => (
                                <button
                                    key={q}
                                    onClick={() => setInputStr(q)}
                                    className="shrink-0 text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/30 rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-white/5 whitespace-nowrap"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="px-3 pb-4 pt-2 shrink-0" style={{ background: 'rgba(15,12,41,0.98)' }}>
                            <form onSubmit={handleSend}
                                className="flex items-center gap-2 bg-white/[0.08] border border-white/10 rounded-2xl p-1.5 focus-within:ring-purple-500/60 focus-within:ring-2 transition-all duration-200"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Ask GuideBot anything..."
                                    className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-white placeholder-white/35 focus:ring-0"
                                    value={inputStr}
                                    onChange={e => setInputStr(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="off"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(e);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputStr.trim() || isLoading}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white disabled:opacity-30 disabled:grayscale transition-all"
                                >
                                    <Send className="w-4 h-4 text-white ml-0.5" />
                                </button>
                            </form>
                            <p className="text-center text-white/20 text-[10px] mt-2">Powered by GuideMe AI ✨</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
