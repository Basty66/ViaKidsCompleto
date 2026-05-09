import { useState } from 'react';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useUsers } from '../hooks/useUsers';
import { Plus, Search, Edit2, Trash2, AlertCircle, Download, Users } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import * as XLSX from 'xlsx';

export const UserManagement = () => {
    const { users, loading, searchTerm, setSearchTerm, roleFilter, setRoleFilter, addUser, updateUser, deleteUser, toggleUserStatus } = useUsers();
    const toast = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({ nombre: '', email: '', password: '', rol: 'Apoderado', telefono: '', estado: 'Activo' });
    const [error, setError] = useState('');

    const handleOpenModal = (user = null) => {
        setError('');
        if (user) { setEditingUser(user); setNewUser({ ...user, password: '' }); }
        else { setEditingUser(null); setNewUser({ nombre: '', email: '', password: '', rol: 'Apoderado', telefono: '', estado: 'Activo' }); }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!newUser.nombre || !newUser.email) { setError('Nombre y email obligatorios'); return; }
        if (!editingUser && !newUser.password) { setError('La contraseña es obligatoria para nuevos usuarios'); return; }
        if (newUser.password && newUser.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
        try {
            if (editingUser) { await updateUser(newUser); toast.success('Usuario actualizado'); }
            else { await addUser(newUser); toast.success('Usuario creado'); }
            setIsModalOpen(false);
        } catch (err) {
            setError(err?.message || 'Error al guardar');
        }
    };

    const handleDelete = async (id) => { await deleteUser(id); toast.success('Usuario eliminado'); };

    const handleToggleStatus = async (user) => {
        await toggleUserStatus(user.id);
        toast.info(`Usuario ${user.estado === 'Activo' ? 'suspendido' : 'activado'}`);
    };

    const exportToExcel = () => {
        const dataToExport = users.map(u => ({ Nombre: u.nombre, Email: u.email, Rol: u.rol, Estado: u.estado, Teléfono: u.telefono || '' }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
        XLSX.writeFile(wb, 'Usuarios_ViaKids.xlsx');
        toast.success('Excel exportado');
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center glass p-6 md:p-8 rounded-3xl animate-fade-in-up">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3"><Users className="text-blue-400" /> Gestión de Usuarios</h1>
                        <p className="text-slate-400 text-sm mt-1">{users.length} usuarios registrados</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={exportToExcel} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all btn-ripple border border-white/10">
                            <Download size={18} /> <span className="hidden sm:inline">Exportar</span>
                        </button>
                        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all btn-ripple">
                            <Plus size={18} /> <span className="hidden sm:inline">Nuevo</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center glass p-4 rounded-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-white/5 flex-1 min-w-[200px]">
                        <Search className="text-white/50 shrink-0" size={18} />
                        <input type="text" placeholder="Buscar usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-white w-full text-sm" />
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                        {['Todos', 'Administrador', 'Conductor', 'Apoderado'].map((rol) => (
                            <button key={rol} onClick={() => setRoleFilter(rol)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${roleFilter === rol ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                {rol}
                            </button>
                        ))}
                    </div>
                </div>

                {!loading && users.length > 0 && (
                    <div className="glass rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {['Nombre', 'Rol', 'Email', 'Estado', 'Teléfono', 'Acciones'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs text-slate-400 font-bold uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user, i) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                                            <td className="px-4 py-3 text-sm font-medium text-white">{user.nombre}</td>
                                            <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.rol === 'Administrador' ? 'bg-purple-500/20 text-purple-400' : user.rol === 'Conductor' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{user.rol}</span></td>
                                            <td className="px-4 py-3 text-sm text-slate-300">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.estado === 'Activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{user.estado}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-400">{user.telefono || '—'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => handleOpenModal(user)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleToggleStatus(user)} className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors" title={user.estado === 'Activo' ? 'Suspender' : 'Activar'}>
                                                        <span className="text-xs font-bold">{user.estado === 'Activo' ? '⏸' : '▶'}</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(user.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Editar Usuario' : 'Registrar Usuario'}>
                <div className="space-y-4">
                    {error && <div className="text-red-400 flex items-center gap-2 text-sm bg-red-500/10 p-3 rounded-xl"><AlertCircle size={16} /> {error}</div>}
                    <input className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" placeholder="Nombre Completo" value={newUser.nombre} onChange={e => setNewUser({ ...newUser, nombre: e.target.value })} />
                    <input className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                    <select className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none [&>option]:bg-slate-900" value={newUser.rol} onChange={e => setNewUser({ ...newUser, rol: e.target.value })}>
                        <option>Administrador</option><option>Conductor</option><option>Apoderado</option>
                    </select>
                    {!editingUser && (
                        <input type="password" className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" placeholder="Contraseña (mín. 6 caracteres)" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                    )}
                    <input className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" placeholder="Teléfono" value={newUser.telefono} onChange={e => setNewUser({ ...newUser, telefono: e.target.value })} />
                    <button onClick={handleSave} className="w-full bg-blue-600 py-3 rounded-xl text-white font-bold hover:bg-blue-700 transition-all btn-ripple">
                        {editingUser ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </Modal>
        </DashboardLayout>
    );
};
