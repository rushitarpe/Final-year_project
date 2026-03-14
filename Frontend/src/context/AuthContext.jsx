import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved token and user
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
            } catch (e) {
                console.error('Failed to parse saved user', e);
            }
        }

        // Simulate API loading time
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        toast.success('Logged in successfully!');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully!');
        window.location.href = '/login';
    };

    const googleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            // Send idToken to backend
            const res = await api.post('/auth/firebase', { idToken });

            if (res.data.success) {
                const { token, user: userData } = res.data;
                login(token, userData);
            }
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            throw error; // Rethrow to be handled by UI
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading, googleSignIn }}>
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
