import AuthServicio from '../servicio/auth.js'

class AuthControlador {
    #servicio = null

    constructor() {
        this.#servicio = new AuthServicio()
    }

    #manejarError = (res, error, mensaje = 'Error en la operación') => {
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

    registrar = async (req, res) => {
        try {
            const resultado = await this.#servicio.registrar(req.body)
            res.status(201).json(resultado)
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo registrar')
        }
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body
            const resultado = await this.#servicio.login(email, password)
            res.json(resultado)
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo iniciar sesión')
        }
    }

    obtenerPerfil = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const usuario = await this.#servicio.obtenerPerfil(token)
            res.json({ user: usuario })
        }
        catch (error) {
            this.#manejarError(res, error, 'Token inválido')
        }
    }
        actualizarPerfil = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const usuario = await this.#servicio.actualizarPerfil(token, req.body)
            res.json({ user: usuario })
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo actualizar el perfil')
        }
    }


    refresh = async (req, res) => {
        try {
            const token = this.#extraerToken(req)
            const resultado = await this.#servicio.refresh(token)
            res.json(resultado)
        }
        catch (error) {
            this.#manejarError(res, error, 'No se pudo refrescar el token')
        }
    }

    logout = async (_req, res) => {
        res.json({ message: 'Logout exitoso' })
    }
}

export default AuthControlador
