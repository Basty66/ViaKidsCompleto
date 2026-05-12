import { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/api';

const mapFromApi = (b) => ({
    id: b.id,
    patente: b.patente,
    conductor: b.conductor || '',
    capacidad: b.capacidad || 0,
    estado: b.estado || 'En Espera',
    lat: b.lat,
    lng: b.lng,
});

export const useBuses = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let isMounted = true;
        apiService.getBuses().then(data => {
            if (isMounted) { setBuses((data || []).map(mapFromApi)); setLoading(false); }
        }).catch(() => { if (isMounted) setLoading(false); });
        return () => { isMounted = false; };
    }, []);

    const isPatenteDuplicada = (patente, idExcluido = null) => {
        return buses.some(bus => bus.patente.toUpperCase() === patente.toUpperCase() && bus.id !== idExcluido);
    };

    const filteredBuses = useMemo(() => {
        let result = buses;
        if (filter !== 'Todos') result = result.filter(bus => bus.estado === filter);
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(bus => bus.patente.toLowerCase().includes(lowerTerm) || (bus.conductor && bus.conductor.toLowerCase().includes(lowerTerm)));
        }
        return result;
    }, [buses, filter, searchTerm]);

    const addBus = async (newBus) => {
        const data = await apiService.createBus(newBus);
        const mapped = mapFromApi(data);
        setBuses(p => [...p, mapped]);
        return { success: true, data: mapped };
    };

    const updateBus = async (updatedBus) => {
        const data = await apiService.updateBus(updatedBus.id, updatedBus);
        const mapped = mapFromApi(data);
        setBuses(p => p.map(b => b.id === updatedBus.id ? mapped : b));
        return { success: true, data: mapped };
    };

    const deleteBus = async (id) => {
        await apiService.deleteBus(id);
        setBuses(p => p.filter(b => b.id !== id));
        return { success: true };
    };

    const validateForm = (data, editingId = null) => {
        if (!data.patente?.trim() || !data.conductor?.trim()) return 'La patente y el conductor son obligatorios.';
        if (data.patente.length < 5) return 'La patente es muy corta (mínimo 5 caracteres).';
        if (isPatenteDuplicada(data.patente, editingId)) return 'Esta patente ya está registrada.';
        return null;
    };

    return { buses: filteredBuses, allBuses: buses, loading, filter, setFilter, searchTerm, setSearchTerm, addBus, updateBus, deleteBus, validateForm, isPatenteDuplicada };
};
