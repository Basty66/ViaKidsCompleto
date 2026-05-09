import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { MapPin, Bus, Bell, QrCode, Clock, CheckCircle, AlertTriangle, Navigation, Phone, User, GraduationCap, Shield, Heart, Map, Maximize2, ScanLine } from 'lucide-react';
import { BusMap } from '../components/ui/BusMap';
import { QRCodeGenerator } from '../components/ui/QRCodeGenerator';
import { Modal } from '../components/ui/Modal';
import { StatCard } from '../components/ui/StatCard';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { attendanceService } from '../services/attendanceService';

const statusConfig = {
    'En el bus': { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: <Bus size={24} />, label: 'Abordó el bus', badge: 'EN RUTA' },
    'Entregado': { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle size={24} />, label: 'Llegó sano y salvo', badge: 'ENTREGADO' },
    'Ausente': { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: <AlertTriangle size={24} />, label: 'No abordó hoy', badge: 'AUSENTE' },
    'En espera': { color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: <Clock size={24} />, label: 'Esperando el bus', badge: 'ESPERANDO' },
};

const routeStops = [
    { time: '07:15', label: 'Parada 1 - Tu casa', status: 'completed' },
    { time: '07:25', label: 'Parada 2 - Av. Principal', status: 'completed' },
    { time: '07:35', label: 'Parada 3 - Plaza Central', status: 'current' },
    { time: '07:50', label: 'Parada 4 - Colegio', status: 'pending' },
];

