import Joi from "joi";

export const DIA_SEMANA = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

/**
 * Error semántico del dominio Plan.
 */
export class PlanError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "PlanError";
    this.status = status;
  }
}

const planes = new Map();

const asignacionSchema = Joi.array()
  .items(
    Joi.object({
      rutinaId: Joi.string().required(),
      dias: Joi.array().items(Joi.string().valid(...DIA_SEMANA)).min(1).required(),
      orden: Joi.number().integer().min(1).optional(),
    })
  )
  .min(1);

/**
 * Regla de negocio: genera una asignación semanal por defecto.
 *  - 3 rutinas: lun, mie, vie
 *  - 4 rutinas: lun, mar, jue, vie
 *  - 1,2,5+ rutinas: se reparten de lun a sab de manera homogénea.
 * @param {Array<{id:string}>} rutinas
 * @returns {Array<{rutinaId:string,dias:string[],orden:number}>}
 */
export function generarAsignacionPorDefecto(rutinas = []) {
  const total = rutinas.length;
  if (!total) return [];

  const diasPreferidos = {
    3: ["lun", "mie", "vie"],
    4: ["lun", "mar", "jue", "vie"],
  };

  const ciclo = ["lun", "mar", "mie", "jue", "vie", "sab"];
  const pattern = diasPreferidos[total] ?? null;

  return rutinas.map((rutina, index) => {
    const dia = pattern ? pattern[index % pattern.length] : ciclo[index % ciclo.length];
    return {
      rutinaId: rutina.id,
      dias: [dia],
      orden: index + 1,
    };
  });
}

/**
 * Valida estructura y semántica de la asignación.
 */
function validarAsignacion(asignacion, plan) {
  const { error } = asignacionSchema.validate(asignacion, { abortEarly: false });
  if (error) throw new PlanError(`Asignación inválida: ${error.message}`, 400);

  const rutinasIds = new Set(plan.rutinas.map((r) => r.id));
  asignacion.forEach((item) => {
    if (!rutinasIds.has(item.rutinaId)) {
      throw new PlanError(`rutinaId inexistente: ${item.rutinaId}`, 400);
    }
    item.dias.forEach((dia) => {
      if (!DIA_SEMANA.includes(dia)) {
        throw new PlanError(`Día no permitido: ${dia}`, 400);
      }
    });
  });
}

const isoLocalDate = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

const clonar = (data) => JSON.parse(JSON.stringify(data));

const esFechaISOValida = (fecha) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [y, m, d] = fecha.split("-").map(Number);
  const fechaDate = new Date(Date.UTC(y, m - 1, d));
  return fechaDate.getUTCFullYear() === y && fechaDate.getUTCMonth() === m - 1 && fechaDate.getUTCDate() === d;
};

function crearPlanPorDefecto(alumnoId) {
  const rutinasDemo = [
    { id: `${alumnoId}-r1`, nombre: "Fuerza A" },
    { id: `${alumnoId}-r2`, nombre: "Fuerza B" },
    { id: `${alumnoId}-r3`, nombre: "Cardio" },
  ];

  return {
    id: `plan-${alumnoId}`,
    alumnoId,
    nombre: "Plan Express",
    objetivo: "Mantenerse activo",
    entrenador: { id: "coach-demo", nombre: "Entrenador Fit&Track" },
    vigencia: { desde: isoLocalDate() },
    rutinas: rutinasDemo,
    asignacion: generarAsignacionPorDefecto(rutinasDemo),
    sesiones: [],
  };
}

/**
 * Devuelve el plan activo del alumno; si no existe, crea uno base.
 */
export function obtenerPlan(alumnoId) {
  if (!alumnoId) throw new PlanError("AlumnoId requerido", 400);
  const plan = planes.get(alumnoId) ?? crearPlanPorDefecto(alumnoId);
  planes.set(alumnoId, plan);
  return clonar(plan);
}

/**
 * Persistencia simplificada en memoria.
 */
function guardarPlan(plan) {
  planes.set(plan.alumnoId, plan);
  return clonar(plan);
}

/**
 * Actualiza días y orden de cada rutina del plan.
 */
export function actualizarAsignacion(alumnoId, asignacion) {
  const plan = planes.get(alumnoId) ?? crearPlanPorDefecto(alumnoId);
  validarAsignacion(asignacion, plan);

  const normalizada = asignacion.map((item, idx) => ({
    rutinaId: item.rutinaId,
    dias: [...new Set(item.dias)],
    orden: item.orden ?? idx + 1,
  }));

  plan.asignacion = normalizada;
  return guardarPlan(plan);
}

/**
 * Marca/destilda una sesión puntual.
 */
export function marcarSesion(alumnoId, fecha, rutinaId, done) {
  const plan = planes.get(alumnoId) ?? crearPlanPorDefecto(alumnoId);
  if (!esFechaISOValida(fecha)) throw new PlanError("Fecha inválida, usar yyyy-mm-dd", 400);
  if (!plan.rutinas.some((r) => r.id === rutinaId)) {
    throw new PlanError(`rutinaId inexistente: ${rutinaId}`, 400);
  }

  const existente = plan.sesiones.find((s) => s.fecha === fecha && s.rutinaId === rutinaId);
  if (existente) {
    existente.done = !!done;
  } else {
    plan.sesiones.push({ fecha, rutinaId, done: !!done });
  }
  return guardarPlan(plan);
}

export default {
  obtenerPlan,
  actualizarAsignacion,
  marcarSesion,
  generarAsignacionPorDefecto,
};
