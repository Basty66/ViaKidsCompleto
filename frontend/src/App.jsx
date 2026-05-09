import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageTransition } from './components/ui/PageTransition';
import { SplashScreen } from './components/ui/SplashScreen';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagement } from './pages/UserManagement';
import { BusManagement } from './pages/BusManagement';
import { StudentManagement } from './pages/StudentManagement';
import { RouteManagement } from './pages/RouteManagement';
import { LiveTracking } from './pages/LiveTracking';
import { Notifications } from './pages/Notifications';
import { AttendanceReports } from './pages/AttendanceReports';
import { StudentQRViewer } from './pages/StudentQRViewer';
import { DriverDashboard } from './pages/DriverDashboard';
import { ParentDashboard } from './pages/ParentDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        const defaultRoutes = { admin: '/admin', driver: '/driver', parent: '/parent' };
        return <Navigate to={defaultRoutes[user.role] || '/'} replace />;
    }

    return children;
};

const AppContent = ({ splashDone }) => {
    const { user } = useAuth();

    return (
        <ErrorBoundary>
            <PageTransition>
                <Routes>
                    {!splashDone ? (
                        <Route path="*" element={<Navigate to="/" replace />} />
                    ) : user ? (
                        <>
                            <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                            <Route path="/admin/usuarios" element={<ProtectedRoute allowedRole="admin"><UserManagement /></ProtectedRoute>} />
                            <Route path="/admin/flota" element={<ProtectedRoute allowedRole="admin"><BusManagement /></ProtectedRoute>} />
                            <Route path="/admin/estudiantes" element={<ProtectedRoute allowedRole="admin"><StudentManagement /></ProtectedRoute>} />
                            <Route path="/admin/estudiantes/qr" element={<ProtectedRoute allowedRole="admin"><StudentQRViewer /></ProtectedRoute>} />
                            <Route path="/admin/rutas" element={<ProtectedRoute allowedRole="admin"><RouteManagement /></ProtectedRoute>} />
                            <Route path="/admin/tracking" element={<ProtectedRoute allowedRole="admin"><LiveTracking /></ProtectedRoute>} />
                            <Route path="/admin/notificaciones" element={<ProtectedRoute allowedRole="admin"><Notifications /></ProtectedRoute>} />
                            <Route path="/admin/reportes" element={<ProtectedRoute allowedRole="admin"><AttendanceReports /></ProtectedRoute>} />
                            <Route path="/driver" element={<ProtectedRoute allowedRole="driver"><DriverDashboard /></ProtectedRoute>} />
                            <Route path="/driver/asistencia" element={<ProtectedRoute allowedRole="driver"><DriverDashboard tab="asistencia" /></ProtectedRoute>} />
                            <Route path="/driver/incidencias" element={<ProtectedRoute allowedRole="driver"><DriverDashboard tab="incidencias" /></ProtectedRoute>} />
                            <Route path="/parent" element={<ProtectedRoute allowedRole="parent"><ParentDashboard /></ProtectedRoute>} />
                            <Route path="/parent/tracking" element={<ProtectedRoute allowedRole="parent"><ParentDashboard tab="tracking" /></ProtectedRoute>} />
                            <Route path="/parent/qr" element={<ProtectedRoute allowedRole="parent"><ParentDashboard tab="qr" /></ProtectedRoute>} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<LoginPage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </>
                    )}
                </Routes>
            </PageTransition>
        </ErrorBoundary>
    );
};

function App() {
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashComplete = useCallback(() => {
        setShowSplash(false);
    }, []);

    if (showSplash) {
        return (
            <ErrorBoundary>
                <SplashScreen onComplete={handleSplashComplete} />
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <ToastProvider>
                        <OfflineBanner />
                        <AppContent splashDone={!showSplash} />
                    </ToastProvider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
