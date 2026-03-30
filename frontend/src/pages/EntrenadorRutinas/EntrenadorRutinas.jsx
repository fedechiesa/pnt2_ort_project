import { useEffect, useMemo, useState } from "react";
import "../../App.css";
import "./EntrenadorRutinas.css";
import { useAuth } from "../../context/AuthContext";
import { agregarEjercicioARutina, crearRutina, getRutinasByEntrenador } from "../../services/rutinasServices.js";
import { crearEjercicio, getEjercicios } from "../../services/ejerciciosService.js";
import BackButton from "../../components/BackButton.jsx";

export default function EntrenadorRutinas() {
  const { user } = useAuth(); // { id, role, email, ... }
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ejercicios, setEjercicios] = useState([]);
  const [formsEjercicio, setFormsEjercicio] = useState({});
  const [ejercicioNuevo, setEjercicioNuevo] = useState({ nombre: "", descripcion: "" });
  const [rutinaNueva, setRutinaNueva] = useState({ titulo: "", nivel: "Inicial", duracionMin: 30, objetivo: "", estado: "activa" });
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(6);
  const [showCrearRutina, setShowCrearRutina] = useState(false);
  const [showNuevoEjercicio, setShowNuevoEjercicio] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    let alive = true;

    (async () => {
      if (!user?.id) {
        if (alive) {
          setRows([]);
          setEjercicios([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [data, ejerciciosData] = await Promise.all([
          getRutinasByEntrenador(user.id),
          getEjercicios()
        ]);

        if (alive) {
          setRows(data);
          setEjercicios(ejerciciosData);
        }
      } catch (err) {
        if (alive) {
          setError("No se pudieron cargar las rutinas. Revisá que estés logueado como entrenador.");
        }
        if (import.meta.env.DEV) {
          console.error("Error cargando rutinas o ejercicios", err);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => { alive = false; };
  }, [user?.id]);

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    const base = term
      ? rows.filter(r =>
        r.titulo.toLowerCase().includes(term) ||
        r.objetivo.toLowerCase().includes(term) ||
        r.nivel.toLowerCase().includes(term) ||
        r.estado.toLowerCase().includes(term)
      )
      : rows;
    return base.slice(0, pageSize);
  }, [rows, search, pageSize]);

  const rutinaEjercicios = useMemo(() => {
    const map = {};
    rows.forEach(r => { map[r.id] = r.ejercicios || []; });
    return map;
  }, [rows]);

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;
    const rutinaId = dataset.rutina;
    setFormsEjercicio(prev => ({
      ...prev,
      [rutinaId]: {
        ...(prev[rutinaId] || { ejercicioId: "", repeticiones: "", peso: "" }),
        [name]: value
      }
    }));
  };

  const handleRutinaChange = (e) => {
    const { name, value } = e.target;
    setRutinaNueva(prev => ({ ...prev, [name]: value }));
  };

  const handleEjercicioNuevoChange = (e) => {
    const { name, value } = e.target;
    setEjercicioNuevo(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (rutinaId, e) => {
    e.preventDefault();
    const form = formsEjercicio[rutinaId];
    if (!form?.ejercicioId || !form?.repeticiones) return;
    const ejercicioBase = ejercicios.find(ej => `${ej.id}` === `${form.ejercicioId}`);
    if (!ejercicioBase) return;

    const payload = {
      ...ejercicioBase,
      repeticiones: form.repeticiones,
      peso: form.peso
    };

    try {
      const updated = await agregarEjercicioARutina(rutinaId, payload);
      if (updated) {
        setRows(prev => prev.map(r => r.id === updated.id ? { ...updated } : r));
        setFormsEjercicio(prev => ({ ...prev, [rutinaId]: { ejercicioId: "", repeticiones: "", peso: "" } }));
      }
    } catch (err) {
      setError("No se pudo agregar el ejercicio a la rutina.");
      if (import.meta.env.DEV) {
        console.error("Error agregando ejercicio a rutina", err);
      }
    }
  };

  const handleCrearRutina = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError("Necesitás iniciar sesión como entrenador para crear rutinas.");
      return;
    }
    if (!rutinaNueva.titulo.trim()) return;
    try {
      const creada = await crearRutina({
        ...rutinaNueva,
        titulo: rutinaNueva.titulo.trim(),
        objetivo: rutinaNueva.objetivo.trim(),
        entrenadorId: user.id
      });
      setRows(prev => [creada, ...prev]);
      setRutinaNueva({ titulo: "", nivel: "Inicial", duracionMin: 30, objetivo: "", estado: "activa" });
      setShowCrearRutina(false);
      setError(null);
    } catch (err) {
      setError("No se pudo crear la rutina. Verificá tu sesión o intentá de nuevo.");
      if (import.meta.env.DEV) {
        console.error("Error creando rutina", err);
      }
    }
  };

  const handleCrearEjercicio = async (e) => {
    e.preventDefault();
    if (!ejercicioNuevo.nombre.trim()) return;
    try {
      const nuevo = await crearEjercicio({
        nombre: ejercicioNuevo.nombre.trim(),
        descripcion: ejercicioNuevo.descripcion.trim(),
        videoUrl: ""
      });
      setEjercicios(prev => [nuevo, ...prev]);
      setEjercicioNuevo({ nombre: "", descripcion: "" });
      if (expandedId) {
        setFormsEjercicio(prev => ({
          ...prev,
          [expandedId]: { ...(prev[expandedId] || {}), ejercicioId: String(nuevo.id) }
        }));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("No se pudo crear el ejercicio", error);
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="home-container">
      <main className="home-main">
        <BackButton />
        <h2 className="welcome">Mis rutinas</h2>
        <p className="subtitle">
          Administrá las rutinas asignadas a tus alumnos.
        </p>
        {error && <p style={{ color: "#b00020", marginBottom: "0.5rem" }}>{error}</p>}

        <div className="rutinas-toolbar">
          <input
            type="search"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rutinas-search"
          />
          <div className="rutinas-meta">
            <span>{rows.length} resultados</span>
            <label>
              Mostrar
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                {[3, 6, 9, 12].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="rutinas-actions">
          <button
            type="button"
            className={`add-rutina-btn ${showCrearRutina ? "is-open" : ""}`}
            onClick={() => setShowCrearRutina(prev => !prev)}
          >
            <div className="add-rutina-content">
              <span className="rutina-row-title">
                {showCrearRutina ? "Cerrar formulario" : "Agregar rutina"}
              </span>
              <div className="rutina-row-chips">
                <span className="rutina-row-item">{rutinaNueva.duracionMin || 0} min</span>
                <span className="rutina-row-item">{rutinaNueva.nivel || "Nivel"}</span>
                <span className="rutina-row-item">{rutinaNueva.titulo || "Nombre"}</span>
                <span className={`rutina-estado ${rutinaNueva.estado === "pausada" ? "pausada" : "activa"}`}>
                  {rutinaNueva.estado === "pausada" ? "Pausada" : "Activa"}
                </span>
              </div>
            </div>
          </button>
        </div>

        {showCrearRutina && (
          <div className="form-card">
            <div className="form-card-header" />
            <div className="form-card-body">
              <h3 className="form-card-title">Nueva rutina</h3>
              <form className="google-form" onSubmit={handleCrearRutina}>
                <label>
                  Nombre de la rutina
                  <input name="titulo" value={rutinaNueva.titulo} onChange={handleRutinaChange} placeholder="Ej: Calistenia mañana" required />
                </label>
                <label>
                  Nivel
                  <select name="nivel" value={rutinaNueva.nivel} onChange={handleRutinaChange}>
                    <option>Inicial</option>
                    <option>Intermedio</option>
                    <option>Avanzado</option>
                  </select>
                </label>
                <label>
                  Duración (min)
                  <input name="duracionMin" type="number" min="5" value={rutinaNueva.duracionMin} onChange={handleRutinaChange} placeholder="30" required />
                </label>
                <label>
                  Objetivo
                  <input name="objetivo" value={rutinaNueva.objetivo} onChange={handleRutinaChange} placeholder="Hipertrofia, bajar grasa, resistencia..." />
                </label>
                <label>
                  Estado
                  <select name="estado" value={rutinaNueva.estado} onChange={handleRutinaChange}>
                    <option value="activa">Activa</option>
                    <option value="pausada">Pausada</option>
                  </select>
                </label>
                <div className="form-actions">
                  <button type="submit" className="primary-btn">Crear rutina</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p>Cargando rutinas...</p>
        ) : (
          <div className="rutinas-list">
            {filtrados.map(r => (
              <article key={r.id} className="rutina-row" onClick={() => toggleExpand(r.id)}>
                <div className="rutina-row-main">
                  <span className="rutina-row-title">{r.titulo}</span>
                  <span className="rutina-row-item">{r.duracionMin} min</span>
                  <span className="rutina-row-item">{r.nivel}</span>
                  {r.objetivo && <span className="rutina-row-item">{r.objetivo}</span>}
                  <span className={`rutina-estado ${r.estado === "activa" ? "activa" : "pausada"}`}>
                    {r.estado === "activa" ? "Activa" : "Pausada"}
                  </span>
                  <span className="rutina-toggle">{expandedId === r.id ? "▲" : "▼"}</span>
                </div>
                {expandedId === r.id && (
                  <div className="rutina-row-details">
                    <p className="rutina-row-details-title">Ejercicios</p>
                    <ul>
                      {(rutinaEjercicios[r.id] || []).map((ej, idx) => (
                        <li key={`${r.id}-${idx}`}>
                          {ej.nombre} — {ej.repeticiones} reps{ej.peso ? ` | ${ej.peso} kg` : ""}
                        </li>
                      ))}
                      {!rutinaEjercicios[r.id]?.length && <li>Sin ejercicios aún.</li>}
                    </ul>
                    <div className="add-ejercicio">
                      <button type="button" className="secondary-btn" onClick={(e) => { e.stopPropagation(); setFormsEjercicio(prev => ({ ...prev, [r.id]: prev[r.id] || { ejercicioId: "", repeticiones: "", peso: "" } })); toggleExpand(r.id); }}>
                        Agregar ejercicio
                      </button>
                      {formsEjercicio[r.id] && (
                        <div className="form-card form-card-inline" onClick={(e) => e.stopPropagation()}>
                          <div className="form-card-header" />
                          <div className="form-card-body">
                            <h4 className="form-card-title">Agregar ejercicio</h4>
                            <form className="google-form" onSubmit={(e) => handleAdd(r.id, e)}>
                              <label>
                                Elegí ejercicio
                                <select name="ejercicioId" data-rutina={r.id} value={formsEjercicio[r.id]?.ejercicioId || ""} onChange={handleChange} required>
                                  <option value="">Seleccionar</option>
                                  {ejercicios.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
                                </select>
                              </label>
                              <label>
                                Repeticiones
                                <input name="repeticiones" data-rutina={r.id} value={formsEjercicio[r.id]?.repeticiones || ""} onChange={handleChange} placeholder="Ej: 12" required />
                              </label>
                              <label>
                                Peso (kg) opcional
                                <input name="peso" data-rutina={r.id} value={formsEjercicio[r.id]?.peso || ""} onChange={handleChange} placeholder="Ej: 20" />
                              </label>

                              <details className="panel-details" open={showNuevoEjercicio}>
                                <summary onClick={(e) => { e.preventDefault(); setShowNuevoEjercicio(prev => !prev); }}>Crear ejercicio nuevo</summary>
                                <div className="panel-form" style={{ marginTop: "0.35rem" }}>
                                  <input name="nombre" value={ejercicioNuevo.nombre} onChange={handleEjercicioNuevoChange} placeholder="Nombre ejercicio" />
                                  <textarea name="descripcion" value={ejercicioNuevo.descripcion} onChange={handleEjercicioNuevoChange} placeholder="Descripción (opcional)" />
                                  <button type="button" className="secondary-btn" onClick={handleCrearEjercicio}>Guardar ejercicio</button>
                                </div>
                              </details>

                              <div className="form-actions">
                                <button type="submit" className="primary-btn">Agregar a rutina</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            ))}
            {!filtrados.length && <p>No hay rutinas que coincidan.</p>}
          </div>
        )}
      </main>
    </div>
  );
}
