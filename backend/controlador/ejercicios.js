import { validarToken } from '../servicio/tokenService.js'
import EjerciciosRepo from '../modelo/ejerciciosRepo.js'

class EjerciciosControlador {
    #repo = null

    constructor() {
        this.#repo = new EjerciciosRepo()
    }

    #manejarError = (res, error, mensaje = 'Error al obtener ejercicios') => {
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

            const entrenadorId = payload.rol === 'entrenador' ? payload.id : undefined
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

            const { nombre, descripcion, videoUrl } = req.body || {}
            if (!nombre || !nombre.trim()) {
                const error = new Error('El nombre es obligatorio')
                error.status = 400
                throw error
            }

            const creado = await this.#repo.crear({
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() || null,
                videoUrl: videoUrl?.trim() || null,
                entrenadorId: payload.id
            })

            res.status(201).json(creado)
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo crear el ejercicio')
        }
    }

    actualizar = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const payload = validarToken(token)

            if (payload.rol !== 'entrenador' && payload.rol !== 'admin') {
                const error = new Error('No autorizado')
                error.status = 403
                throw error
            }

            const id = parseInt(req.params.id)
            if (!id) {
                const error = new Error('Ejercicio inválido')
                error.status = 400
                throw error
            }

            const { nombre, descripcion, videoUrl } = req.body || {}
            const actualizado = await this.#repo.actualizar(id, {
                ...(nombre ? { nombre: nombre.trim() } : {}),
                descripcion: descripcion?.trim() ?? null,
                videoUrl: videoUrl?.trim() ?? null
            })
            if (!actualizado) {
                const error = new Error('Ejercicio no encontrado')
                error.status = 404
                throw error
            }
            res.json(actualizado)
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo actualizar el ejercicio')
        }
    }

    eliminar = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const payload = validarToken(token)

            if (payload.rol !== 'entrenador' && payload.rol !== 'admin') {
                const error = new Error('No autorizado')
                error.status = 403
                throw error
            }
            const id = parseInt(req.params.id)
            if (!id) {
                const error = new Error('Ejercicio inválido')
                error.status = 400
                throw error
            }
            const deleted = await this.#repo.eliminar(id)
            if (!deleted) {
                const error = new Error('Ejercicio no encontrado')
                error.status = 404
                throw error
            }
            res.json({ message: 'Ejercicio eliminado' })
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo eliminar el ejercicio')
        }
    }
}

export default EjerciciosControlador
