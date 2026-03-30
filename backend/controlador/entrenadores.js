import AlumnosRepo from "../modelo/alumnosRepo.js";
import PlanesRepo from "../modelo/planesRepo.js";
import RutinasRepo from "../modelo/rutinasRepo.js";
const parseISODate = (iso) => {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return isNaN(dt.getTime()) ? null : dt;
};

// Utilidad local: generar sesiones futuras según asignación, preservando completadas
export const calendarioEntrenador = async (req, res) => {
  try {
    const entrenadorId = req.params.entrenadorId;
    const alumnosRepo = new AlumnosRepo();
    const planesRepo = new PlanesRepo();
    const rutinasRepo = new RutinasRepo();

    const alumnos = await alumnosRepo.listarPorEntrenador(entrenadorId);
    const events = [];

    for (const alumno of alumnos) {
      const plan = await planesRepo.obtenerPorAlumnoId(alumno.id);
      if (!plan) continue;
      const rutinasDb = await rutinasRepo.listarPorPlan(plan.id);
      const rutinasMap = new Map(rutinasDb.map((r) => [String(r.id), r]));

      (plan.sesiones || []).forEach((sesion) => {
        const rutina = rutinasMap.get(String(sesion.rutinaId));
        events.push({
          title: `${alumno.nombre || "Alumno"} — ${rutina?.titulo || rutina?.nombre || `Rutina ${sesion.rutinaId}`}`,
          start: sesion.start ? new Date(sesion.start) : new Date(sesion.fecha),
          end: sesion.end ? new Date(sesion.end) : new Date(sesion.fecha),
          meta: {
            alumnoId: alumno.id,
            rutinaId: sesion.rutinaId,
            done: !!sesion.done,
            planId: plan.id,
          },
        });
      });
    }

    return res.json({ events });
  } catch (error) {
    console.error("[calendarioEntrenador] error:", error);
    return res.status(500).json({ message: "No se pudo obtener el calendario del entrenador" });
  }
};

export default { calendarioEntrenador };
