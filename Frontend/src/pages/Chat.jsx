import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MoreVertical, Video, Trash2, X, FileText, Image, Film, Music, Archive, Flag, BellOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { socketService } from '../services/socket';
import toast from 'react-hot-toast';

// File type icon helper
const FileIcon = ({ type }) => {
    if (type?.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type?.startsWith('video/')) return <Film className="w-4 h-4" />;
    if (type?.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (type?.includes('zip') || type?.includes('rar')) return <Archive className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
};

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ChatDropdownMenu = ({ onClose, onClearMessages, onMuteNotifications }) => (
    <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button onClick={() => { onMuteNotifications(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <BellOff className="w-4 h-4" /> Mute Notifications
        </button>
        <button onClick={() => { onClearMessages(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 className="w-4 h-4" /> Clear Messages
        </button>
        <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
        <button onClick={() => { toast('Reported for review.', { icon: '🚩' }); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Flag className="w-4 h-4" /> Report User
        </button>
    </div>
);

const Chat = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // File upload state
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data } = await api.get('/chat');
                setChats(data);
                if (data.length > 0) setSelectedChat(data[0]);
            } catch (error) {
                console.error('Failed to fetch chats', error);
            }
        };
        fetchChats();

        const socket = socketService.connect();
        if (user) {
            socket.emit('setup', user);
            socket.on('connected', () => setSocketConnected(true));
        }

        socket.on('message received', (newMessageReceived) => {
            setChats(prev => prev.map(c =>
                c._id === newMessageReceived.chat._id ? { ...c, latestMessage: newMessageReceived } : c
            ));
            
            if (selectedChat && selectedChat._id === newMessageReceived.chat._id) {
                setMessages(prev => {
                    if (prev.find(m => m._id === newMessageReceived._id)) return prev;
                    return [...prev, newMessageReceived];
                });
            }
        });

        return () => {
            socket.off('connected');
            socket.off('message received');
        };
    }, [user, selectedChat]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedChat) return;
            try {
                const { data } = await api.get(`/messages/${selectedChat._id}`);
                setMessages(data);
                const socket = socketService.getSocket();
                if (socket) socket.emit('join chat', selectedChat._id);
            } catch (error) {
                console.error('Failed to fetch messages', error);
            }
        };
        fetchMessages();
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showDropdown]);

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !selectedChat) return;

        if (selectedFile) {
            await handleFileSend();
            return;
        }

        try {
            const { data } = await api.post('/messages', {
                content: newMessage,
                chatId: selectedChat._id
            });
            setMessages([...messages, data]);
            setChats(prev => prev.map(chat =>
                chat._id === selectedChat._id ? { ...chat, latestMessage: data } : chat
            ));
            setNewMessage('');
            const socket = socketService.getSocket();
            if (socket) socket.emit('new message', data);
        } catch (error) {
            console.error('Failed to send message', error);
            toast.error('Failed to send message');
        }
    };

    const handleFileSend = async () => {
        if (!selectedFile || !selectedChat) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('chatId', selectedChat._id);
            
            const res = await api.post('/messages/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const data = res.data;
            setMessages([...messages, data]);
            setChats(prev => prev.map(chat =>
                chat._id === selectedChat._id ? { ...chat, latestMessage: data } : chat
            ));
            
            const socket = socketService.getSocket();
            if (socket) socket.emit('new message', data);
            
            setSelectedFile(null);
            setNewMessage('');
            toast.success('File sent!');
        } catch (err) {
            toast.error('Failed to send file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) {
            toast.error('File too large (Max 20MB)');
            return;
        }
        setSelectedFile(file);
    };

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.delete(`/messages/${msgId}`);
            setMessages(prev => prev.filter(m => m._id !== msgId));
            toast.success('Message deleted');
        } catch {
            toast.error('Failed to delete message');
        }
    };

    const getOtherUser = (users) => {
        if (!users || !user) return null;
        return users.find(u => u._id !== user._id);
    };

    const isFileMessage = (msg) => msg.messageType === 'file' || msg.content?.startsWith('📎 ');

    return (
        <div className="h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto h-full flex bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                
                {/* Conversations Sidebar */}
                <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col hidden lg:flex">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                placeholder="Search chats..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto w-full">
                        {chats.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">
                                <p className="text-sm font-medium">No conversations yet</p>
                            </div>
                        ) : (
                            chats.map((chat) => {
                                const otherUser = getOtherUser(chat.users);
                                const isSelected = selectedChat?._id === chat._id;
                                return (
                                    <button 
                                        key={chat._id} 
                                        onClick={() => setSelectedChat(chat)}
                                        className={`w-full p-4 flex items-center gap-4 text-left border-b border-slate-50 dark:border-slate-800/50 transition-all ${isSelected ? 'bg-primary-50/50 dark:bg-primary-900/10 border-l-4 border-l-primary-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 overflow-hidden uppercase">
                                                {otherUser?.profileImage 
                                                    ? <img src={otherUser.profileImage} className="w-full h-full object-cover" alt="" />
                                                    : (otherUser?.firstName?.[0] || '?')}
                                            </div>
                                            {socketConnected && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <span className="font-bold truncate">{otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'System'}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {chat.latestMessage?.content || 'New conversation'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Main Chat Window */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold uppercase overflow-hidden text-slate-400">
                                        {getOtherUser(selectedChat.users)?.profileImage 
                                            ? <img src={getOtherUser(selectedChat.users).profileImage} className="w-full h-full object-cover" alt="" />
                                            : (getOtherUser(selectedChat.users)?.firstName?.[0] || '?')}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold truncate">
                                            {getOtherUser(selectedChat.users) ? `${getOtherUser(selectedChat.users).firstName} ${getOtherUser(selectedChat.users).lastName}` : 'System Chat'}
                                        </h3>
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            Live Connection
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            const other = getOtherUser(selectedChat.users);
                                            const name = other ? `${other.firstName} ${other.lastName}` : 'User';
                                            navigate(`/video-call?room=${selectedChat._id}&name=${encodeURIComponent(name)}`);
                                        }}
                                        className="rounded-2xl border-primary-500/20 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 h-10"
                                    >
                                        <Video className="w-4 h-4 mr-2" /> 
                                        <span className="hidden sm:inline">Join Call</span>
                                    </Button>

                                    <div className="relative" ref={dropdownRef}>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="w-10 h-10 p-0 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800"
                                            onClick={() => setShowDropdown(prev => !prev)}
                                        >
                                            <MoreVertical className="w-5 h-5 text-slate-400" />
                                        </Button>
                                        {showDropdown && (
                                            <ChatDropdownMenu 
                                                onClose={() => setShowDropdown(false)}
                                                onClearMessages={() => { setMessages([]); toast.success('Cleared messages'); }}
                                                onMuteNotifications={() => toast('Notifications muted', { icon: '🔕' })}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-slate-900/50">
                                {messages.map((msg) => {
                                    const isSender = msg.sender?._id === user?._id || msg.sender === user?._id;
                                    const isFile = isFileMessage(msg);
                                    return (
                                        <div key={msg._id} className={`flex ${isSender ? 'justify-end' : 'justify-start'} group items-end gap-2`}>
                                            <div className={`max-w-[80%] flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                                                <div className={`p-4 rounded-3xl shadow-sm ${isSender 
                                                    ? 'bg-primary-500 text-white rounded-br-none' 
                                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-100 dark:border-slate-800'}`}>
                                                    
                                                    {isFile ? (
                                                        <div className="flex items-center gap-3 min-w-[120px]">
                                                            <div className={`p-2.5 rounded-2xl ${isSender ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold truncate">{msg.content?.replace('📎 ', '') || 'Document'}</p>
                                                                <p className={`text-[10px] uppercase font-black tracking-widest ${isSender ? 'text-white/60' : 'text-slate-400'}`}>Click to download</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mt-1.5 px-2">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {isSender && (
                                                <button 
                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 mb-6"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Form */}
                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                {selectedFile && (
                                    <div className="mx-auto max-w-4xl mb-4 p-3 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-800/20 flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-primary-500">
                                            <FileIcon type={selectedFile.type} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                                            <p className="text-[10px] font-black uppercase text-slate-400">{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedFile(null)}
                                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center bg-slate-50 dark:bg-slate-950 rounded-[2rem] p-2 border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                                    <input 
                                        ref={fileInputRef} 
                                        type="file" 
                                        className="hidden" 
                                        onChange={handleFileSelect}
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.txt" 
                                    />
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        className="w-12 h-12 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip className="w-5 h-5 text-slate-400" />
                                    </Button>

                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={selectedFile ? "Add a message..." : "Type your message..."}
                                        rows={1}
                                        className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm font-medium resize-none max-h-32"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                                        }}
                                    />

                                    <Button 
                                        type="submit"
                                        disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                                        className="w-12 h-12 rounded-full shadow-lg shadow-primary-500/20 shrink-0 transition-transform active:scale-95 disabled:scale-100"
                                    >
                                        {isUploading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50/20 dark:bg-slate-950/20">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-8">
                                <Video className="w-10 h-10 text-primary-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Your Conversations</h3>
                            <p className="text-slate-400 text-center max-w-sm mb-8">Select a contact from the sidebar to start chatting or join a video call session.</p>
                            <Button variant="outline" className="rounded-2xl h-12 px-8" onClick={() => navigate('/mentors')}>
                                Find a Mentor
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
