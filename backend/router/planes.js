import express from 'express'
import { crearPlanGeneral, actualizarPlanGeneral, listarPlanesGeneral, eliminarPlanGeneral, agregarAsignacionPlan } from '../controlador/planController.js'

class RouterPlanes {
  config = () => {
    const router = express.Router()
    // Crear plan con múltiples rutinas (opcionalmente asociado a un alumno)
    router.post('/', crearPlanGeneral)
    // Listar todos los planes (con y sin alumno asignado)
    router.get('/', listarPlanesGeneral)
    // Actualizar plan y sus rutinas asignadas
    router.put('/:planId', actualizarPlanGeneral)
    // Eliminar plan y limpiar asignaciones
    router.delete('/:planId', eliminarPlanGeneral)
    // Agregar asignación de alumno a plan base
    router.post('/:planId/asignaciones', agregarAsignacionPlan)
    return router
  }
}

export default RouterPlanes
