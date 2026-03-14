import { useState, useEffect, useRef, useCallback } from 'react';
import {
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    CallControls,
    SpeakerLayout,
    StreamTheme,
    CallingState,
    useCallStateHooks,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import {
    Mic, MicOff, Video, VideoOff,
    ArrowRight, AlertTriangle, CheckCircle2, PhoneOff, Settings
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Pre-call Lobby ───────────────────────────────────────────────────────────
const CallLobby = ({ chatName, onJoin, onCancel }) => {
    const { user } = useAuth();
    const previewRef = useRef(null);
    const previewStreamRef = useRef(null);

    const [micPerm, setMicPerm] = useState('idle');
    const [camPerm, setCamPerm] = useState('idle');
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [isRequesting, setIsRequesting] = useState(false);
    const [permissionsChecked, setPermissionsChecked] = useState(false);

    const enumerateDevices = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCam = devices.some(d => d.kind === 'videoinput');
            const hasMic = devices.some(d => d.kind === 'audioinput');
            if (!hasCam) setCamPerm('unavailable');
            if (!hasMic) setMicPerm('unavailable');
        } catch (e) { console.error(e); }
    }, []);

    const requestPermissions = useCallback(async () => {
        setIsRequesting(true);
        const combined = new MediaStream();

        setMicPerm('requesting');
        try {
            const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
            ms.getAudioTracks().forEach(t => combined.addTrack(t));
            setMicPerm('granted');
        } catch (err) {
            setMicPerm(err.name === 'NotAllowedError' ? 'denied' : 'unavailable');
        }

        setCamPerm('requesting');
        try {
            const vs = await navigator.mediaDevices.getUserMedia({ video: true });
            vs.getVideoTracks().forEach(t => combined.addTrack(t));
            setCamPerm('granted');
        } catch (err) {
            setCamPerm(err.name === 'NotAllowedError' ? 'denied' : 'unavailable');
        }

        if (combined.getTracks().length > 0) {
            previewStreamRef.current = combined;
            if (previewRef.current) previewRef.current.srcObject = combined;
        }

        await enumerateDevices();
        setIsRequesting(false);
        setPermissionsChecked(true);
    }, [enumerateDevices]);

    useEffect(() => {
        enumerateDevices();
        return () => {
            previewStreamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [enumerateDevices]);

    const toggleCam = () => {
        const t = previewStreamRef.current?.getVideoTracks()[0];
        if (t) { t.enabled = !camOn; setCamOn(!camOn); }
    };
    const toggleMic = () => {
        const t = previewStreamRef.current?.getAudioTracks()[0];
        if (t) { t.enabled = !micOn; setMicOn(!micOn); }
    };

    const StatusBadge = ({ status }) => {
        const cfg = {
            granted: 'bg-green-500/20 text-green-400 border-green-500/20',
            denied: 'bg-red-500/20 text-red-500 border-red-500/20',
            unavailable: 'bg-amber-500/20 text-amber-500 border-amber-500/20',
            requesting: 'bg-primary-500/20 text-primary-500 border-primary-500/20',
            idle: 'bg-slate-800 text-slate-500 border-slate-700'
        };
        const labels = { granted: 'Ready', denied: 'Blocked', unavailable: 'Missing', requesting: 'Asking...', idle: 'Waiting' };
        return (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${cfg[status] || cfg.idle}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                <div className="relative aspect-video bg-slate-950 group">
                    <video 
                        ref={previewRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-700 ${camPerm === 'granted' && camOn ? 'opacity-100' : 'opacity-0'}`} 
                    />
                    
                    {(camPerm !== 'granted' || !camOn) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl">
                                {user?.firstName?.[0] || '?'}
                            </div>
                            <p className="mt-4 text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Camera Offline</p>
                        </div>
                    )}

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                        <button 
                            onClick={toggleMic} 
                            disabled={micPerm !== 'granted'}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${micOn ? 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'}`}
                        >
                            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </button>
                        <button 
                            onClick={toggleCam} 
                            disabled={camPerm !== 'granted'}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${camOn ? 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/30'}`}
                        >
                            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">Join Session</h2>
                        <p className="text-slate-400 font-medium">Connect with <span className="text-primary-400 font-bold">{chatName}</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <Video className="w-5 h-5 text-slate-500" />
                                <StatusBadge status={camPerm} />
                            </div>
                            <span className="text-xs font-bold text-slate-300">Camera</span>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <Mic className="w-5 h-5 text-slate-500" />
                                <StatusBadge status={micPerm} />
                            </div>
                            <span className="text-xs font-bold text-slate-300">Microphone</span>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button onClick={onCancel} className="flex-1 h-14 rounded-2xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all">
                            Exit
                        </button>
                        {!permissionsChecked ? (
                            <button 
                                onClick={requestPermissions} 
                                disabled={isRequesting}
                                className="flex-1 h-14 rounded-2xl bg-primary-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20 hover:bg-primary-500 transition-all disabled:opacity-50"
                            >
                                {isRequesting ? 'Requesting...' : 'Enable Access'}
                            </button>
                        ) : (
                            <button 
                                onClick={onJoin} 
                                className="flex-1 h-14 rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-green-500/20 hover:bg-green-500 transition-all"
                            >
                                Join Room
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StreamCallUI = ({ callId, onLeave }) => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();

    if (callingState === CallingState.LEFT) {
        onLeave();
        return null;
    }

    return (
        <StreamTheme>
            <div className="h-screen bg-slate-950 flex flex-col relative">
                <div className="absolute top-8 left-8 z-50 flex items-center gap-4 pointer-events-none">
                    <div className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${callingState === CallingState.JOINED ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="text-xs font-black uppercase tracking-widest text-white">
                            {callingState === CallingState.JOINED ? 'Live' : 'Connecting'}
                        </span>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden lg:p-8">
                    <SpeakerLayout participantsBarPosition="bottom" />
                </div>

                <div className="h-32 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 z-40">
                    <CallControls onLeave={onLeave} />
                </div>
            </div>
        </StreamTheme>
    );
};

const VideoCall = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const roomId = searchParams.get('room') || 'session-room';
    const chatName = searchParams.get('name') || 'Peer Session';

    const [showLobby, setShowLobby] = useState(true);
    const [client, setClient] = useState(null);
    const [call, setCall] = useState(null);
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = useCallback(async () => {
        setIsJoining(true);
        try {
            const { data } = await api.get('/stream/token');
            const streamClient = new StreamVideoClient({
                apiKey: data.apiKey,
                user: { id: data.userId, name: data.userName, image: user?.profileImage },
                token: data.token,
            });

            const streamCall = streamClient.call('default', roomId);
            await streamCall.getOrCreate();
            await streamCall.join({ create: true });

            setClient(streamClient);
            setCall(streamCall);
            setShowLobby(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to initialize call');
        } finally {
            setIsJoining(false);
        }
    }, [roomId, user]);

    const handleLeave = useCallback(async () => {
        try {
            await call?.leave();
            await client?.disconnectUser();
        } catch (e) { console.error(e); }
        navigate('/chat');
    }, [call, client, navigate]);

    if (showLobby) {
        return <CallLobby chatName={chatName} onJoin={handleJoin} onCancel={() => navigate('/chat')} />;
    }

    if (isJoining || !client || !call) {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Securing Connection...</p>
            </div>
        );
    }

    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <StreamCallUI callId={roomId} onLeave={handleLeave} />
            </StreamCall>
        </StreamVideo>
    );
};

export default VideoCall;
