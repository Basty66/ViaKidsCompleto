import { createContext, useContext, useState, useEffect } from 'react';

const AUTH_VERSION = 'v3';
const TOKEN_KEY = `viakids_token_${AUTH_VERSION}`;
const ROLE_KEY = `viakids_role_${AUTH_VERSION}`;
const NAME_KEY = `viakids_name_${AUTH_VERSION}`;
const ID_KEY = `viakids_id_${AUTH_VERSION}`;
const SPLASH_KEY = 'viakids_splash_seen';

const cleanOldStorage = () => {
    const oldKeys = ['token', 'userRole', 'userName', 'viakids_token_v2', 'viakids_role_v2', 'viakids_name_v2'];
    oldKeys.forEach(k => localStorage.removeItem(k));
};

// Read auth state synchronously from localStorage
const getInitialUser = () => {
    cleanOldStorage();
    const token = localStorage.getItem(TOKEN_KEY);
    const role = localStorage.getItem(ROLE_KEY);
    const name = localStorage.getItem(NAME_KEY);
    const id = localStorage.getItem(ID_KEY);

    if (token && role) {
        return { token, role, name: name || role, id: id || null };
    }
    return null;
};

const AuthContext = createContext(null);

export const getStorageKeys = () => ({ TOKEN_KEY, ROLE_KEY, NAME_KEY });

export const AuthProvider = ({ children }) => {
    // Initialize synchronously — no white screen gap
    const [user, setUser] = useState(getInitialUser);

    const login = (userData) => {
        localStorage.setItem(TOKEN_KEY, userData.token);
        localStorage.setItem(ROLE_KEY, userData.role);
        if (userData.name) localStorage.setItem(NAME_KEY, userData.name);
        if (userData.id) localStorage.setItem(ID_KEY, userData.id);
        setUser({ token: userData.token, role: userData.role, name: userData.name || userData.role, id: userData.id || null });
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
        localStorage.removeItem(NAME_KEY);
        localStorage.removeItem(ID_KEY);
        setUser(null);
    };

    // Double-check storage on mount (for cases where browser restored state)
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        const role = localStorage.getItem(ROLE_KEY);
        const name = localStorage.getItem(NAME_KEY);
        const id = localStorage.getItem(ID_KEY);

        if (token && role) {
            setUser({ token, role, name: name || role, id: id || null });
        } else {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const hasSeenSplash = () => localStorage.getItem(SPLASH_KEY) === 'true';

export const markSplashSeen = () => localStorage.setItem(SPLASH_KEY, 'true');
