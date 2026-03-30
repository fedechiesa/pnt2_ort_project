import express from 'express'
import { calendarioEntrenador } from '../controlador/entrenadores.js'

class RouterEntrenadores {
  config = () => {
    const router = express.Router()
    router.get('/:entrenadorId/calendario', calendarioEntrenador)
    return router
  }
}

export default RouterEntrenadores
