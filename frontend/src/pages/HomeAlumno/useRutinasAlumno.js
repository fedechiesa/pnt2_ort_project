import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

export default function useRutinasAlumno(alumnoId) {
  const [data, setData] = useState({ planId: null, rutinas: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRutinas = useCallback(async () => {
    if (!alumnoId) {
      setIsLoading(false);
      setData({ planId: null, rutinas: [] });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/alumnos/${alumnoId}/rutinas`);
      setData(data);
    } catch (err) {
      setError(err.response?.data?.message || "No pudimos traer tus rutinas.");
    } finally {
      setIsLoading(false);
    }
  }, [alumnoId]);

  useEffect(() => {
    fetchRutinas();
  }, [fetchRutinas]);

  return {
    ...data,
    isLoading,
    error,
    refetch: fetchRutinas,
  };
}
