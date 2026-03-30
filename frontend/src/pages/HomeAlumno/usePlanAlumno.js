import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const parseISODate = (iso) => {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, (m || 1) - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
};

const mapPlanToEvents = (plan) => {
  if (!plan) return [];
  const rutinasById = new Map(plan.rutinas?.map((r) => [String(r.id), r]) ?? []);
  const sesiones = plan.sesiones ?? [];

  return sesiones
    .map((sesion) => {
      const rutina = rutinasById.get(String(sesion.rutinaId));
      const nombreRutina = rutina?.nombre || rutina?.titulo || `Rutina ${sesion.rutinaId}`;
      const base = parseISODate(sesion.fecha) || new Date();
      const start = sesion.start
        ? new Date(sesion.start)
        : new Date(base.getFullYear(), base.getMonth(), base.getDate(), 9, 0);
      const end = sesion.end
        ? new Date(sesion.end)
        : new Date(base.getFullYear(), base.getMonth(), base.getDate(), 10, 0);
      const done = !!sesion.done;
      return {
        title: `${done ? "✅ " : ""}${nombreRutina}`,
        start,
        end,
        meta: {
          rutinaId: String(sesion.rutinaId),
          done,
        },
      };
    })
    .sort((a, b) => a.start - b.start);
};


export default function usePlanAlumno(alumnoId) {
  const [plan, setPlan] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlan = useCallback(async () => {
    if (!alumnoId) {
      setIsLoading(false);
      setPlan(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/alumnos/${alumnoId}/plan`);
      setPlan(data.plan ?? data);
    } catch (err) {
      setError(err.response?.data?.message || "No pudimos traer tu plan.");
    } finally {
      setIsLoading(false);
    }
  }, [alumnoId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  useEffect(() => {
    setEvents(mapPlanToEvents(plan));
  }, [plan]);

  const saveAsignacion = useCallback(
    async (draftAsignacion) => {
      try {
        const { data } = await api.put(`/alumnos/${alumnoId}/plan/asignacion`, {
          asignacion: draftAsignacion,
        });
        setPlan(data.plan ?? data);
        setError(null);
        return data.plan ?? data;
      } catch (err) {
        const message = err.response?.data?.message || "No pudimos guardar la asignación.";
        setError(message);
        throw err;
      }
    },
    [alumnoId]
  );

  const toggleSesion = useCallback(
    async (fecha, rutinaId, done, start, end) => {
      try {
        const { data } = await api.patch(`/alumnos/${alumnoId}/plan/sesiones/${fecha}`, {
          rutinaId,
          done,
          start,
          end,
        });
        setPlan(data.plan ?? data);
        setError(null);
        return data.plan ?? data;
      } catch (err) {
        const message = err.response?.data?.message || "No pudimos actualizar la sesión.";
        setError(message);
        throw err;
      }
    },
    [alumnoId]
  );

  return {
    plan,
    events,
    isLoading,
    error,
    saveAsignacion,
    toggleSesion,
    refetch: fetchPlan,
  };
}
