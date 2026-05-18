import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async (authToken, userId) => {
            try {
                const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (response.ok) {
                    const freshUser = await response.json();
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                }
            } catch (error) {
                console.error("Failed to load user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            localStorage.setItem('token', token);
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // Fetch fresh details from DB to get the latest webhook
                fetchUserProfile(token, parsedUser.id);
            } else {
                setLoading(false);
            }
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
            return true;
        } else {
            throw new Error(data.error || 'Login failed');
        }
    };

    const register = async (username, email, password, confirmPassword) => {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, confirmPassword }),
        });
        const data = await response.json();
        if (response.ok) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashboard');
            return true;
        } else {
            throw new Error(data.error || 'Registration failed');
        }
    };

    const logout = () => {
        navigate('/');
        setTimeout(() => {
            setToken(null);
            setUser(null);
        }, 50);
    };

    const updateUser = (newUserFields) => {
        setUser(prev => {
            const updated = { ...prev, ...newUserFields };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
