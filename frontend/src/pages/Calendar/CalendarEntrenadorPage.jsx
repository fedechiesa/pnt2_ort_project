import React, { useEffect, useState } from "react";
import { parseISO, endOfDay, isValid } from "date-fns";
import Calendar from "../../components/Calendar/Calendar";
import "./CalendarPage.css";
import BackButton from "../../components/BackButton.jsx";
import { listarPlanes } from "../../services/planesService";
import { useAuth } from "../../context/AuthContext";

export default function CalendarEntrenadorPage() {
  const { user } = useAuth();
  const entrenadorId = user?.id || user?.userId || user?.entrenadorId || null;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    if (!entrenadorId) {
      setEvents([]);
      setError("");
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const planes = await listarPlanes();
        const evts = [];

        planes.forEach((plan) => {
          const asignaciones = Array.isArray(plan.asignaciones)
            ? plan.asignaciones
            : [];

          asignaciones.forEach((asig) => {
            if (asig.asignadoPor && asig.asignadoPor !== entrenadorId) return;
            if (!asig.desde || !asig.hasta) return;

            const start = parseISO(asig.desde);
            const end = endOfDay(parseISO(asig.hasta));
            if (!isValid(start) || !isValid(end)) return;

            evts.push({
              title:
                `${asig.alumnoNombre || `Alumno ${asig.alumnoId || ""}`}` +
                (plan.nombre ? ` – ${plan.nombre}` : ""),
              start,
              end,
              kind: "asignacion",
            });
          });
        });

        if (!alive) return;
        setEvents(evts);
        setError("");
      } catch (err) {
        if (!alive) return;
        setEvents([]);
        setError("No pudimos cargar tus asignaciones.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [entrenadorId]);

  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-topbar">
          <BackButton />
        </div>
        <h2 className="calendar-title">📅 Calendario – Entrenador</h2>

        {error && (
          <p className="calendar-error" style={{ color: "#c53030" }}>
            {error}
          </p>
        )}

        <div className="calendar-wrapper">
          <div className="calendar-body">
            <Calendar
              mode="entrenador"
              defaultView="week"
              events={events}
              loading={loading}
              eventPropGetter={(event) => {
                const done = event.meta?.done;
                return done
                  ? { style: { backgroundColor: "#2563eb", opacity: 0.7 } }
                  : { style: { backgroundColor: "#2563eb" } };
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
