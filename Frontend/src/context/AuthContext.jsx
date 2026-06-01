import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser]                     = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading]           = useState(true);
    // true while the initial token→user resolution is in-flight
    const [isInitializing, setIsInitializing] = useState(true);

    // ── On mount: validate token with /auth/me ─────────────────────
    useEffect(() => {
        const token    = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!token) {
            setIsLoading(false);
            setIsInitializing(false);
            return;
        }

        // Optimistic: hydrate from localStorage immediately to avoid
        // flicker, then confirm with server
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                setIsAuthenticated(true);
            } catch (e) {
                console.error('Failed to parse saved user', e);
            }
        }

        // Confirm token is still valid
        api.get('/auth/me')
            .then(res => {
                if (res.data.success) {
                    const freshUser = res.data.data;
                    setUser(freshUser);
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                }
            })
            .catch(() => {
                // Token expired or invalid — clear everything
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
            })
            .finally(() => {
                setIsLoading(false);
                setIsInitializing(false);
            });
    }, []);

    // ── Login ──────────────────────────────────────────────────────
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        toast.success('Logged in successfully!');
    };

    // ── Logout ─────────────────────────────────────────────────────
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully!');
        window.location.href = '/login';
    };

    // ── Google Sign-in ─────────────────────────────────────────────
    const googleSignIn = async () => {
        try {
            const result  = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const res     = await api.post('/auth/firebase', { idToken });
            if (res.data.success) {
                const { token, user: userData } = res.data;
                login(token, userData);
                return { user: userData, token };
            }
            throw new Error('Firebase login failed');
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    // ── Avatar upload ──────────────────────────────────────────────
    const uploadAvatar = useCallback(async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        const res = await api.post('/upload/avatar', formData);

        if (res.data.success) {
            const newUrl = res.data.data.url;
            setUser(prev => {
                if (!prev) return prev;
                const updated = {
                    ...prev,
                    profileImage: newUrl,
                    profilePhoto: { ...(prev.profilePhoto || {}), url: newUrl },
                    avatar: newUrl,
                };
                localStorage.setItem('user', JSON.stringify(updated));
                return updated;
            });
            return newUrl;
        }
        throw new Error(res.data.error || 'Upload failed');
    }, []);

    // ── Update user — deep merge nested objects ────────────────────
    const updateUser = useCallback((data) => {
        setUser(prev => {
            if (!prev) return data;
            // Deep merge: nested objects are merged, not replaced
            const merged = { ...prev };
            Object.keys(data).forEach(key => {
                if (
                    data[key] !== null &&
                    typeof data[key] === 'object' &&
                    !Array.isArray(data[key]) &&
                    typeof prev[key] === 'object' &&
                    prev[key] !== null &&
                    !Array.isArray(prev[key])
                ) {
                    merged[key] = { ...prev[key], ...data[key] };
                } else {
                    merged[key] = data[key];
                }
            });
            localStorage.setItem('user', JSON.stringify(merged));
            return merged;
        });
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            isInitializing,
            login,
            logout,
            googleSignIn,
            uploadAvatar,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
