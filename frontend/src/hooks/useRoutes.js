import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const mapFromApi = (r) => ({
    id: r.id,
    nombre: r.nombre,
    colegio: r.colegio,
    busId: r.busId || '',
    horario: r.horario,
    paradas: r.paradas || 0,
});

export const useRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const data = await apiService.getRoutes();
            setRoutes((data || []).map(mapFromApi));
        } catch (error) {
            console.error("Error cargando rutas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const addRoute = async (newRoute) => {
        try {
            const data = await apiService.createRoute(newRoute);
            const mapped = mapFromApi(data);
            setRoutes([...routes, mapped]);
            return { success: true, data: mapped };
        } catch (error) {
            console.error("Error creando ruta:", error);
            return { success: false, error: "Error al crear la ruta" };
        }
    };

    const updateRoute = async (updatedRoute) => {
        try {
            const data = await apiService.updateRoute(updatedRoute.id, updatedRoute);
            const mapped = mapFromApi(data);
            setRoutes(routes.map(r => r.id === updatedRoute.id ? mapped : r));
            return { success: true, data: mapped };
        } catch (error) {
            console.error("Error actualizando ruta:", error);
            return { success: false, error: "Error al actualizar la ruta" };
        }
    };

    const deleteRoute = async (id) => {
        try {
            await apiService.deleteRoute(id);
            setRoutes(prev => prev.filter(r => r.id !== id));
            return { success: true };
        } catch (error) {
            console.error("Error eliminando ruta:", error);
            return { success: false, error: "Error al eliminar la ruta" };
        }
    };

    return { routes, loading, addRoute, updateRoute, deleteRoute };
};