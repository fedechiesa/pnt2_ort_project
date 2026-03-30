import api from "./api";

export async function getRutinasByEntrenador(entrenadorId) {
  const params = entrenadorId ? { entrenadorId } : {};
  const response = await api.get("/rutinas", { params });
  return response.data;
}

export async function getRutinasAll() {
  const response = await api.get("/rutinas");
  return response.data;
}

export async function crearRutina(rutina) {
  const response = await api.post("/rutinas", rutina);
  return response.data;
}

export async function agregarEjercicioARutina(rutinaId, ejercicio) {
  const response = await api.post(`/rutinas/${rutinaId}/ejercicios`, ejercicio);
  return response.data;
}
