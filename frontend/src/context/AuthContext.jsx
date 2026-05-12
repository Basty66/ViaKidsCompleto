import { createContext, useContext, useState, useEffect } from 'react';

const AUTH_VERSION = 'v3';
const TOKEN_KEY = `viakids_token_${AUTH_VERSION}`;
const ROLE_KEY = `viakids_role_${AUTH_VERSION}`;
const NAME_KEY = `viakids_name_${AUTH_VERSION}`;
const ID_KEY = `viakids_id_${AUTH_VERSION}`;
const SPLASH_KEY = 'viakids_splash_seen';

const safeLocal = {
    getItem: (k) => { try { return localStorage.getItem(k) } catch(e) { return null } },
    setItem: (k, v) => { try { localStorage.setItem(k, v) } catch(e) {} },
    removeItem: (k) => { try { localStorage.removeItem(k) } catch(e) {} },
};

const cleanOldStorage = () => {
    const oldKeys = ['token', 'userRole', 'userName', 'viakids_token_v2', 'viakids_role_v2', 'viakids_name_v2'];
    oldKeys.forEach(k => safeLocal.removeItem(k));
};

// Read auth state synchronously from localStorage
const getInitialUser = () => {
    cleanOldStorage();
    const token = safeLocal.getItem(TOKEN_KEY);
    const role = safeLocal.getItem(ROLE_KEY);
    const name = safeLocal.getItem(NAME_KEY);
    const id = safeLocal.getItem(ID_KEY);

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
        safeLocal.setItem(TOKEN_KEY, userData.token);
        safeLocal.setItem(ROLE_KEY, userData.role);
        if (userData.name) safeLocal.setItem(NAME_KEY, userData.name);
        if (userData.id) safeLocal.setItem(ID_KEY, userData.id);
        setUser({ token: userData.token, role: userData.role, name: userData.name || userData.role, id: userData.id || null });
    };

    const logout = () => {
        safeLocal.removeItem(TOKEN_KEY);
        safeLocal.removeItem(ROLE_KEY);
        safeLocal.removeItem(NAME_KEY);
        safeLocal.removeItem(ID_KEY);
        setUser(null);
    };

    // Double-check storage on mount (for cases where browser restored state)
    useEffect(() => {
        const token = safeLocal.getItem(TOKEN_KEY);
        const role = safeLocal.getItem(ROLE_KEY);
        const name = safeLocal.getItem(NAME_KEY);
        const id = safeLocal.getItem(ID_KEY);

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

export const hasSeenSplash = () => safeLocal.getItem(SPLASH_KEY) === 'true';

export const markSplashSeen = () => safeLocal.setItem(SPLASH_KEY, 'true');
