import api from '../api/axiosConfig';

const roleMap = {
    'Administrador': 'ADMIN',
    'Conductor': 'DRIVER',
    'Apoderado': 'PARENT',
};

const roleMapReverse = {
    'ADMIN': 'Administrador',
    'DRIVER': 'Conductor',
    'PARENT': 'Apoderado',
};

const statusMap = {
    'Activo': 'ACTIVO',
    'Suspendido': 'SUSPENDIDO',
};

const statusMapReverse = {
    'ACTIVO': 'Activo',
    'SUSPENDIDO': 'Suspendido',
};

const mapToBackend = (u) => ({
    nombre: u.nombre,
    email: u.email,
    password: u.password || undefined,
    rol: roleMap[u.rol] || u.rol,
    telefono: u.telefono || '',
    estado: statusMap[u.estado] || u.estado || 'ACTIVO',
});

const mapFromBackend = (u) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    rol: roleMapReverse[u.rol] || u.rol,
    telefono: u.telefono || '',
    estado: statusMapReverse[u.estado] || u.estado || 'Activo',
    extra: u.rol === 'DRIVER' ? `Lic. ${u.telefono || 'N/A'}` : (u.rol === 'PARENT' ? 'Apoderado' : 'Admin'),
});

export const userService = {
    getAll: async () => {
        const data = await api.get('/users').then(r => r.data);
        return Array.isArray(data) ? data.map(mapFromBackend) : [];
    },

    create: async (user) => {
        const data = await api.post('/users', mapToBackend(user)).then(r => r.data);
        return { success: true, data: mapFromBackend(data) };
    },

    update: async (user) => {
        const data = await api.put(`/users/${user.id}`, mapToBackend(user)).then(r => r.data);
        return { success: true, data: mapFromBackend(data) };
    },

    delete: async (id) => {
        await api.delete(`/users/${id}`);
        return { success: true };
    },

    changePassword: async (id, currentPassword, newPassword) => {
        const data = await api.put(`/users/${id}/password`, { currentPassword, newPassword }).then(r => r.data);
        return data;
    },

    changeOwnPassword: async (currentPassword, newPassword) => {
        const data = await api.put('/users/password', { currentPassword, newPassword }).then(r => r.data);
        return data;
    },
};
