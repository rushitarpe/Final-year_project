import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MoreVertical, Phone, Video, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { socketService } from '../services/socket';
import toast from 'react-hot-toast';

const Chat = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);

    // For auto-scroll
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data } = await api.get('/chat');
                setChats(data);
                if (data.length > 0) {
                    setSelectedChat(data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch chats", error);
            }
        };

        fetchChats();

        // Setup Socket
        const socket = socketService.connect();

        if (user) {
            socket.emit('setup', user);
            socket.on('connected', () => setSocketConnected(true));
        }

        socket.on('message received', (newMessageReceived) => {
            setChats(prev => prev.map(c =>
                c._id === newMessageReceived.chat._id ? { ...c, latestMessage: newMessageReceived } : c
            ));

            if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
                // Not in current chat, maybe show notification
            } else {
                setMessages((prev) => {
                    if (prev.find(m => m._id === newMessageReceived._id)) return prev;
                    return [...prev, newMessageReceived];
                });
            }
        });

        return () => {
            socket.off('connected');
            socket.off('message received');
        };
    }, [user]);

    // Handle selected chat change
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedChat) return;
            try {
                const { data } = await api.get(`/messages/${selectedChat._id}`);
                setMessages(data);

                const socket = socketService.getSocket();
                if (socket) {
                    socket.emit('join chat', selectedChat._id);
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };
        fetchMessages();
    }, [selectedChat]);

    // Auto-scroll when messages update
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const { data } = await api.post('/messages', {
                content: newMessage,
                chatId: selectedChat._id
            });

            // Add to UI immediately
            setMessages([...messages, data]);
            setChats(prev => prev.map(chat =>
                chat._id === selectedChat._id ? { ...chat, latestMessage: data } : chat
            ));
            setNewMessage('');

            // Emit to socket
            const socket = socketService.getSocket();
            if (socket) {
                socket.emit('new message', data);
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const handleDeleteMessage = async (msgId: string) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await api.delete(`/messages/${msgId}`);
            setMessages((prev) => prev.filter((m) => m._id !== msgId));
        } catch (error) {
            console.error("Failed to delete message", error);
        }
    };

    const getOtherUser = (users: any[]) => {
        if (!users || !user) return null;
        return users.find(u => u._id !== user._id);
    };

    return (
        <div className="container mx-auto px-0 md:px-6 py-0 md:py-6 h-[calc(100vh-76px)]">
            <div className="flex h-full bg-white dark:bg-slate-900 md:rounded-2xl border-x-0 border-y md:border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">

                {/* Sidebar */}
                <div className="w-80 border-r border-slate-200 dark:border-white/10 hidden md:flex flex-col bg-slate-50 dark:bg-slate-900/50">
                    <div className="p-4 border-b border-slate-200 dark:border-white/10">
                        <Input placeholder="Search messages..." />
                    </div>
                    <div className="flex-1 overflow-y-auto w-full">
                        {chats.length === 0 ? (
                            <div className="p-4 text-center text-slate-500">No chats available.</div>
                        ) : (
                            chats.map((chat) => {
                                const otherUser = getOtherUser(chat.users);
                                const isSelected = selectedChat?._id === chat._id;
                                return (
                                    <div
                                        key={chat._id}
                                        onClick={() => setSelectedChat(chat)}
                                        className={`p-4 flex items-center gap-3 w-full border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-all duration-200 group ${isSelected ? 'bg-white dark:bg-slate-800 border-l-4 border-l-primary-500 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-800/80 hover:pl-5'}`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full flex shrink-0 items-center justify-center font-bold text-xl uppercase bg-slate-200 dark:bg-slate-700 overflow-hidden text-slate-400">
                                                {otherUser?.profileImage ? (
                                                    <img src={otherUser.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    otherUser?.firstName?.[0] || '?'
                                                )}
                                            </div>
                                            {socketConnected && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`font-semibold text-slate-900 dark:text-white truncate ${isSelected ? '' : ''}`} title={chat.isGroupChat ? chat.chatName : `${otherUser?.firstName} ${otherUser?.lastName}`}>
                                                    {chat.isGroupChat ? chat.chatName : `${otherUser?.firstName} ${otherUser?.lastName}`}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate">{chat.latestMessage?.content || 'No messages'}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 min-w-0">
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 shrink-0 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden font-bold uppercase text-slate-400">
                                        {getOtherUser(selectedChat.users)?.profileImage ? (
                                            <img src={getOtherUser(selectedChat.users)?.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            getOtherUser(selectedChat.users)?.firstName?.[0] || '?'
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                            {selectedChat.isGroupChat ? selectedChat.chatName : `${getOtherUser(selectedChat.users)?.firstName} ${getOtherUser(selectedChat.users)?.lastName}`}
                                        </h3>
                                        {socketConnected && <p className="text-xs text-primary-500">Online</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="ghost" size="sm"
                                        onClick={() => {
                                            const other = getOtherUser(selectedChat.users);
                                            const name = other ? `${other.firstName} ${other.lastName}` : 'Video Call';
                                            navigate(`/video-call?room=${selectedChat._id}&name=${encodeURIComponent(name)}`);
                                        }}
                                        className="w-10 h-10 p-0 rounded-full"
                                        title="Voice Call"
                                    >
                                        <Phone className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        variant="ghost" size="sm"
                                        onClick={() => {
                                            const other = getOtherUser(selectedChat.users);
                                            const name = other ? `${other.firstName} ${other.lastName}` : 'Video Call';
                                            navigate(`/video-call?room=${selectedChat._id}&name=${encodeURIComponent(name)}`);
                                        }}
                                        className="w-10 h-10 p-0 rounded-full"
                                        title="Video Call"
                                    >
                                        <Video className="w-5 h-5 text-primary-500" />
                                    </Button>
                                    <Button
                                        variant="ghost" size="sm"
                                        className="w-10 h-10 p-0 rounded-full"
                                        title="More options"
                                        onClick={() => {
                                            if (window.confirm('Clear all messages in this chat?')) {
                                                setMessages([]);
                                                toast.success('Chat cleared locally.');
                                            }
                                        }}
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-[#0B1120] relative">
                                <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800/[0.04] bg-[bottom_1px_center] z-0 pointer-events-none" />
                                <div className="relative z-10 flex flex-col space-y-6">
                                    {messages.map((msg) => {
                                        const isSender = msg.sender?._id === user?._id || msg.sender === user?._id;
                                        return (
                                            <div key={msg._id} className={`flex ${isSender ? 'justify-end' : 'justify-start'} group w-full`}>
                                                <div className={`flex items-center gap-2 max-w-[85%] md:max-w-[75%] ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                                                        <div className={`relative px-5 py-3 shadow-md ${isSender
                                                            ? 'bg-primary-500 text-white rounded-2xl rounded-tr-sm'
                                                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700/50'
                                                            }`}>
                                                            <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                                                        </div>
                                                        <span className="text-[11px] font-medium text-slate-400 mt-1.5 px-1">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    {/* Delete Button (Only for Sender) */}
                                                    {isSender && (
                                                        <button
                                                            onClick={() => handleDeleteMessage(msg._id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full shrink-0"
                                                            title="Delete Message"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} className="h-4" />
                                </div>
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-white dark:bg-slate-900 shrink-0 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.05)] z-20">
                                <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3 bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-1.5 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500 transition-all">
                                    <Button
                                        type="button" variant="ghost" size="sm"
                                        className="w-10 h-10 p-0 rounded-full shrink-0 flex items-center justify-center self-end mb-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        title="Attach file (coming soon)"
                                        onClick={() => toast('File sharing coming soon! 📎', { icon: '📎' })}
                                    >
                                        <Paperclip className="w-5 h-5 text-slate-500" />
                                    </Button>
                                    <div className="flex-1 relative min-w-0">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="w-full bg-transparent border-none px-2 py-3.5 min-h-[52px] max-h-32 resize-none focus:ring-0 focus:outline-none dark:text-white pb-3"
                                            rows={1}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend(e);
                                                }
                                            }}
                                        />
                                    </div>
                                    <Button type="submit" disabled={!newMessage.trim()} className="w-11 h-11 p-0 rounded-full shrink-0 flex items-center justify-center shadow-lg shadow-primary-500/30 self-end mb-0.5 disabled:opacity-50 disabled:shadow-none transition-all">
                                        <Send className="w-5 h-5 ml-0.5" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500">
                            Select a chat to start messaging
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
