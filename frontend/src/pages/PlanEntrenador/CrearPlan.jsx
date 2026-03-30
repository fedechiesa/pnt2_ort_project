import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAlumnosAll } from "../../services/alumnosServices.js";
import { getRutinasByEntrenador } from "../../services/rutinasServices.js";
import { crearPlanGeneral, listarPlanes, eliminarPlan, asignarPlanBase } from "../../services/planesService.js";
import "../../App.css";
import "./CrearPlan.css";
import BackButton from "../../components/BackButton.jsx";

export default function CrearPlan() {
  const { user } = useAuth();
  const [alumnos, setAlumnos] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [form, setForm] = useState({ rutinasIds: [], nombre: "" });
  const [asignaciones, setAsignaciones] = useState({});
  const [asignadosOpen, setAsignadosOpen] = useState({});
  const [assignFormOpen, setAssignFormOpen] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const cargarDatos = async () => {
    if (!user?.id) {
      setRutinas([]);
      return;
    }
    const [a, r, p] = await Promise.all([
      getAlumnosAll({ includeUnassigned: true }),
      getRutinasByEntrenador(user.id),
      listarPlanes(),
    ]);
    setAlumnos(a);
    setRutinas(r);
    setPlanes(p);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await cargarDatos();
      } catch (err) {
        if (alive) setError(err?.response?.data?.message || "No pudimos cargar alumnos/rutinas");
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const recargarPlanes = async () => {
    try {
      const p = await listarPlanes();
      setPlanes(p);
    } catch (err) {
      setError(err?.response?.data?.message || "No pudimos listar los planes");
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "rutinasIds") {
      const valNum = Number(value);
      setForm((prev) => {
        const current = new Set(prev.rutinasIds);
        if (checked) current.add(valNum);
        else current.delete(valNum);
        return { ...prev, rutinasIds: Array.from(current) };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setMensaje("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    if (!form.rutinasIds.length) {
      setError("Seleccioná al menos una rutina");
      return;
    }
    const rutinasSeleccionadas = rutinas.filter(r => form.rutinasIds.includes(Number(r.id)));

    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre || "Plan personalizado",
        objetivo: rutinasSeleccionadas[0]?.objetivo || "Pendiente",
        rutinas: form.rutinasIds,
        vigencia: null,
      };
      const creado = await crearPlanGeneral(payload);
      setMensaje(`Plan ${creado.nombre} creado con ${form.rutinasIds.length} rutina(s).`);
      await recargarPlanes();
      setShowForm(false);
      setForm({ rutinasIds: [], nombre: "" });
    } catch (err) {
      setError(err?.response?.data?.message || "No pudimos asignar el plan");
    } finally {
      setLoading(false);
    }
  };

  const recargarTodo = async () => {
    try {
      await cargarDatos();
    } catch (err) {
      setError(err?.response?.data?.message || "No pudimos refrescar los datos");
    }
  };

  const alumnosAsignables = useMemo(() => {
    return (alumnos || []).filter((a) => !a.entrenadorId || a.entrenadorId === user?.id);
  }, [alumnos, user?.id]);

  const handleEliminarPlan = async (planId, nombre) => {
    const confirmar = window.confirm(`¿Eliminar el plan "${nombre}"? Se desasignará de alumnos y rutinas.`);
    if (!confirmar) return;
    setError("");
    setMensaje("");
    setLoading(true);
    try {
      await eliminarPlan(planId);
      setMensaje(`Plan "${nombre}" eliminado.`);
      await recargarTodo();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo eliminar el plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container plan-page">
      <main className="home-main">
        <div className="plan-content">
          <div className="plan-header">
            <BackButton />
            <div>
              <p className="plan-kicker">Asignación</p>
              <h2 className="welcome">Planes</h2>
              <p className="subtitle">Creá un plan base que podrás asignar luego a tus alumnos.</p>
            </div>
          </div>

          <div className="rutinas-actions">
            <button
              type="button"
              className={`add-plan-btn ${showForm ? "is-open" : ""}`}
              onClick={() => setShowForm((prev) => !prev)}
            >
              <div className="add-rutina-content">
                <span className="rutina-row-title">{showForm ? "Cerrar formulario" : "Crear plan"}</span>
              </div>
            </button>
          </div>

          {showForm && (
            <div className="form-card">
              <div className="form-card-header" />
              <div className="form-card-body">
                <h3 className="form-card-title">Nuevo plan</h3>
                <form className="google-form" onSubmit={handleSubmit}>
                  <fieldset className="rutinas-fieldset">
                    <legend>Rutinas (seleccion&aacute; una o varias)</legend>
                    <div className="rutinas-grid">
                      {rutinas.map((r) => (
                        <label key={r.id} className="rutina-checkbox">
                          <input
                            type="checkbox"
                            name="rutinasIds"
                            value={r.id}
                            checked={form.rutinasIds.includes(Number(r.id))}
                            onChange={handleChange}
                          />
                          {r.titulo} ({r.nivel})
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label>
                    Nombre del plan
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Plan personalizado"
                    />
                  </label>

                  <div className="form-actions">
                    <button type="submit" className="primary-btn" disabled={loading}>{loading ? "Creando..." : "Crear plan"}</button>
                    <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {mensaje && (
            <div className="plan-alert">
              {mensaje}
            </div>
          )}
          {error && (
            <div className="plan-alert error">
              {error}
            </div>
          )}

          <div className="plan-list">
            <div className="plan-list-header">
              <h3 className="plan-list-title">Planes creados</h3>
              <span className="plan-list-count">{planes.length} {planes.length === 1 ? "plan" : "planes"}</span>
            </div>
            {planes.length === 0 && (
              <p className="subtitle">Todavía no hay planes creados.</p>
            )}
            {planes.map((plan) => {
              const asignForm = asignaciones[plan.id] || { alumnoId: "", inicio: "", fin: "" };
              const alumnosAsignados = Array.isArray(plan.asignaciones) ? plan.asignaciones : [];
              const asignadosLabel = alumnosAsignados.length
                ? `Asignado a ${alumnosAsignados[0].alumnoNombre || alumnosAsignados[0].alumnoId}${alumnosAsignados.length > 1 ? ` +${alumnosAsignados.length - 1}` : ""}`
                : "Asignado a";
              return (
                <div key={plan.id} className="plan-item">
                  <div className="plan-item-header">
                    <div>
                      <p className="plan-kicker">Plan #{plan.id}</p>
                      <h4 className="plan-item-title">{plan.nombre}</h4>
                    </div>
                    <div className="plan-item-badge plan-assigned" onClick={() => setAsignadosOpen(prev => ({ ...prev, [plan.id]: !prev[plan.id] }))}>
                      {asignadosLabel}
                    </div>
                    <button
                      type="button"
                      className="danger-btn delete-plan-btn"
                      onClick={() => handleEliminarPlan(plan.id, plan.nombre)}
                      disabled={loading}
                    >
                      Eliminar plan
                    </button>
                  </div>
                  {asignadosOpen[plan.id] && (
                    <div className="plan-assigned-list">
                      {alumnosAsignados.length === 0 && <p className="plan-item-objetivo">Sin alumnos asignados.</p>}
                      {alumnosAsignados.map((al) => (
                        <span key={`${al.alumnoId}-${al.desde || ""}`} className="plan-assigned-chip">
                          {al.alumnoNombre || `Alumno ${al.alumnoId}`} {al.desde ? `(${al.desde} → ${al.hasta || "?"})` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="plan-item-objetivo">{plan.objetivo || "Sin objetivo definido"}</p>
                  <div className="plan-item-meta">
                    <span>{plan.vigenciaDesde || plan.vigencia?.desde || "Inicio no definido"} → {plan.vigenciaHasta || plan.vigencia?.hasta || "Fin no definido"}</span>
                    <span>{plan.rutinas?.length || 0} rutina(s)</span>
                  </div>
                  <div className="plan-assign">
                    <button
                      type="button"
                      className="secondary-btn add-student-btn"
                      onClick={() => setAssignFormOpen(prev => ({ ...prev, [plan.id]: !prev[plan.id] }))}
                    >
                      {assignFormOpen[plan.id] ? "Cerrar" : "Agregar alumno"}
                    </button>
                    {assignFormOpen[plan.id] && (
                      <>
                        <div className="plan-assign-row">
                          <label>
                            Alumno
                            <select
                              value={asignForm.alumnoId}
                              onChange={(e) => setAsignaciones(prev => ({
                                ...prev,
                                [plan.id]: { ...(prev[plan.id] || {}), alumnoId: e.target.value }
                              }))}
                            >
                              <option value="">Elegí alumno</option>
                              {alumnosAsignables.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                            </select>
                          </label>
                          <label>
                            Desde
                            <input
                              type="date"
                              value={asignForm.inicio || ""}
                              onChange={(e) => setAsignaciones(prev => ({
                                ...prev,
                                [plan.id]: { ...(prev[plan.id] || {}), inicio: e.target.value }
                              }))}
                            />
                          </label>
                          <label>
                            Hasta
                            <input
                              type="date"
                              value={asignForm.fin || ""}
                              onChange={(e) => setAsignaciones(prev => ({
                                ...prev,
                                [plan.id]: { ...(prev[plan.id] || {}), fin: e.target.value }
                              }))}
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          className="primary-btn assign-btn"
                          onClick={async () => {
                            setError("");
                            setMensaje("");
                            const payloadAlumno = asignForm.alumnoId ? Number(asignForm.alumnoId) : null;
                            if (!payloadAlumno || !asignForm.inicio || !asignForm.fin) {
                              setError("Elegí alumno y fechas para asignar el plan");
                              return;
                            }
                            const alumnoDestino = alumnos.find(a => Number(a.id) === payloadAlumno);
                            setLoading(true);
                            try {
                              await asignarPlanBase(plan.id, {
                                alumnoId: payloadAlumno,
                                vigencia: { desde: asignForm.inicio, hasta: asignForm.fin },
                              });
                              setMensaje(`Plan ${plan.nombre} asignado a ${alumnoDestino?.nombre || "alumno"} del ${asignForm.inicio} al ${asignForm.fin}.`);
                              setAsignaciones(prev => ({ ...prev, [plan.id]: { alumnoId: "", inicio: "", fin: "" } }));
                              await recargarTodo();
                            } catch (err) {
                              setError(err?.response?.data?.message || "No se pudo asignar el plan al alumno.");
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Asignar plan
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
