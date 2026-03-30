import express from 'express'
import EjerciciosControlador from '../controlador/ejercicios.js'

class RouterEjercicios {
    #controlador = null

    constructor() {
        this.#controlador = new EjerciciosControlador()
    }

    config = () => {
        const router = express.Router()
        router.get('/', this.#controlador.listar)
        router.post('/', this.#controlador.crear)
        router.put('/:id', this.#controlador.actualizar)
        router.delete('/:id', this.#controlador.eliminar)
        return router
    }
}

export default RouterEjercicios
