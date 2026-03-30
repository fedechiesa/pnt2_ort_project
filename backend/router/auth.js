import express from 'express'
import ControladorAuth from '../controlador/auth.js'

class RouterAuth {
    #controlador = null

    constructor() {
        this.#controlador = new ControladorAuth()
    }

    config = () => {
        const router = express.Router()

        router.post('/register', this.#controlador.registrar)
        router.post('/login', this.#controlador.login)
        router.get('/me', this.#controlador.obtenerPerfil)
        router.put('/profile', this.#controlador.actualizarPerfil)
        router.post('/refresh', this.#controlador.refresh)
        router.post('/logout', this.#controlador.logout)

        return router
    }
}

export default RouterAuth
