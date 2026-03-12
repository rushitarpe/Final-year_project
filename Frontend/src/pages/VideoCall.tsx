import { useState, useEffect, useRef, useCallback } from 'react';
import {
    StreamVideo,
    StreamVideoClient,
    StreamCall,
    CallControls,
    SpeakerLayout,
    StreamTheme,
    useStreamVideoClient,
    useCalls,
    CallingState,
    useCallStateHooks,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import {
    Mic, MicOff, Video as VidIcon, VideoOff,
    Camera, ArrowRight, AlertTriangle, CheckCircle2, PhoneOff
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// ─── Pre-call Lobby ───────────────────────────────────────────────────────────
type PermStatus = 'idle' | 'checking' | 'requesting' | 'granted' | 'denied' | 'unavailable';

interface LobbyProps {
    chatName: string;
    onJoin: () => void;
    onCancel: () => void;
}

const CallLobby = ({ chatName, onJoin, onCancel }: LobbyProps) => {
    const { user } = useAuth();
    const previewRef = useRef<HTMLVideoElement>(null);
    const previewStreamRef = useRef<MediaStream | null>(null);

    const [micPerm, setMicPerm] = useState<PermStatus>('idle');
    const [camPerm, setCamPerm] = useState<PermStatus>('idle');
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [isRequesting, setIsRequesting] = useState(false);
    const [permissionsChecked, setPermissionsChecked] = useState(false);

    const requestPermissions = useCallback(async () => {
        setIsRequesting(true);
        setMicPerm('requesting');
        setCamPerm('requesting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            previewStreamRef.current = stream;
            if (previewRef.current) previewRef.current.srcObject = stream;
            setMicPerm('granted');
            setCamPerm('granted');
        } catch (err: any) {
            if (err.name === 'NotFoundError') {
                setMicPerm('unavailable'); setCamPerm('unavailable');
                toast.error('No camera/microphone found.');
            } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                try {
                    const audio = await navigator.mediaDevices.getUserMedia({ audio: true });
                    previewStreamRef.current = audio;
                    setMicPerm('granted'); setCamPerm('denied'); setCamOn(false);
                    toast('Camera blocked — joining audio only.', { icon: '🎙️' });
                } catch {
                    setMicPerm('denied'); setCamPerm('denied');
                    toast.error('Camera & mic blocked. Allow in browser settings.');
                }
            }
        } finally {
            setIsRequesting(false);
            setPermissionsChecked(true);
        }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const [cam, mic] = await Promise.all([
                    navigator.permissions.query({ name: 'camera' as PermissionName }),
                    navigator.permissions.query({ name: 'microphone' as PermissionName }),
                ]);
                if (cam.state === 'granted' && mic.state === 'granted') {
                    await requestPermissions();
                } else {
                    setCamPerm(cam.state === 'denied' ? 'denied' : 'idle');
                    setMicPerm(mic.state === 'denied' ? 'denied' : 'idle');
                }
            } catch { await requestPermissions(); }
        })();
        return () => { previewStreamRef.current?.getTracks().forEach(t => t.stop()); };
    }, [requestPermissions]);

    const toggleCam = () => {
        const t = previewStreamRef.current?.getVideoTracks()[0];
        if (t) { t.enabled = !camOn; setCamOn(!camOn); }
    };
    const toggleMic = () => {
        const t = previewStreamRef.current?.getAudioTracks()[0];
        if (t) { t.enabled = !micOn; setMicOn(!micOn); }
    };

    const PermBadge = ({ status }: { status: PermStatus }) => {
        const label = { granted: 'Allowed', denied: 'Blocked', unavailable: 'Not found', idle: 'Pending', checking: 'Checking', requesting: 'Requesting' }[status];
        const color = status === 'granted' ? 'bg-green-500/20 text-green-400' : status === 'denied' ? 'bg-red-500/20 text-red-400' : status === 'unavailable' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400';
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>;
    };

    const PermIcon = ({ status }: { status: PermStatus }) => {
        if (status === 'granted') return <CheckCircle2 className="w-5 h-5 text-green-400" />;
        if (status === 'denied' || status === 'unavailable') return <AlertTriangle className={`w-5 h-5 ${status === 'unavailable' ? 'text-yellow-400' : 'text-red-400'}`} />;
        if (status === 'requesting') return <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />;
        return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
    };

    const canJoin = micPerm === 'granted' || camPerm === 'granted';

    return (
        <div className="min-h-[calc(100vh-76px)] bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Camera preview */}
                <div className="relative w-full aspect-video bg-slate-800">
                    <video ref={previewRef} autoPlay playsInline muted className={`w-full h-full object-cover scale-x-[-1] transition-opacity ${camPerm === 'granted' && camOn ? 'opacity-100' : 'opacity-0'}`} />
                    {(camPerm !== 'granted' || !camOn) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-white/10">
                                {(user as any)?.firstName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <p className="text-slate-400 text-sm">
                                {camPerm === 'denied' ? 'Camera blocked' : camPerm === 'unavailable' ? 'No camera found' : !camOn ? 'Camera is off' : 'Starting camera...'}
                            </p>
                        </div>
                    )}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white">Preview · {(user as any)?.firstName}</div>
                    {camPerm === 'granted' && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            <button onClick={toggleMic} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-slate-700/80 text-white' : 'bg-red-500/80 text-white'}`}>
                                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                            </button>
                            <button onClick={toggleCam} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${camOn ? 'bg-slate-700/80 text-white' : 'bg-red-500/80 text-white'}`}>
                                {camOn ? <VidIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <h2 className="text-xl font-bold text-white">Join call with <span className="text-indigo-400">{chatName}</span></h2>
                        <p className="text-slate-400 text-sm mt-1">Check your camera and microphone before joining.</p>
                    </div>

                    {/* Permission rows */}
                    <div className="space-y-2">
                        {[{ label: 'Camera', icon: Camera, status: camPerm }, { label: 'Microphone', icon: Mic, status: micPerm }].map(({ label, icon: Icon, status }) => (
                            <div key={label} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2.5">
                                    <Icon className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm text-white font-medium">{label}</span>
                                    <PermBadge status={status} />
                                </div>
                                <PermIcon status={status} />
                            </div>
                        ))}
                    </div>

                    {(micPerm === 'denied' || camPerm === 'denied') && (
                        <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-300 leading-relaxed">
                                Click the <strong>🔒 lock icon</strong> in your browser's address bar → set Camera and Microphone to <strong>Allow</strong> → refresh the page.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all font-medium text-sm">
                            Cancel
                        </button>
                        {!permissionsChecked ? (
                            <button onClick={requestPermissions} disabled={isRequesting} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                                {isRequesting
                                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Requesting...</>
                                    : <>Allow Access <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        ) : (
                            <button onClick={onJoin} disabled={!canJoin} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                <VidIcon className="w-4 h-4" /> Join Call
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Stream Video Call UI ─────────────────────────────────────────────────────
const StreamCallUI = ({ callId, onLeave }: { callId: string; onLeave: () => void }) => {
    const { useCallCallingState } = useCallStateHooks();
    const callingState = useCallCallingState();

    if (callingState === CallingState.LEFT) {
        onLeave();
        return null;
    }

    return (
        <StreamTheme>
            <div className="h-[calc(100vh-76px)] flex flex-col relative">
                {/* Call header */}
                <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-slate-950/80 to-transparent flex items-center gap-3 pointer-events-none">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${callingState === CallingState.JOINED ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        <span className={`w-2 h-2 rounded-full ${callingState === CallingState.JOINED ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
                        {callingState === CallingState.JOINED ? 'Connected' : 'Connecting...'}
                    </div>
                    <span className="text-slate-300 text-sm font-medium">Room: {callId.slice(0, 12)}...</span>
                </div>

                {/* Main video grid — Stream handles layout automatically */}
                <div className="flex-1 overflow-hidden">
                    <SpeakerLayout participantsBarPosition="bottom" />
                </div>

                {/* Stream's built-in controls (mute, cam, share screen, end) */}
                <div className="flex items-center justify-center pb-4 pt-2 bg-slate-950">
                    <CallControls onLeave={onLeave} />
                </div>
            </div>
        </StreamTheme>
    );
};

// ─── Main VideoCall Page ──────────────────────────────────────────────────────
const VideoCall = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const roomId = searchParams.get('room') || 'default-room';
    const chatName = searchParams.get('name') || 'Video Call';

    const [showLobby, setShowLobby] = useState(true);
    const [client, setClient] = useState<StreamVideoClient | null>(null);
    const [call, setCall] = useState<any>(null);
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = useCallback(async () => {
        setIsJoining(true);
        try {
            // 1. Get Stream token from our backend
            const { data } = await api.get('/stream/token');
            const { token, apiKey, userId, userName } = data;

            // 2. Create Stream client
            const streamClient = new StreamVideoClient({
                apiKey,
                user: {
                    id: userId,
                    name: userName,
                    image: (user as any)?.profileImage || undefined,
                },
                token,
            });

            // 3. Create/join the call using the chatId as room
            const streamCall = streamClient.call('default', roomId);
            await streamCall.getOrCreate({
                data: { created_by_id: userId },
            });
            await streamCall.join({ create: true });

            setClient(streamClient);
            setCall(streamCall);
            setShowLobby(false);
        } catch (err: any) {
            console.error('Stream join error:', err);
            toast.error('Failed to join call. Please try again.');
        } finally {
            setIsJoining(false);
        }
    }, [roomId, user]);

    const handleLeave = useCallback(async () => {
        try {
            await call?.leave();
            await client?.disconnectUser();
        } catch { /* ignore */ }
        setCall(null);
        setClient(null);
        navigate('/chat');
    }, [call, client, navigate]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            call?.leave().catch(() => { });
            client?.disconnectUser().catch(() => { });
        };
    }, [call, client]);

    // Pre-call lobby
    if (showLobby) {
        return (
            <CallLobby
                chatName={chatName}
                onJoin={handleJoin}
                onCancel={() => navigate('/chat')}
            />
        );
    }

    // Joining spinner
    if (isJoining || !client || !call) {
        return (
            <div className="h-[calc(100vh-76px)] bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-300 font-medium">Connecting to call...</p>
            </div>
        );
    }

    // Stream video call
    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <StreamCallUI callId={roomId} onLeave={handleLeave} />
            </StreamCall>
        </StreamVideo>
    );
};

export default VideoCall;
