import api from "./api";

export async function getAlumnosByEntrenador(entrenadorId) {
  const params = entrenadorId ? { entrenadorId } : {};
  const response = await api.get("/alumnos", { params });
  return response.data;
}

export async function getAlumnosAll({ includeUnassigned = false } = {}) {
  const params = includeUnassigned ? { includeUnassigned: true } : {};
  const response = await api.get("/alumnos", { params });
  return response.data;
}

export async function asignarAlumnoAEntrenador(alumnoId) {
  const response = await api.post(`/alumnos/${alumnoId}/asignar`);
  return response.data;
}

export async function getAlumnosDisponibles() {
  const response = await api.get("/alumnos/disponibles");
  return response.data;
}

export async function desasignarAlumno(alumnoId) {
  const response = await api.post(`/alumnos/${alumnoId}/desasignar`);
  return response.data;
}
export async function asignarPlanAAlumno(alumnoId, payload) {
  const response = await api.post(`/alumnos/${alumnoId}/plan`, payload);
  return response.data.plan;
}