export const ParentDashboard = ({ tab }) => {
    const [student, setStudent] = useState(null);
    const [busLocation, setBusLocation] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [studentStatus, setStudentStatus] = useState({ status: 'Sin registro', lastAction: null, lastTime: null });
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isQRFULLScreen, setIsQRFULLScreen] = useState(false);
    const [qrSize, setQrSize] = useState(250);
    const qrContainerRef = useRef(null);
    const studentRef = useRef(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [showEmergency, setShowEmergency] = useState(false);
    const [activeSection, setActiveSection] = useState('status');
    const { user } = useAuth();
    const toast = useToast();

    const { connected, publish } = useWebSocket({
        onNotification: (data) => {
            const targetRoles = (data.targetRoles || '').split(',');
            if (!data.targetRoles || targetRoles.includes('PARENT') || targetRoles.includes('ALL')) {
                setNotifications(prev => [{
                    id: data.id || Date.now(),
                    fecha: 'Justo ahora',
                    tipo: data.tipo || 'INFO',
                    mensaje: data.mensaje || data.message || JSON.stringify(data),
                    ruta: data.ruta || 'Sistema',
                    senderName: data.senderName,
                    senderRole: data.senderRole,
                    leido: false,
                }, ...prev]);
            }
        },
    });

    const loadStudentData = (studentData) => {
        studentRef.current = studentData;
        setStudent(studentData);
        attendanceService.getStudentStatus(studentData.id).then(setStudentStatus);
        attendanceService.getByStudent(studentData.id).then(setAttendanceHistory);
    };

    useEffect(() => {
        const parentId = user?.id;
        if (parentId) {
            apiService.getStudentsByParent(parentId).then(students => {
                if (students && students.length > 0) loadStudentData(students[0]);
            }).catch(() => {
                apiService.getStudents().then(students => {
                    const myStudent = students.find(s =>
                        s.apoderado?.toLowerCase().includes(user?.name?.toLowerCase().split(' ')[0] || '')
                    ) || students[0];
                    if (myStudent) loadStudentData(myStudent);
                }).catch(() => {});
            });
        } else {
            apiService.getStudents().then(students => {
                const userNombre = user?.name?.toLowerCase() || '';
                const myStudent = students.find(s =>
                    s.apoderado?.toLowerCase().includes(userNombre) ||
                    s.apoderado?.toLowerCase().includes(userNombre.split(' ')[0])
                ) || students[0];
                if (myStudent) loadStudentData(myStudent);
            }).catch(() => {});
        }
        apiService.getNotifications().then(list => {
            const filtered = list.filter(n => {
                const roles = (n.targetRoles || '').split(',');
                return !n.targetRoles || roles.includes('PARENT') || roles.includes('ALL');
            });
            setNotifications(filtered);
        }).catch(() => {});

        // Real bus location polling from backend
        const busInterval = setInterval(() => {
            const currentStudent = studentRef.current;
            if (currentStudent?.busId) {
                apiService.getBus(currentStudent.busId).then(bus => {
                    if (bus.lat && bus.lng) {
                        setBusLocation({ lat: bus.lat, lng: bus.lng });
                    }
                }).catch(() => {});
            }
        }, 10000);
        return () => clearInterval(busInterval);
    }, [user?.name]);

    const handleEmergencyCall = () => {
        toast.warning('Contactando al conductor...', 3000);
        setShowEmergency(false);
    };

    const showTracking = tab === 'tracking';
    const showQR = tab === 'qr';

    useEffect(() => {
        if (showQR) setActiveSection('qr');
    }, [showQR]);

    useEffect(() => {
        const updateQrSize = () => {
            setQrSize(Math.min(window.innerWidth - 80, 320));
        };
        updateQrSize();
        window.addEventListener('resize', updateQrSize);
        return () => window.removeEventListener('resize', updateQrSize);
    }, [isQRFULLScreen]);

    const qrData = student ? {
        id: student.id,
        nombre: student.nombre,
        rut: student.rut || '',
        curso: student.curso,
        colegio: student.colegio,
        busPatente: student.busPatente || '',
        ruta: student.ruta || '',
        apoderado: student.apoderado || '',
        telefono: student.telefono || '',
    } : null;

    return (
        <DashboardLayout>
            <div className="space-y-4 md:space-y-6 animate-fade-in">
                {/* Student Header */}
                {student && (
                    <div className="glass p-4 md:p-8 rounded-3xl animate-fade-in-up">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/20 shrink-0">
                                <GraduationCap className="text-white" size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg md:text-2xl font-bold text-white truncate">{student.nombre}</h1>
                                <p className="text-slate-400 text-sm">{student.curso} — {student.colegio}</p>
                                {student.rut && <p className="text-slate-500 text-xs mt-0.5">RUT: {student.rut}</p>}
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsQRModalOpen(true)}
                                    className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white px-3 md:px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all btn-ripple text-sm"
                                >
                                    <QrCode size={18} /> <span className="hidden sm:inline">Ver QR</span>
                                </button>
                                <button
                                    onClick={() => setShowEmergency(true)}
                                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all btn-ripple text-sm animate-bounce-subtle"
                                >
                                    <Shield size={18} /> <span className="hidden sm:inline">Emergencia</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Banner */}
                {student && studentStatus.status && (
                    <div className={`border rounded-2xl p-4 md:p-5 flex items-center gap-4 animate-fade-in-up ${statusConfig[studentStatus.status]?.bg || 'bg-slate-500/10 border-slate-500/20'}`}>
                        <div className={`${statusConfig[studentStatus.status]?.color || 'text-slate-400'} shrink-0`}>
                            {statusConfig[studentStatus.status]?.icon || <Clock size={24} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-base md:text-lg font-bold truncate ${statusConfig[studentStatus.status]?.color || 'text-slate-400'}`}>
                                {statusConfig[studentStatus.status]?.label || studentStatus.status}
                            </p>
                            {studentStatus.lastTime && (
                                <p className="text-slate-400 text-xs md:text-sm">Último registro: {studentStatus.lastTime}</p>
                            )}
                        </div>
                        {studentStatus.status === 'En el bus' && (
                            <div className="bg-blue-600 text-white px-3 py-2 rounded-xl text-xs md:text-sm font-bold animate-pulse shadow-lg shadow-blue-600/30 shrink-0">
                                EN RUTA
                            </div>
                        )}
                        {studentStatus.status === 'Entregado' && (
                            <div className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 shrink-0">
                                <Heart size={14} /> SEGURO
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Navigation Tabs (Mobile) */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 md:hidden">
                    {[
                        { key: 'status', label: 'Estado', icon: <Clock size={16} /> },
                        { key: 'qr', label: 'QR', icon: <QrCode size={16} /> },
                        { key: 'tracking', label: 'Mapa', icon: <MapPin size={16} /> },
                        { key: 'history', label: 'Historial', icon: <Bell size={16} /> },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveSection(t.key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                activeSection === t.key
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* QR Section — Prominent for driver scanning */}
                {(activeSection === 'qr' || showQR) && student && qrData && (
                    <div className="glass rounded-3xl overflow-hidden animate-fade-in-up">
                        <div className="p-4 md:p-6 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                                    <QrCode className="text-purple-400" size={20} /> Código QR del Estudiante
                                </h2>
                                <button
                                    onClick={() => setIsQRFULLScreen(true)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                    title="Pantalla completa"
                                >
                                    <Maximize2 size={18} />
                                </button>
                            </div>
                            <p className="text-slate-400 text-xs md:text-sm mt-1">Muestra este código al conductor para escanear</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-6 md:p-10 bg-gradient-to-b from-purple-500/5 to-transparent">
                            <div className="bg-white p-4 md:p-6 rounded-3xl shadow-2xl shadow-purple-500/10">
                                <QRCodeGenerator studentData={qrData} size={220} />
                            </div>
                            <div className="mt-4 md:mt-6 text-center space-y-2">
                                <p className="text-white font-bold text-lg md:text-xl">{student.nombre}</p>
                                <p className="text-slate-400 text-sm">{student.curso} — {student.colegio}</p>
                                <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                                    {student.busPatente && (
                                        <span className="flex items-center gap-1"><Bus size={12} /> {student.busPatente}</span>
                                    )}
                                    {student.ruta && (
                                        <span className="flex items-center gap-1"><Map size={12} /> {student.ruta}</span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 md:mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 max-w-sm">
                                <p className="text-blue-400 text-xs flex items-center gap-2 justify-center">
                                    <ScanLine size={14} /> El conductor escaneará este código al subir y bajar del bus
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Map Tracking */}
                {(activeSection === 'tracking' || showTracking) && student && (studentStatus.status === 'En el bus' || showTracking) && (
                    <div className="glass rounded-3xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="p-4 md:p-5 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                                <MapPin className="text-blue-400" size={18} /> Ubicación del Bus
                            </h2>
                            {student.busPatente && (
                                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs md:text-sm font-bold border border-blue-500/20">
                                    {student.busPatente}
                                </span>
                            )}
                        </div>
                        <BusMap
                            center={busLocation ? [busLocation.lat, busLocation.lng] : [-33.4489, -70.6693]}
                            zoom={14}
                            markers={busLocation ? [{
                                position: [busLocation.lat, busLocation.lng],
                                color: '#3b82f6',
                                popup: (
                                    <>
                                        <p className="font-bold">Bus {student.busPatente}</p>
                                        <p className="text-xs">{student.ruta}</p>
                                    </>
                                ),
                            }] : []}
                            height="350px"
                            className="md:h-[450px]"
                        />
                        <div className="p-3 md:p-4 bg-slate-900/50 flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
                            <div className="flex items-center gap-1.5 text-slate-300"><Navigation size={14} className="text-blue-400" /> <span>Bus en movimiento</span></div>
                            <div className="flex items-center gap-1.5 text-slate-300"><Clock size={14} className="text-amber-400" /> <span>ETA: ~15 min</span></div>
                            <div className="flex items-center gap-1.5 text-slate-300"><Map size={14} className="text-emerald-400" /> <span>{student.colegio}</span></div>
                        </div>
                    </div>
                )}

                {/* Route Timeline */}
                {(activeSection === 'tracking' || studentStatus.status === 'En el bus') && (
                    <div className="glass p-4 md:p-6 rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                            <Map size={18} className="text-emerald-400" /> Progreso de la Ruta
                        </h2>
                        <div className="space-y-0">
                            {routeStops.map((stop, i) => (
                                <div key={i} className="flex gap-3 md:gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 shrink-0 ${stop.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : stop.status === 'current' ? 'bg-blue-500 border-blue-500 animate-pulse' : 'bg-slate-700 border-slate-600'}`} />
                                        {i < routeStops.length - 1 && (
                                            <div className={`w-0.5 h-8 md:h-12 ${stop.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                                        )}
                                    </div>
                                    <div className="pb-6 md:pb-8">
                                        <p className={`text-xs md:text-sm font-bold ${stop.status === 'completed' ? 'text-emerald-400' : stop.status === 'current' ? 'text-blue-400' : 'text-slate-500'}`}>
                                            {stop.label}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">{stop.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
                    <StatCard label="Ruta" value={student?.ruta || '—'} icon={<Navigation size={16} />} color="text-blue-400" bg="bg-blue-500/20" subtitle={student?.colegio} />
                    <StatCard label="Bus" value={student?.busPatente || '—'} icon={<Bus size={16} />} color="text-emerald-400" bg="bg-emerald-500/20" subtitle="Capacidad: 40" />
                    <StatCard label="Horario" value="07:30" icon={<Clock size={16} />} color="text-amber-400" bg="bg-amber-500/20" subtitle="AM" />
                </div>

                {/* Attendance History */}
                {(activeSection === 'history') && (
                    <div className="glass p-4 md:p-6 rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-purple-400" /> Historial Reciente
                        </h2>
                        <div className="space-y-2 md:space-y-3">
                            {attendanceHistory.slice(0, 5).map((record, i) => (
                                <div key={record.id} className="flex items-center justify-between bg-slate-900/40 p-3 md:p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                            <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${['boarded', 'BOARDED'].includes(record.action) ? 'bg-blue-500/20 text-blue-400' : ['disembarked', 'DISEMBARKED'].includes(record.action) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {['boarded', 'BOARDED'].includes(record.action) ? <CheckCircle size={14} /> : ['disembarked', 'DISEMBARKED'].includes(record.action) ? <MapPin size={14} /> : <AlertTriangle size={14} />}
                                            </div>
                                        <div className="min-w-0">
                                            <p className="text-white text-xs md:text-sm font-medium">{['boarded', 'BOARDED'].includes(record.action) ? 'Abordó' : ['disembarked', 'DISEMBARKED'].includes(record.action) ? 'Entregado' : 'Ausente'}</p>
                                            <p className="text-slate-500 text-[10px] md:text-xs truncate">{record.route} — {record.busPatente}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-slate-300 text-[10px] md:text-sm">{new Date(record.timestamp).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}</p>
                                        <p className="text-slate-500 text-[10px]">{new Date(record.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notifications */}
                {activeSection === 'status' && !showTracking && (
                    <div className="glass p-4 md:p-6 rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <h2 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Bell size={18} className="text-amber-400" /> Notificaciones
                        </h2>
                        <div className="space-y-2 md:space-y-3">
                            {notifications.slice(0, 3).map((notif) => (
                                <div key={notif.id} className={`p-3 md:p-4 rounded-xl border transition-all ${notif.leido ? 'bg-slate-900/30 border-white/5' : 'bg-blue-500/5 border-blue-500/20'}`}>
                                    <div className="flex items-start gap-2 md:gap-3">
                                        <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${['ALERTA', 'Alerta'].includes(notif.tipo) ? 'bg-amber-500/20 text-amber-400' : ['URGENTE', 'Urgente'].includes(notif.tipo) ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {['URGENTE', 'Urgente'].includes(notif.tipo) ? <AlertTriangle size={14} /> : <Bell size={14} />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white text-xs md:text-sm">{notif.mensaje}</p>
                                            <p className="text-slate-500 text-[10px] md:text-xs mt-1">{notif.fecha}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* QR Modal */}
            <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} title="Código QR del Estudiante">
                {student && (
                    <div className="space-y-4 md:space-y-6">
                        <QRCodeGenerator studentData={student} size={220} />
                        <div className="bg-slate-900/50 p-3 md:p-4 rounded-xl border border-white/10 space-y-1.5 md:space-y-2 text-sm">
                            <p className="text-white font-bold text-lg">{student.nombre}</p>
                            <p className="text-slate-400 text-xs md:text-sm">RUT: {student.rut || 'N/A'}</p>
                            <p className="text-slate-400 text-xs md:text-sm">Curso: {student.curso}</p>
                            <p className="text-slate-400 text-xs md:text-sm">Bus: {student.busPatente || 'Sin asignar'}</p>
                            <p className="text-slate-400 text-xs md:text-sm">Ruta: {student.ruta || 'Sin asignar'}</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                            <p className="text-amber-400 text-xs flex items-center gap-2">
                                <AlertTriangle size={14} /> Este código se escanea al subir y bajar del bus
                            </p>
                        </div>
                        <button
                            onClick={() => { setIsQRModalOpen(false); setIsQRFULLScreen(true); }}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all btn-ripple"
                        >
                            <Maximize2 size={18} /> Ver en Pantalla Completa
                        </button>
                    </div>
                )}
            </Modal>

            {/* Fullscreen QR Overlay */}
            {isQRFULLScreen && qrData && (
                <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center animate-fade-in">
                    {/* Close button */}
                    <button
                        onClick={() => setIsQRFULLScreen(false)}
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>

                    {/* Student info */}
                    <div className="text-center mb-6 md:mb-8 animate-fade-in-down">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-blue-500/30">
                            <GraduationCap className="text-white" size={32} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">{student?.nombre}</h2>
                        <p className="text-slate-400 text-sm md:text-base mt-1">{student?.curso} — {student?.colegio}</p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl shadow-purple-500/20 animate-scale-in">
                        <QRCodeGenerator studentData={qrData} size={qrSize} />
                    </div>

                    {/* Bottom info */}
                    <div className="mt-6 md:mt-8 text-center space-y-3 animate-fade-in-up px-4">
                        <div className="flex items-center justify-center gap-4 text-xs md:text-sm text-slate-400">
                            {student?.busPatente && (
                                <span className="flex items-center gap-1.5"><Bus size={14} /> {student.busPatente}</span>
                            )}
                            {student?.ruta && (
                                <span className="flex items-center gap-1.5"><Map size={14} /> {student.ruta}</span>
                            )}
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 max-w-md">
                            <p className="text-blue-400 text-xs md:text-sm flex items-center gap-2 justify-center">
                                <ScanLine size={14} /> El conductor escaneará este código al subir y bajar del bus
                            </p>
                        </div>
                    </div>

                    {/* Brightness hint */}
                    <p className="absolute bottom-6 md:bottom-8 text-slate-500 text-xs animate-pulse">
                        Sube el brillo de tu pantalla para facilitar la lectura
                    </p>
                </div>
            )}

            {/* Emergency Modal */}
            <Modal isOpen={showEmergency} onClose={() => setShowEmergency(false)} title="Contacto de Emergencia">
                <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Shield size={40} className="text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">¿Necesitas contactar al conductor?</h3>
                        <p className="text-slate-400 text-sm">Puedes llamar directamente al conductor del bus de {student?.nombre}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10">
                        <p className="text-white font-bold">Juan Pérez</p>
                        <p className="text-slate-400 text-sm">Conductor — Bus {student?.busPatente}</p>
                        <p className="text-blue-400 font-bold mt-2">+56 9 1234 5678</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowEmergency(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-xl text-white font-bold transition-all">
                            Cancelar
                        </button>
                        <button onClick={handleEmergencyCall} className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all btn-ripple">
                            <Phone size={18} /> Llamar
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};
