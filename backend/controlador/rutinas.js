import { validarToken } from '../servicio/tokenService.js'
import RutinasRepo from '../modelo/rutinasRepo.js'

class RutinasControlador {
    #repo = null

    constructor() {
        this.#repo = new RutinasRepo()
    }

    #manejarError = (res, error, mensaje = 'Error al obtener rutinas') => {
        const status = error.status || 500
        const message = error.message || mensaje
        res.status(status).json({ message })
    }

    #extraerToken = req => {
        const authHeader = req.headers.authorization || ''
        if (authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7)
        }
        return req.body?.token || ''
    }

    listar = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const payload = validarToken(token)

            if (payload.rol !== 'entrenador' && payload.rol !== 'admin') {
                const error = new Error('No autorizado')
                error.status = 403
                throw error
            }

            const entrenadorId = payload.rol === 'entrenador'
                ? payload.id
                : (req.query.entrenadorId ? parseInt(req.query.entrenadorId) : undefined)

            const data = await this.#repo.listar({ entrenadorId })
            res.json(data)
        }
        catch (error) {
            this.#manejarError(res, error)
        }
    }

    crear = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const payload = validarToken(token)

            if (payload.rol !== 'entrenador' && payload.rol !== 'admin') {
                const error = new Error('No autorizado')
                error.status = 403
                throw error
            }

            const { titulo, nivel, duracionMin, objetivo, estado } = req.body || {}

            if (!titulo || !titulo.trim()) {
                const error = new Error('El título es obligatorio')
                error.status = 400
                throw error
            }

            const creada = await this.#repo.crear({
                titulo: titulo.trim(),
                nivel: nivel || 'Inicial',
                duracionMin: parseInt(duracionMin) || 30,
                objetivo: objetivo?.trim() || '',
                estado: estado || 'activa',
                ejercicios: [],
                entrenadorId: payload.id
            })

            res.status(201).json(creada)
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo crear la rutina')
        }
    }

    agregarEjercicio = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const payload = validarToken(token)

            if (payload.rol !== 'entrenador' && payload.rol !== 'admin') {
                const error = new Error('No autorizado')
                error.status = 403
                throw error
            }

            const rutinaId = parseInt(req.params.id)
            if (!rutinaId) {
                const error = new Error('Rutina inválida')
                error.status = 400
                throw error
            }

            const ejercicio = req.body || {}
            if (!ejercicio.nombre) {
                const error = new Error('Ejercicio inválido')
                error.status = 400
                throw error
            }

            const updated = await this.#repo.agregarEjercicio(rutinaId, ejercicio)
            if (!updated) {
                const error = new Error('Rutina no encontrada')
                error.status = 404
                throw error
            }

            res.json(updated)
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo agregar el ejercicio')
        }
    }
}

export default RutinasControlador
