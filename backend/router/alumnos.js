import express from 'express'
import AlumnosControlador from '../controlador/alumnos.js'
import { asignarPlan, getPlan, patchSesion, putAsignacion } from '../controlador/planController.js'

class RouterAlumnos {
    #controlador = null

    constructor() {
        this.#controlador = new AlumnosControlador()
    }

    config = () => {
        const router = express.Router()
        router.get('/', this.#controlador.listar)
        router.get('/disponibles', this.#controlador.listarDisponibles)
        router.get('/:id/rutinas', this.#controlador.rutinasAsignadas)
        router.get('/:alumnoId/plan', getPlan)
        router.put('/:alumnoId/plan/asignacion', putAsignacion)
        router.patch('/:alumnoId/plan/sesiones/:fecha', patchSesion)
        router.post('/:alumnoId/plan', asignarPlan)
        router.post('/:id/asignar', this.#controlador.asignar)
        router.post('/:id/desasignar', this.#controlador.desasignar)
        return router
    }
}

export default RouterAlumnos
