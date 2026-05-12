import { apiService } from './api';

const STORAGE_KEY = 'viakids_attendance';

const initialRecords = [
    { id: 'A001', studentId: 'S01', studentName: 'Mateo García', busId: 'B01', busPatente: 'AB-1234', route: 'Ruta Norte', timestamp: '2026-05-06T07:15:00', action: 'boarded', tripType: 'morning' },
    { id: 'A002', studentId: 'S02', studentName: 'Sofía Rodríguez', busId: 'B01', busPatente: 'AB-1234', route: 'Ruta Norte', timestamp: '2026-05-06T07:18:00', action: 'boarded', tripType: 'morning' },
    { id: 'A003', studentId: 'S03', studentName: 'Lucas Martínez', busId: 'B03', busPatente: 'EF-9012', route: 'Ruta Sur', timestamp: '2026-05-06T07:22:00', action: 'absent', tripType: 'morning' },
    { id: 'A004', studentId: 'S01', studentName: 'Mateo García', busId: 'B01', busPatente: 'AB-1234', route: 'Ruta Norte', timestamp: '2026-05-06T16:05:00', action: 'disembarked', tripType: 'afternoon' },
];

const safeLocal = {
    getItem: (k) => { try { return localStorage.getItem(k) } catch(e) { return null } },
    setItem: (k, v) => { try { localStorage.setItem(k, v) } catch(e) {} },
};

const getLocalDb = () => {
    const data = safeLocal.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initialRecords;
};

const saveLocalDb = (data) => safeLocal.setItem(STORAGE_KEY, JSON.stringify(data));

const todayPrefix = () => new Date().toISOString().split('T')[0];

export const attendanceService = {
    getAll: async () => {
        try {
            return await apiService.getAttendance({});
        } catch {
            return new Promise(r => setTimeout(() => r(getLocalDb()), 300));
        }
    },

    scanQR: async (qrData, action = 'boarded') => {
        try {
            const backendAction = { boarded: 'BOARDED', disembarked: 'DISEMBARKED', absent: 'ABSENT' }[action] || 'BOARDED';
            const result = await apiService.scanQR({ qrData, action: backendAction });
            return {
                success: result.success,
                data: result.data,
                studentStatus: result.data?.action === 'BOARDED' ? 'En el bus' : result.data?.action === 'DISEMBARKED' ? 'Entregado' : 'Ausente',
            };
        } catch {
            return new Promise(resolve => {
                const db = getLocalDb();
                const record = {
                    id: `A${Date.now()}`,
                    studentId: qrData.id,
                    studentName: qrData.nombre,
                    busId: qrData.busId || '',
                    busPatente: qrData.bus || 'N/A',
                    route: qrData.ruta || 'N/A',
                    timestamp: new Date().toISOString(),
                    action,
                    tripType: new Date().getHours() < 14 ? 'morning' : 'afternoon',
                };
                db.push(record);
                saveLocalDb(db);
                const studentStatus = action === 'boarded' ? 'En el bus' : action === 'disembarked' ? 'Entregado' : 'Ausente';
                resolve({ success: true, data: record, studentStatus });
            });
        }
    },

    getStudentStatus: async (studentId) => {
        try {
            const records = await apiService.getStudentAttendance(studentId);
            const today = todayPrefix();
            const todayRecords = records
                .filter(r => r.timestamp && r.timestamp.startsWith(today))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            if (todayRecords.length === 0) {
                return { status: 'Sin registro', lastAction: null, lastTime: null };
            }
            const latest = todayRecords[0];
            const statusMap = { BOARDED: 'En el bus', DISEMBARKED: 'Entregado', ABSENT: 'Ausente' };
            return {
                status: statusMap[latest.action] || 'Desconocido',
                lastAction: latest.action,
                lastTime: new Date(latest.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
                record: latest,
            };
        } catch {
            return new Promise(resolve => {
                const db = getLocalDb();
                const today = todayPrefix();
                const todayRecords = db
                    .filter(r => r.studentId === studentId && r.timestamp.startsWith(today))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                if (todayRecords.length === 0) {
                    resolve({ status: 'Sin registro', lastAction: null, lastTime: null });
                    return;
                }
                const latest = todayRecords[0];
                const statusMap = { boarded: 'En el bus', disembarked: 'Entregado', absent: 'Ausente' };
                resolve({
                    status: statusMap[latest.action] || 'Desconocido',
                    lastAction: latest.action,
                    lastTime: new Date(latest.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
                    record: latest,
                });
            });
        }
    },

    getByStudent: async (studentId) => {
        try {
            return await apiService.getStudentAttendance(studentId);
        } catch {
            return new Promise(resolve => {
                const db = getLocalDb();
                const records = db.filter(r => r.studentId === studentId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                resolve(records);
            });
        }
    },

    getByBus: async (busId) => {
        try {
            const records = await apiService.getAttendance({ busId });
            return records;
        } catch {
            return new Promise(resolve => {
                const db = getLocalDb();
                const records = db.filter(r => r.busId === busId && r.timestamp.startsWith(todayPrefix())).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                resolve(records);
            });
        }
    },

    getTodaySummary: async () => {
        try {
            const result = await apiService.getAttendanceSummaryToday();
            return result;
        } catch {
            return new Promise(resolve => {
                const db = getLocalDb();
                const todayRecords = db.filter(r => r.timestamp.startsWith(todayPrefix()));
                const boarded = todayRecords.filter(r => r.action === 'boarded').length;
                const disembarked = todayRecords.filter(r => r.action === 'disembarked').length;
                const absent = todayRecords.filter(r => r.action === 'absent').length;
                resolve({ boarded, disembarked, absent, total: todayRecords.length });
            });
        }
    },
};
