import express from 'express'
import RouterAuth from './router/auth.js'
import RouterAlumnos from './router/alumnos.js'
import RouterEjercicios from './router/ejercicios.js'
import RouterRutinas from './router/rutinas.js'
import RouterPlanes from './router/planes.js'
import RouterUploads from './router/uploads.js'
import RouterEntrenadores from './router/entrenadores.js'

class Server {
    #port = null
    #app = null
    #routerAuth = null
    #routerAlumnos = null
    #routerEjercicios = null
    #routerRutinas = null
    #routerPlanes = null
    #routerUploads = null
    #routerEntrenadores = null

    constructor(port) {
        process.env.TZ = 'America/Argentina/Buenos_Aires'
        this.#port = port
        this.#app = express()
        this.#routerAuth = new RouterAuth()
        this.#routerAlumnos = new RouterAlumnos()
        this.#routerEjercicios = new RouterEjercicios()
        this.#routerRutinas = new RouterRutinas()
        this.#routerPlanes = new RouterPlanes()
        this.#routerUploads = new RouterUploads()
        this.#routerEntrenadores = new RouterEntrenadores()
        this.#config()
    }

    #config() {
        this.#app.use(express.json())
        this.#app.use(express.urlencoded({ extended: true }))
        this.#app.use(express.static('public'))

        this.#app.use('/api/auth', this.#routerAuth.config())
        this.#app.use('/api/alumnos', this.#routerAlumnos.config())
        this.#app.use('/api/ejercicios', this.#routerEjercicios.config())
        this.#app.use('/api/rutinas', this.#routerRutinas.config())
        this.#app.use('/api/planes', this.#routerPlanes.config())
        this.#app.use('/api/uploads', this.#routerUploads.config())
        this.#app.use('/api/entrenadores', this.#routerEntrenadores.config())

        this.#app.get('/health', (req, res) => {
            res.json({
                status: 'UP',
                timestamp: new Date().toISOString()
            })
        })

    }

    start() {
        this.#app.listen(this.#port, () => {
            console.log(`Servidor corriendo en http://localhost:${this.#port}`)
        })
    }
}

export default Server
