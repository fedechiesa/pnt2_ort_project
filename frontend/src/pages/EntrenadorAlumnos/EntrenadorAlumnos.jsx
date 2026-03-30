import { useEffect, useState } from "react";
import "../../App.css";
import DataList from "../../components/DataList"; // 👈 nuevo import (usa index.jsx)
import { useAuth } from "../../context/AuthContext";
import {
  asignarAlumnoAEntrenador,
  desasignarAlumno,
  getAlumnosDisponibles,
  getAlumnosByEntrenador,
} from "../../services/alumnosServices.js"; // 👈 ajustá el nombre al de tu servicio real
import BackButton from "../../components/BackButton.jsx";

export default function EntrenadorAlumnos() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [poolOpen, setPoolOpen] = useState(false);
  const [poolLoading, setPoolLoading] = useState(false);
  const [pool, setPool] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [poolCounts, setPoolCounts] = useState({ disponibles: 0, mis: 0, total: 0 });
  const [removingId, setRemovingId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [isFichaOpen, setIsFichaOpen] = useState(false);

  const openFicha = (row) => {
    if (!row) return;
    setSelectedAlumno(row);
    setIsFichaOpen(true);
  };


  const closeFicha = () => {
    setIsFichaOpen(false);
    setSelectedAlumno(null);
  };

  useEffect(() => {
    let alive = true;
    if (!user?.id) {
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    (async () => {
      setLoading(true);
      console.log("Entrenador logueado (alumnos):", user);

      try {
        const data = await getAlumnosByEntrenador(user.id);
        console.log("Alumnos del entrenador:", data);

        if (alive) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error al obtener alumnos:", error);
        if (alive) {
          setRows([]);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  const fetchPool = async () => {
    if (!user?.id) return;
    setPoolLoading(true);
    try {
      const data = await getAlumnosDisponibles();
      const todos = Array.isArray(data) ? data : [];
      const visibles = todos.filter((p) => !p.entrenadorId || p.entrenadorId === user.id);
      const disponibles = visibles.filter((p) => !p.entrenadorId).length;
      const mis = visibles.filter((p) => p.entrenadorId === user.id).length;
      setPool(visibles);
      setPoolCounts({
        disponibles,
        mis,
        total: todos.length,
      });
    } catch (error) {
      console.error("Error al cargar pool de alumnos:", error);
      setPool([]);
      setPoolCounts({ disponibles: 0, mis: 0, total: 0 });
    } finally {
      setPoolLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
  }, [user?.id]);

  const columns = [
    { key: "nombre", header: "Nombre", accessor: "nombre", sortable: true },
    { key: "objetivo", header: "Objetivo", accessor: "objetivo" },
    { key: "email", header: "Email", accessor: "email", sortable: true },
    {
      key: "estado",
      header: "Estado",
      accessor: "estado",
      sortable: true,
      render: (v) => (v === "activo" ? "Activo" : "Pausado"),
    },
  ];
  const handleRowClick = (row) => {
    openFicha(row);
  };

  useEffect(() => {
    if (!mensaje) return;
    const timer = setTimeout(() => setMensaje(""), 4000);
    return () => clearTimeout(timer);
  }, [mensaje]);


  const togglePool = async () => {
    const next = !poolOpen;
    setPoolOpen(next);
    if (next) {
      await fetchPool();
    }
  };

  const handleAsignar = async (alumnoId) => {
    setAssigningId(alumnoId);
    try {
      await asignarAlumnoAEntrenador(alumnoId);
      const [mios, todos] = await Promise.all([
        getAlumnosByEntrenador(user.id),
        getAlumnosDisponibles(),
      ]);
      setRows(Array.isArray(mios) ? mios : []);
      const todosArr = Array.isArray(todos) ? todos : [];
      const visibles = todosArr.filter((p) => !p.entrenadorId || p.entrenadorId === user.id);
      const disponibles = visibles.filter((p) => !p.entrenadorId).length;
      const mis = visibles.filter((p) => p.entrenadorId === user.id).length;
      setPool(visibles);
      setPoolCounts({
        disponibles,
        mis,
        total: todosArr.length,
      });
    } catch (error) {
      console.error("No se pudo asignar alumno:", error);
    } finally {
      setAssigningId(null);
    }
  };

  const handleDesasignar = async (alumnoId) => {
    setRemovingId(alumnoId);
    try {
      await desasignarAlumno(alumnoId);
      const [mios, todos] = await Promise.all([
        getAlumnosByEntrenador(user.id),
        getAlumnosDisponibles(),
      ]);
      setRows(Array.isArray(mios) ? mios : []);
      const todosArr = Array.isArray(todos) ? todos : [];
      const visibles = todosArr.filter((p) => !p.entrenadorId || p.entrenadorId === user.id);
      const disponibles = visibles.filter((p) => !p.entrenadorId).length;
      const mis = visibles.filter((p) => p.entrenadorId === user.id).length;
      setPool(visibles);
      setPoolCounts({
        disponibles,
        mis,
        total: todosArr.length,
      });
      setMensaje("Alumno quitado de tu lista.");
    } catch (error) {
      console.error("No se pudo desasignar alumno:", error);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="home-container">
      <main className="home-main">
        <BackButton />
        <h2 className="welcome">Mis alumnos</h2>
        <p className="subtitle">
          Listado de alumnos asociados a este entrenador.
        </p>

        <div
          className="rutinas-actions"
          style={{ maxWidth: "520px", margin: "0 auto 0.75rem" }}
        >
          <button
            type="button"
            className={`add-plan-btn ${poolOpen ? "is-open" : ""}`}
            onClick={togglePool}
          >
            <div className="add-rutina-content">
              <span className="rutina-row-title">
                {poolOpen ? "Cerrar selección" : "Asignar alumnos"}
              </span>
              <div className="rutina-row-chips">
                <span className="rutina-row-item">
                  Disponibles: {poolCounts.disponibles}
                </span>
                <span className="rutina-row-item">
                  Mis alumnos: {poolCounts.mis}
                </span>
                <span className="rutina-row-item">
                  Total: {poolCounts.total}
                </span>
              </div>
            </div>
          </button>
        </div>

        {poolOpen && (
          <div
            className="form-card"
            style={{ maxWidth: "760px", margin: "0 auto 1rem" }}
          >
            <div className="form-card-header" />
            <div className="form-card-body">
              <h3 className="form-card-title">Alumnos disponibles</h3>
              {poolLoading ? (
                <p>Cargando alumnos...</p>
              ) : (
                <div className="pool-list">
                  {pool.map((a) => (
                    <div key={a.id} className="pool-row">
                      <div>
                        <strong>{a.nombre}</strong> — {a.email}
                        <div style={{ color: "#555" }}>
                          {a.objetivo || "Sin objetivo"}
                        </div>
                      </div>
                      <div className="pool-actions">
                        <span
                          className={`rutina-estado ${
                            a.entrenadorId ? "pausada" : "activa"
                          }`}
                        >
                          {a.entrenadorId
                            ? `Asignado a #${a.entrenadorId}`
                            : "Disponible"}
                        </span>
                        {!a.entrenadorId && (
                          <button
                            type="button"
                            className="primary-btn"
                            disabled={assigningId === a.id}
                            onClick={() => handleAsignar(a.id)}
                          >
                            {assigningId === a.id ? "Asignando..." : "Asignar"}
                          </button>
                        )}
                        {a.entrenadorId === user.id && (
                          <button
                            type="button"
                            className="secondary-btn"
                            disabled={
                              assigningId === a.id || removingId === a.id
                            }
                            onClick={() => handleDesasignar(a.id)}
                          >
                            {removingId === a.id ? "Quitando..." : "Quitar"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!pool.length && <p>No hay alumnos en la base.</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {mensaje && (
          <div
            className="plan-alert"
            style={{ margin: "0 auto 0.75rem", maxWidth: "760px" }}
          >
            {mensaje}
          </div>
        )}

        {isFichaOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Ficha de {selectedAlumno?.nombre}</h3>
      <p>
        <strong>Email:</strong> {selectedAlumno?.email}
      </p>

      <p>
        <strong>Peso:</strong>{" "}
        {selectedAlumno?.peso != null ? `${selectedAlumno.peso} kg` : "No cargado"}
      </p>

      <p>
        <strong>Altura:</strong>{" "}
        {selectedAlumno?.altura != null ? `${selectedAlumno.altura} cm` : "No cargada"}
      </p>

      {selectedAlumno?.estado && (
        <p>
          <strong>Estado:</strong>{" "}
          {selectedAlumno.estado === "activo" ? "Activo" : "Pausado"}
        </p>
      )}

      <button
        type="button"
        className="primary-btn"
        onClick={closeFicha}
      >
        Cerrar
      </button>
    </div>
  </div>
)}


        <DataList
          columns={columns}
          data={rows}
          loading={loading}
          searchable
          imageAccessor={(a) => a.avatarUrl ?? "/images/alumnos/default.png"}
          onRowClick={handleRowClick}
          emptyText="Todavía no tenés alumnos asignados. ¡Prepará tus cartas para el próximo duelo! ✨"
          pageSizeOptions={[6, 12, 24]}
          initialPageSize={6}
        />
      </main>
    </div>
  );
}
