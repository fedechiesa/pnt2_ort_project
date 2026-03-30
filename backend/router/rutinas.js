import express from 'express'
import RutinasControlador from '../controlador/rutinas.js'

class RouterRutinas {
    #controlador = null

    constructor() {
        this.#controlador = new RutinasControlador()
    }

    config = () => {
        const router = express.Router()
        router.get('/', this.#controlador.listar)
        router.post('/', this.#controlador.crear)
        router.post('/:id/ejercicios', this.#controlador.agregarEjercicio)
        return router
    }
}

export default RouterRutinas
