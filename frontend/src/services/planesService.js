import api from "./api";

export async function crearPlanGeneral(payload) {
  const response = await api.post("/planes", payload);
  return response.data.plan;
}

export async function listarPlanes() {
  const response = await api.get("/planes");
  return response.data.planes || [];
}

export async function eliminarPlan(planId) {
  const response = await api.delete(`/planes/${planId}`);
  return response.data;
}

export async function asignarPlanBase(planId, payload) {
  const response = await api.post(`/planes/${planId}/asignaciones`, payload);
  return response.data.plan;
}
