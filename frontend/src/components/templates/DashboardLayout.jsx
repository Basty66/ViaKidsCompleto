import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Bus, Users, Map, LogOut, Menu, UserCircle, GraduationCap,
    Navigation, Bell, TrendingUp, QrCode, ClipboardCheck, AlertTriangle,
    MapPin, ChevronLeft, ChevronRight, Shield, Phone, Lock, X
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';

export const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [passwordModal, setPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [changingPassword, setChangingPassword] = useState(false);
    const { user, logout } = useAuth();
    const toast = useToast();
    const location = useLocation();

    const role = user?.role || 'admin';

    const handleResize = useCallback(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile) {
            setIsCollapsed(false);
            setIsSidebarOpen(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword.length < 6) { toast.warning('La nueva contraseña debe tener al menos 6 caracteres'); return; }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.warning('Las contraseñas no coinciden'); return; }
        setChangingPassword(true);
        try {
            await userService.changeOwnPassword(passwordForm.currentPassword, passwordForm.newPassword);
            toast.success('Contraseña actualizada correctamente');
            setPasswordModal(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Error al cambiar contraseña');
        }
        setChangingPassword(false);
    };

    const menuItems = {
        admin: [
            { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
            { icon: <Users size={20} />, label: 'Usuarios', path: '/admin/usuarios' },
            { icon: <Bus size={20} />, label: 'Flota', path: '/admin/flota' },
            { icon: <GraduationCap size={20} />, label: 'Estudiantes', path: '/admin/estudiantes' },
            { icon: <QrCode size={20} />, label: 'Códigos QR', path: '/admin/estudiantes/qr' },
            { icon: <Map size={20} />, label: 'Rutas', path: '/admin/rutas' },
            { icon: <Navigation size={20} />, label: 'Monitoreo', path: '/admin/tracking' },
            { icon: <Bell size={20} />, label: 'Notificaciones', path: '/admin/notificaciones' },
            { icon: <TrendingUp size={20} />, label: 'Reportes', path: '/admin/reportes' },
        ],
        driver: [
            { icon: <LayoutDashboard size={20} />, label: 'Mi Panel', path: '/driver' },
            { icon: <ClipboardCheck size={20} />, label: 'Asistencia QR', path: '/driver/asistencia' },
            { icon: <AlertTriangle size={20} />, label: 'Incidencias', path: '/driver/incidencias' },
        ],
        parent: [
            { icon: <LayoutDashboard size={20} />, label: 'Resumen', path: '/parent' },
            { icon: <MapPin size={20} />, label: 'Seguir Bus', path: '/parent/tracking' },
            { icon: <QrCode size={20} />, label: 'Mi QR', path: '/parent/qr' },
        ],
    };

    const roleLabels = { admin: 'Administrador', driver: 'Conductor', parent: 'Apoderado' };
    const roleIcons = { admin: <Shield size={16} />, driver: <Bus size={16} />, parent: <Phone size={16} /> };
    const currentMenu = menuItems[role] || [];

    return (
        <>
        <div className="h-screen w-full bg-slate-950 flex overflow-hidden font-sans text-slate-100">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-[50%] left-[50%] w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-[fadeIn_0.2s_ease-out]"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out flex flex-col
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
                    ${isCollapsed ? 'md:w-20' : 'md:w-64'}
                    w-72 max-w-[85vw] backdrop-blur-2xl bg-slate-900/90 border-r border-white/10 safe-left`}
            >
                {/* Logo */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-5 md:p-6 pb-4 border-b border-white/10 shrink-0`}>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
                        <Bus className="text-white" size={22} />
                    </div>
                    {!isCollapsed && (
                        <span className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">ViaKids</span>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1.5">
                    {currentMenu.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && item.path !== '/driver' && item.path !== '/parent' && location.pathname.startsWith(item.path));
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} w-full p-3 rounded-xl transition-all duration-200 group relative ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span className="shrink-0">{item.icon}</span>
                                {!isCollapsed && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-sm text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Collapse Toggle (Desktop Only) */}
                {!isMobile && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex items-center justify-center gap-2 mx-4 mb-2 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all shrink-0"
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                )}

                {/* User & Logout */}
                <div className={`p-4 border-t border-white/10 shrink-0 ${isCollapsed ? 'flex flex-col items-center gap-3' : ''}`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                                <UserCircle size={22} className="text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold truncate">{user?.name || roleLabels[role]}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                    {roleIcons[role]}
                                    <span>{roleLabels[role]}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setPasswordModal(true)}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} w-full p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 mb-1`}
                    >
                        <Lock size={16} />
                        {!isCollapsed && <span className="text-sm font-medium">Cambiar Contraseña</span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-red-500/10`}
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span className="text-sm font-semibold">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-14 md:h-16 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 md:px-6 z-30 safe-top shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors md:hidden touch-manipulation shrink-0"
                        >
                            <Menu size={22} />
                        </button>
                        <h2 className="text-xs md:text-sm text-slate-400 truncate">
                            {currentMenu.find(item => location.pathname === item.path)?.label || roleLabels[role]}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-xs text-slate-400">En línea</span>
                        </div>
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center md:hidden">
                            <UserCircle size={18} className="text-white" />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 safe-bottom">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>

            <Modal isOpen={passwordModal} onClose={() => { setPasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} title="Cambiar Contraseña">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 ml-1 mb-1 block">Contraseña Actual</label>
                        <input type="password" className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 ml-1 mb-1 block">Nueva Contraseña</label>
                        <input type="password" className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" placeholder="Mínimo 6 caracteres" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 ml-1 mb-1 block">Confirmar Nueva Contraseña</label>
                        <input type="password" className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                    </div>
                    <button onClick={handleChangePassword} disabled={changingPassword} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all btn-ripple">
                        {changingPassword ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Actualizando...</> : <><Lock size={18} /> Cambiar Contraseña</>}
                    </button>
                </div>
            </Modal>
        </>
    );
};
