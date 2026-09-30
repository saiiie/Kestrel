import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/api';
import { AuthContext } from './useAuth';

const storedProfile = user => ({ id: user.id, username: user.username, email: user.email });

function readSession() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        if (token && user?.id) return { token, user };
    } catch { /* Invalid cached data should not prevent opening the app. */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
}

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(readSession);
    const [loading, setLoading] = useState(() => Boolean(session.token));
    const navigate = useNavigate();
    const { token, user } = session;
    const userId = user?.id;

    useEffect(() => {
        if (!token || !userId) return;
        const controller = new AbortController();
        const refresh = async () => {
            try {
                const response = await fetch(apiUrl(`/api/users/${userId}`), {
                    headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
                });
                if (response.ok) {
                    const freshUser = await response.json();
                    if (controller.signal.aborted) return;
                    setSession({ token, user: freshUser });
                    localStorage.setItem('user', JSON.stringify(storedProfile(freshUser)));
                } else if (response.status === 401 || response.status === 403) {
                    if (controller.signal.aborted) return;
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setSession({ token: null, user: null });
                }
            } catch (error) {
                if (error.name !== 'AbortError') console.error('Failed to load profile');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        refresh();
        return () => controller.abort();
    }, [token, userId]);

    const authenticate = async (path, body) => {
        const response = await fetch(apiUrl(path), {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Authentication failed');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(storedProfile(data.user)));
        setSession({ token: data.token, user: data.user });
        navigate('/dashboard');
        return true;
    };
    const login = (email, password) => authenticate('/api/auth/login', { email, password });
    const register = (username, email, password, confirmPassword) =>
        authenticate('/api/auth/register', { username, email, password, confirmPassword });
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setSession({ token: null, user: null });
        setLoading(false);
        navigate('/');
    };
    const updateUser = fields => {
        setSession(previous => {
            const updated = { ...previous.user, ...fields };
            localStorage.setItem('user', JSON.stringify(storedProfile(updated)));
            return { ...previous, user: updated };
        });
    };
    return <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, loading }}>
        {!loading && children}
    </AuthContext.Provider>;
};
