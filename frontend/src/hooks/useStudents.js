import { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/api';

const mapFromApi = (s) => ({
    id: s.id,
    nombre: s.nombre,
    curso: s.curso,
    rut: s.rut || '',
    apoderado: s.apoderado || '',
    telefono: s.telefono || '',
    busId: s.busId || '',
    busPatente: s.busPatente || '',
    ruta: s.ruta || '',
    colegio: s.colegio || '',
    estado: s.estado || 'En espera',
    parentId: s.parentId || '',
    horario: s.horario || 'MANANA',
});

export const useStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBusFilter, setSelectedBusFilter] = useState('Todos');
    const [estadoFilter, setEstadoFilter] = useState('Todos');

    useEffect(() => {
        let isMounted = true;
        apiService.getStudents().then(data => {
            if (isMounted) { setStudents((data || []).map(mapFromApi)); setLoading(false); }
        }).catch(() => { if (isMounted) setLoading(false); });
        return () => { isMounted = false; };
    }, []);

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const nombreSeguro = student.nombre || '';
            const matchesSearch = nombreSeguro.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBus = selectedBusFilter === 'Todos' || student.busId === selectedBusFilter || student.busPatente === selectedBusFilter;
            const matchesEstado = estadoFilter === 'Todos' || student.estado === estadoFilter;
            return matchesSearch && matchesBus && matchesEstado;
        });
    }, [students, searchTerm, selectedBusFilter, estadoFilter]);

    const addStudent = async (student) => {
        const res = await apiService.createStudent(student);
        const mapped = mapFromApi(res);
        setStudents(p => [...p, mapped]);
        return { success: true, data: mapped };
    };

    const updateStudent = async (student) => {
        const res = await apiService.updateStudent(student.id, student);
        const mapped = mapFromApi(res);
        setStudents(p => p.map(s => s.id === student.id ? mapped : s));
        return { success: true, data: mapped };
    };

    const deleteStudent = async (id) => {
        await apiService.deleteStudent(id);
        setStudents(p => p.filter(s => s.id !== id));
        return { success: true };
    };

    const refreshStudents = async () => {
        setLoading(true);
        const data = await apiService.getStudents();
        setStudents((data || []).map(mapFromApi));
        setLoading(false);
    };

    return { students: filteredStudents, allStudents: students, loading, searchTerm, setSearchTerm, selectedBusFilter, setSelectedBusFilter, estadoFilter, setEstadoFilter, addStudent, updateStudent, deleteStudent, refreshStudents };
};
