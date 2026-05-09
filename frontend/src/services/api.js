import api from '../api/axiosConfig';

export { api };

export const apiService = {
    login: (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
    register: (data) => api.post('/auth/register', data).then(r => r.data),
    getProfile: () => api.get('/auth/me').then(r => r.data),

    getUsers: () => api.get('/users').then(r => r.data),
    createUser: (data) => api.post('/users', data).then(r => r.data),
    updateUser: (id, data) => api.put(`/users/${id}`, data).then(r => r.data),
    deleteUser: (id) => api.delete(`/users/${id}`).then(r => r.data),

    getStudents: () => api.get('/students').then(r => r.data),
    getStudent: (id) => api.get(`/students/${id}`).then(r => r.data),
    createStudent: (data) => api.post('/students', data).then(r => r.data),
    updateStudent: (id, data) => api.put(`/students/${id}`, data).then(r => r.data),
    deleteStudent: (id) => api.delete(`/students/${id}`).then(r => r.data),
    getStudentQR: (id) => api.get(`/students/${id}/qr`).then(r => r.data),
    getStudentsByParent: (parentId) => api.get(`/students/by-parent/${parentId}`).then(r => r.data),

    getBuses: () => api.get('/buses').then(r => r.data),
    getBus: (id) => api.get(`/buses/${id}`).then(r => r.data),
    createBus: (data) => api.post('/buses', data).then(r => r.data),
    updateBus: (id, data) => api.put(`/buses/${id}`, data).then(r => r.data),
    deleteBus: (id) => api.delete(`/buses/${id}`).then(r => r.data),
    getBusLocation: (id) => api.get(`/buses/${id}/location`).then(r => r.data),

    getRoutes: () => api.get('/routes').then(r => r.data),
    getRoute: (id) => api.get(`/routes/${id}`).then(r => r.data),
    createRoute: (data) => api.post('/routes', data).then(r => r.data),
    updateRoute: (id, data) => api.put(`/routes/${id}`, data).then(r => r.data),
    deleteRoute: (id) => api.delete(`/routes/${id}`).then(r => r.data),

    scanQR: (data) => api.post('/attendance/scan', data).then(r => r.data),
    getAttendance: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/attendance?${params}`).then(r => r.data);
    },
    getStudentAttendance: (studentId) => api.get(`/attendance/student/${studentId}`).then(r => r.data),

    getNotifications: () => api.get('/notifications').then(r => r.data),
    createNotification: (data) => api.post('/notifications', data).then(r => r.data),
    markNotificationRead: (id) => api.put(`/notifications/${id}/read`).then(r => r.data),
    getPresets: () => api.get('/notifications/presets').then(r => r.data),
    sendPreset: (data) => api.post('/notifications/preset', data).then(r => r.data),

    getIncidents: () => api.get('/incidents').then(r => r.data),
    createIncident: (data) => api.post('/incidents', data).then(r => r.data),

    getAttendanceSummaryToday: () => api.get('/attendance/summary/today').then(r => r.data),

    getAttendanceReport: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/reports/attendance?${params}`).then(r => r.data);
    },
};

