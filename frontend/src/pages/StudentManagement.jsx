import { useState } from 'react';
import { DashboardLayout } from '../components/templates/DashboardLayout';
import { GraduationCap, UserPlus, QrCode, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { QRCodeGenerator } from '../components/ui/QRCodeGenerator';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { useStudents } from '../hooks/useStudents';
import { useBuses } from '../hooks/useBuses';
import { useRoutes } from '../hooks/useRoutes';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export const StudentManagement = () => {
    const { students, addStudent, updateStudent, deleteStudent, loading, searchTerm, setSearchTerm, estadoFilter, setEstadoFilter } = useStudents();
    const { allBuses } = useBuses();
    const { routes } = useRoutes();
    const toast = useToast();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', curso: '', rut: '', apoderado: '', telefono: '', busId: '', busPatente: '', ruta: '', routeId: '', colegio: '' });

    const handleSave = async () => {
        if (!formData.nombre || !formData.curso) { toast.warning('Nombre y curso son obligatorios'); return; }
        if (editingStudent) {
            await updateStudent({ ...editingStudent, ...formData });
            toast.success('Estudiante actualizado');
        } else {
            await addStudent(formData);
            toast.success('Estudiante registrado');
        }
        setIsModalOpen(false);
        setFormData({ nombre: '', curso: '', rut: '', apoderado: '', telefono: '', busId: '', busPatente: '', ruta: '', routeId: '', colegio: '' });
    };

    const openCreateModal = () => {
        setEditingStudent(null);
        setFormData({ nombre: '', curso: '', rut: '', apoderado: '', telefono: '', busId: '', busPatente: '', ruta: '', routeId: '', colegio: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (row) => {
        setEditingStudent(row);
        setFormData({ nombre: row.nombre || '', curso: row.curso || '', rut: row.rut || '', apoderado: row.apoderado || '', telefono: row.telefono || '', busId: row.busId || '', busPatente: row.busPatente || '', ruta: row.ruta || '', routeId: row.routeId || '', colegio: row.colegio || '' });
        setIsModalOpen(true);
    };

    const openQRModal = (student) => { setSelectedStudent(student); setIsQRModalOpen(true); };

    const estadoColors = { 'En espera': 'bg-slate-500/20 text-slate-400', 'En el bus': 'bg-blue-500/20 text-blue-400', 'Entregado': 'bg-emerald-500/20 text-emerald-400', 'Ausente': 'bg-red-500/20 text-red-400' };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center glass p-6 rounded-3xl gap-4 animate-fade-in-up">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                            <GraduationCap className="text-blue-400" /> Gestión de Estudiantes
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">{students.length} estudiantes registrados</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => navigate('/admin/estudiantes/qr')} className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all btn-ripple">
                            <QrCode size={18} /> <span className="hidden sm:inline">Ver QR</span>
                        </button>
                        <button onClick={openCreateModal} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all btn-ripple">
                            <UserPlus size={18} /> <span className="hidden sm:inline">Nuevo</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center glass p-4 rounded-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-white/5 flex-1 min-w-[200px]">
                        <Search className="text-white/50 shrink-0" size={18} />
                        <input type="text" placeholder="Buscar estudiante..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-white w-full text-sm" />
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                        {['Todos', 'En espera', 'En el bus', 'Entregado', 'Ausente'].map((est) => (
                            <button key={est} onClick={() => setEstadoFilter(est)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${estadoFilter === est ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                {est}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="glass p-4 rounded-xl skeleton-base h-16" />
                        ))}
                    </div>
                ) : students.length === 0 ? (
                    <EmptyState
                        icon={<GraduationCap size={40} className="text-slate-500" />}
                        title="No hay estudiantes"
                        description="Registra tu primer estudiante para comenzar"
                        action={<button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all">Registrar Estudiante</button>}
                    />
                ) : (
                    <div className="glass rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {['Nombre', 'Curso', 'Apoderado', 'Bus', 'Estado', 'Acciones'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs text-slate-400 font-bold uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {students.map((student, i) => (
                                        <tr key={student.id} className="hover:bg-white/5 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                                            <td className="px-4 py-3 text-sm font-medium text-white">{student.nombre}</td>
                                            <td className="px-4 py-3 text-sm text-slate-300">{student.curso}</td>
                                            <td className="px-4 py-3 text-sm text-slate-400">{student.apoderado || '—'}</td>
                                            <td className="px-4 py-3 text-sm">{student.busPatente ? <span className="text-blue-400 font-medium">{student.busPatente}</span> : <span className="text-slate-500 italic">Sin asignar</span>}</td>
                                            <td className="px-4 py-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${estadoColors[student.estado] || 'bg-slate-500/20 text-slate-400'}`}>{student.estado}</span></td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => openQRModal(student)} className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors" title="Ver QR"><QrCode size={16} /></button>
                                                    <button onClick={() => openEditModal(student)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Editar"><Edit2 size={16} /></button>
                                                    <button onClick={() => { deleteStudent(student.id); toast.success('Estudiante eliminado'); }} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Eliminar"><Trash2 size={16} /></button>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? 'Editar Alumno' : 'Registrar Alumno'}>
                <div className="space-y-4">
                    <input placeholder="Nombre Completo" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Curso" value={formData.curso} onChange={e => setFormData({ ...formData, curso: e.target.value })} className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" />
                        <input placeholder="RUT" value={formData.rut} onChange={e => setFormData({ ...formData, rut: e.target.value })} className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" />
                    </div>
                    <input placeholder="Nombre del Apoderado" value={formData.apoderado} onChange={e => setFormData({ ...formData, apoderado: e.target.value })} className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" />
                    <input placeholder="Teléfono" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} className="w-full bg-slate-900/50 p-3 rounded-xl text-white border border-white/10 outline-none" />
                    <Select
                        label="Bus Asignado"
                        value={formData.busId}
                        onChange={(val) => { const bus = allBuses.find(b => b.id === val); setFormData({ ...formData, busId: val, busPatente: bus ? bus.patente : '' }); }}
                        options={allBuses.map(b => ({ value: b.id, label: `${b.patente} — ${b.conductor}` }))}
                        placeholder="Seleccionar Bus..."
                    />
                    <Select
                        label="Ruta"
                        value={formData.routeId}
                        onChange={(val) => { const r = routes.find(rt => rt.id === val); setFormData({ ...formData, routeId: val, ruta: r ? r.nombre : '', colegio: r ? r.colegio : '' }); }}
                        options={routes.map(r => ({ value: r.id, label: `${r.nombre} — ${r.colegio}` }))}
                        placeholder="Seleccionar Ruta..."
                    />
                    <button onClick={handleSave} className="w-full bg-blue-600 py-3 rounded-xl text-white font-bold hover:bg-blue-700 transition-all btn-ripple">
                        {editingStudent ? 'Actualizar' : 'Guardar'}
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} title="Código QR del Estudiante">
                {selectedStudent && (
                    <div className="space-y-6">
                        <QRCodeGenerator studentData={selectedStudent} size={220} />
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10 space-y-2 text-sm">
                            <p className="text-white font-bold text-lg">{selectedStudent.nombre}</p>
                            <p className="text-slate-400">RUT: {selectedStudent.rut || 'N/A'}</p>
                            <p className="text-slate-400">Curso: {selectedStudent.curso}</p>
                            <p className="text-slate-400">Bus: {selectedStudent.busPatente || 'Sin asignar'}</p>
                            <p className="text-slate-400">Ruta: {selectedStudent.ruta || 'Sin asignar'}</p>
                            <p className="text-slate-400">Apoderado: {selectedStudent.apoderado || 'N/A'}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
};
