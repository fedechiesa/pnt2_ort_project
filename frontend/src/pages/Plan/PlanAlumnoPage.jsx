import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataList from "../../components/DataList";
import { useAuth } from "../../context/AuthContext";
import usePlanAlumno from "../HomeAlumno/usePlanAlumno";
import "../Calendar/CalendarPage.css";
import BackButton from "../../components/BackButton.jsx";

const DIA_LABEL = {
  lun: "Lun",
  mar: "Mar",
  mie: "Mie",
  jue: "Jue",
  vie: "Vie",
  sab: "Sab",
  dom: "Dom",
};

export default function PlanAlumnoPage() {
  const { user } = useAuth();
  const searchId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("alumnoId") : null;

  const alumnoId = searchId || user?.alumnoId || user?.id || user?.userId || null;
  const navigate = useNavigate();

  const { plan, isLoading, error } = usePlanAlumno(alumnoId);

  const rows = useMemo(() => {
    if (!plan) return [];
    return (plan.rutinas ?? []).map((rutina) => {
      const asignacion = plan.asignacion?.find((a) => a.rutinaId === rutina.id);
      return {
        ...rutina,
        dias: asignacion?.dias ?? [],
        orden: asignacion?.orden ?? null,
      };
    });
  }, [plan]);

  const columns = [
    { key: "nombre", header: "Rutina", accessor: "nombre", sortable: true },
    {
      key: "descripcion",
      header: "Descripcion",
      accessor: (r) => r.descripcion || "-",
    },
    {
      key: "duracion",
      header: "Duracion",
      accessor: (r) => r.duracionMin ?? "-",
      render: (v) => (v === "-" ? "-" : `${v} min`),
      sortable: true,
    },
    {
      key: "dias",
      header: "Dias asignados",
      accessor: (r) => r.dias ?? [],
      render: (dias) => (dias.length ? dias.map((d) => DIA_LABEL[d] || d).join(", ") : "Sin asignar"),
    },
  ];

  const diasElegidos = useMemo(() => {
    if (!plan?.asignacion) return [];
    const set = new Set();
    plan.asignacion.forEach((item) => (item.dias || []).forEach((d) => set.add(d)));
    return Array.from(set);
  }, [plan]);

  const planDurationDays = useMemo(() => {
    const desde = plan?.vigencia?.desde;
    const hasta = plan?.vigencia?.hasta;
    if (!desde || !hasta) return null;
    const start = new Date(desde);
    const end = new Date(hasta);
    if (isNaN(start) || isNaN(end)) return null;
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : null;
  }, [plan]);

  const entrenadorNombre = plan?.entrenadorNombre || plan?.entrenador?.nombre || "Sin asignar";
  const vigenciaDesde = plan?.vigencia?.desde || "No definida";
  const vigenciaHasta = plan?.vigencia?.hasta || "Sin fin";

  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-topbar">
          <BackButton />
        </div>
        <div className="calendar-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "center", flex: 1 }}>
            <h2 style={{ margin: 0 }}>Plan de entrenamiento</h2>
            <p style={{ margin: "4px 0 0" }}>
              Rutinas asignadas a tu plan actual. Podes ajustar los dias en el calendario.
            </p>
          </div>
          <button className="calendar-btn" onClick={() => navigate("/calendario/alumno")}>
            Ir al calendario
          </button>
        </div>

        <div style={{ marginTop: "12px" }}>
          <p style={{ margin: "0 0 4px", color: "#6d28d9" }}>
            Plan: <strong>{plan?.nombre ?? "Cargando..."}</strong>
          </p>
          <p style={{ margin: "0 0 4px", color: "#6d28d9" }}>
            Entrenador/a: <strong>{entrenadorNombre}</strong> — Vigencia: {vigenciaDesde} → {vigenciaHasta}
          </p>
          <p style={{ margin: 0, color: "#6d28d9" }}>
            Duracion del plan: {planDurationDays ? `${planDurationDays} dias` : "Sin definir"} — Dias elegidos:
            {diasElegidos.length ? ` ${diasElegidos.map((d) => DIA_LABEL[d] || d).join(", ")}` : " Sin elegir"}
          </p>
        </div>

        {error && <p style={{ color: "#c53030", marginTop: "8px" }}>{error}</p>}

        <div style={{ marginTop: "16px" }}>
          <DataList columns={columns} data={rows} loading={isLoading} searchable hideImage />
        </div>
      </div>
    </div>
  );
}
