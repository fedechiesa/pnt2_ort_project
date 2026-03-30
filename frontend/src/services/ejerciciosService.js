import api from "./api";

export async function getEjercicios() {
  const response = await api.get("/ejercicios");
  return response.data;
}

export async function crearEjercicio(ejercicio) {
  const response = await api.post("/ejercicios", ejercicio);
  return response.data;
}

export async function actualizarEjercicio(id, ejercicio) {
  const response = await api.put(`/ejercicios/${id}`, ejercicio);
  return response.data;
}

export async function eliminarEjercicio(id) {
  const response = await api.delete(`/ejercicios/${id}`);
  return response.data;
}