export const mockApi = {
    login: async (email, password) => {
        await new Promise(r => setTimeout(r, 800));
        const accounts = {
            'admin@viakids.cl': { role: 'admin', name: 'Administrador', fullName: 'Admin ViaKids' },
            'conductor@viakids.cl': { role: 'driver', name: 'Conductor', fullName: 'Juan Pérez' },
            'apoderado@viakids.cl': { role: 'parent', name: 'Apoderado', fullName: 'Carlos Ruiz' },
        };
        const account = accounts[email.toLowerCase()];
        if (!account) throw new Error('Correo no registrado en el sistema');
        if (!password || password.length < 6) throw new Error('Contraseña incorrecta');
        return { token: `fake-jwt-${Date.now()}-${account.role}`, role: account.role, name: account.fullName };
    },
    getStudents: async () => {
        await new Promise(r => setTimeout(r, 300));
        return [
            { id: 'S01', nombre: 'Mateo García', curso: '4to B', rut: '20.123.456-7', apoderado: 'Carlos García', telefono: '+56912345678', busId: 'B01', busPatente: 'AB-1234', ruta: 'Ruta Norte', colegio: 'Colegio Los Andes', estado: 'En espera' },
            { id: 'S02', nombre: 'Sofía Rodríguez', curso: '2do A', rut: '21.234.567-8', apoderado: 'María Rodríguez', telefono: '+56987654321', busId: 'B01', busPatente: 'AB-1234', ruta: 'Ruta Norte', colegio: 'Colegio Los Andes', estado: 'En espera' },
            { id: 'S03', nombre: 'Lucas Martínez', curso: '3ro C', rut: '20.345.678-9', apoderado: 'Pedro Martínez', telefono: '+56911223344', busId: 'B03', busPatente: 'EF-9012', ruta: 'Ruta Sur', colegio: 'Colegio Santiago', estado: 'En espera' },
        ];
    },
    getBuses: async () => {
        await new Promise(r => setTimeout(r, 300));
        return [
            { id: 'B01', patente: 'AB-1234', conductor: 'Juan Pérez', capacidad: 40, estado: 'En Ruta', tiempoEstimado: '15 min', lat: -33.4489, lng: -70.6693 },
            { id: 'B02', patente: 'CD-5678', conductor: 'Ana López', capacidad: 35, estado: 'En Espera', tiempoEstimado: '--', lat: -33.4560, lng: -70.6500 },
            { id: 'B03', patente: 'EF-9012', conductor: 'Carlos Ruiz', capacidad: 45, estado: 'En Ruta', tiempoEstimado: '30 min', lat: -33.4400, lng: -70.6800 },
        ];
    },
    getRoutes: async () => {
        await new Promise(r => setTimeout(r, 300));
        return [
            { id: 'R01', nombre: 'Ruta Norte', colegio: 'Colegio Los Andes', busId: 'B01', horario: '07:30', paradas: 8 },
            { id: 'R02', nombre: 'Ruta Sur', colegio: 'Colegio Santiago', busId: 'B03', horario: '08:00', paradas: 6 },
        ];
    },
    getUsers: async () => {
        await new Promise(r => setTimeout(r, 300));
        return [
            { id: 1, nombre: 'Juan Pérez', email: 'juan@viakids.cl', rol: 'Administrador', telefono: '+56912345678', estado: 'Activo', extra: '-' },
            { id: 2, nombre: 'Ana López', email: 'ana@viakids.cl', rol: 'Conductor', telefono: '+56987654321', estado: 'Activo', extra: 'Lic. Clase A' },
            { id: 3, nombre: 'Carlos Ruiz', email: 'carlos@viakids.cl', rol: 'Apoderado', telefono: '+56911223344', estado: 'Activo', extra: 'Estudiante: Mateo García' },
        ];
    },
    getNotifications: async () => {
        await new Promise(r => setTimeout(r, 300));
        return [
            { id: 1, fecha: 'Hoy, 07:45', tipo: 'Alerta', mensaje: 'Bus retrasado 15 min por tráfico.', ruta: 'Ruta Norte', leido: false },
            { id: 2, fecha: 'Hoy, 08:00', tipo: 'Info', mensaje: 'Todos los buses operando normalmente.', ruta: 'Todas', leido: true },
            { id: 3, fecha: 'Ayer, 16:30', tipo: 'Info', mensaje: 'Ruta completada exitosamente.', ruta: 'Ruta Sur', leido: true },
        ];
    },
    getAttendance: async () => {
        await new Promise(r => setTimeout(r, 300));
        return [
            { id: 1, fecha: '06-05-2026', hora: '07:15', estudiante: 'Mateo García', ruta: 'Ruta Norte', bus: 'AB-1234', estado: 'Abordó' },
            { id: 2, fecha: '06-05-2026', hora: '07:18', estudiante: 'Sofía Rodríguez', ruta: 'Ruta Norte', bus: 'AB-1234', estado: 'Abordó' },
            { id: 3, fecha: '06-05-2026', hora: '07:22', estudiante: 'Lucas Martínez', ruta: 'Ruta Sur', bus: 'EF-9012', estado: 'Ausente' },
            { id: 4, fecha: '06-05-2026', hora: '16:05', estudiante: 'Mateo García', ruta: 'Ruta Norte', bus: 'AB-1234', estado: 'Entregado' },
        ];
    },
    getIncidents: async () => {
        await new Promise(r => setTimeout(r, 300));
        return [
            { id: 1, fecha: '06-05-2026', tipo: 'Mecánico', descripcion: 'Falla menor en motor, resuelto en ruta.', bus: 'AB-1234', resuelto: true },
            { id: 2, fecha: '05-05-2026', tipo: 'Tráfico', descripcion: 'Retraso de 20 min por congestión.', bus: 'EF-9012', resuelto: true },
        ];
    },
};
