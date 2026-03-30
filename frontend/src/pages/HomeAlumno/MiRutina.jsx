import React from "react";
import { useAuth } from "../../context/AuthContext";
import useRutinasAlumno from "./useRutinasAlumno";
import "./MiRutina.css";

export default function MiRutina() {
  const { user } = useAuth();
  const searchId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("alumnoId") : null;
  const alumnoId = searchId || user?.alumnoId || user?.id || user?.userId || null;
  const { planId, rutinas, isLoading, error } = useRutinasAlumno(alumnoId);

  return (
    <div className="mi-rutina">
      <div className="mi-rutina-header">
        <div>
          <p className="plan-etiqueta">Mi rutina</p>
          <h3>Plan asignado</h3>
          <p className="plan-objetivo">Plan ID: {planId ?? "—"}</p>
        </div>
      </div>

      {isLoading && <p className="plan-loading">Cargando rutinas...</p>}
      {error && <p className="plan-error">{error}</p>}

      {!isLoading && !error && (
        <div className="rutinas-lista">
          {rutinas.length === 0 ? (
            <p className="sesion-vacia">Aún no tenés rutinas asignadas.</p>
          ) : (
            rutinas.map((rutina) => (
              <div className="rutina-card" key={rutina.id}>
                <div className="rutina-card-header">
                  <div>
                    <h4>{rutina.nombre}</h4>
                    {rutina.descripcion && <p className="rutina-descripcion">{rutina.descripcion}</p>}
                  </div>
                  <span className="rutina-id">Plan #{rutina.idPlan}</span>
                </div>
                <ul className="ejercicios-lista">
                  {(rutina.ejercicios || []).map((ej) => (
                    <li key={ej.id} className="ejercicio-item">
                      <div>
                        <strong>{ej.nombre}</strong>
                        <p className="ejercicio-detalle">
                          {ej.series ? `${ej.series}x` : ""} {ej.repeticiones ? `${ej.repeticiones} reps` : ""}
                          {ej.descansoSeg ? ` · Descanso ${ej.descansoSeg}s` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                  {!rutina.ejercicios?.length && <li className="ejercicio-item">Sin ejercicios cargados.</li>}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
