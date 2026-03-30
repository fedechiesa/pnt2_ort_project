import PlanesModel from './planesModel.js'

class PlanesRepo {
    #planesModel = null
    #ready = null

    constructor() {
        this.#planesModel = PlanesModel.init()
        this.#ready = PlanesModel.sync()
    }

    #ensureReady = async () => {
        await this.#ready
    }

    #mapRow = row => {
        if (!row) return null
        const plain = row.get({ plain: true })
        const parseJson = (val, fallback) => {
            try {
                return val ? JSON.parse(val) : fallback
            } catch (_e) {
                return fallback
            }
        }
        return {
            ...plain,
            rutinas: parseJson(plain.rutinas, []),
            asignacion: parseJson(plain.asignacion, []),
            asignaciones: parseJson(plain.asignaciones, []),
            sesiones: parseJson(plain.sesiones, []),
            meta: parseJson(plain.meta, null)
        }
    }

    /**
     * Crea y asocia un plan a un alumno. Guarda rutinas por id.
     */
    crearParaAlumno = async (alumnoId, data) => {
        await this.#ensureReady()
        const created = await this.#planesModel.create({
            alumnoId,
            nombre: data.nombre,
            objetivo: data.objetivo || '',
            entrenadorId: data.entrenadorId ?? null,
            entrenadorNombre: data.entrenadorNombre ?? null,
            vigenciaDesde: data.vigencia?.desde ?? data.vigenciaDesde ?? null,
            vigenciaHasta: data.vigencia?.hasta ?? data.vigenciaHasta ?? null,
            rutinas: JSON.stringify(data.rutinas || []),
            asignacion: JSON.stringify(data.asignacion || []),
            asignaciones: JSON.stringify(data.asignaciones || []),
            sesiones: JSON.stringify(data.sesiones || []),
            meta: data.meta ? JSON.stringify(data.meta) : null
        })
        return this.#mapRow(created)
    }

    obtenerPorAlumnoId = async alumnoId => {
        await this.#ensureReady()
        const row = await this.#planesModel.findOne({ where: { alumnoId } })
        return this.#mapRow(row)
    }

    obtenerPorId = async planId => {
        await this.#ensureReady()
        const row = await this.#planesModel.findByPk(planId)
        return this.#mapRow(row)
    }

    listarTodos = async () => {
        await this.#ensureReady()
        const rows = await this.#planesModel.findAll({
            order: [['id', 'DESC']]
        })
        return rows.map(this.#mapRow)
    }

    actualizarAsignacion = async (alumnoId, asignacion) => {
        await this.#ensureReady()
        const plan = await this.obtenerPorAlumnoId(alumnoId)
        if (!plan) return null

        await this.#planesModel.update(
            { asignacion: JSON.stringify(asignacion) },
            { where: { alumnoId } }
        )
        return this.obtenerPorAlumnoId(alumnoId)
    }

    marcarSesion = async (alumnoId, sesiones) => {
        await this.#ensureReady()
        const plan = await this.obtenerPorAlumnoId(alumnoId)
        if (!plan) return null
        await this.#planesModel.update(
            { sesiones: JSON.stringify(sesiones) },
            { where: { alumnoId } }
        )
        return this.obtenerPorAlumnoId(alumnoId)
    }

    actualizarPlan = async (planId, data) => {
        await this.#ensureReady()
        const plan = await this.obtenerPorId(planId)
        if (!plan) return null

        await this.#planesModel.update({
            alumnoId: data.alumnoId ?? plan.alumnoId,
            nombre: data.nombre ?? plan.nombre,
            objetivo: data.objetivo ?? plan.objetivo,
            entrenadorId: data.entrenadorId ?? plan.entrenadorId,
            entrenadorNombre: data.entrenadorNombre ?? plan.entrenadorNombre,
            vigenciaDesde: data.vigencia?.desde ?? plan.vigenciaDesde,
            vigenciaHasta: data.vigencia?.hasta ?? plan.vigenciaHasta,
            rutinas: JSON.stringify(data.rutinas ?? plan.rutinas),
            asignacion: JSON.stringify(data.asignacion ?? plan.asignacion),
            asignaciones: JSON.stringify(data.asignaciones ?? plan.asignaciones),
            sesiones: JSON.stringify(data.sesiones ?? plan.sesiones),
            meta: data.meta ? JSON.stringify(data.meta) : plan.meta
        }, { where: { id: planId } })

        return this.obtenerPorId(planId)
    }

    eliminarPlan = async (planId) => {
        await this.#ensureReady()
        return this.#planesModel.destroy({ where: { id: planId } })
    }

    agregarAsignacion = async (planId, asignacion) => {
        await this.#ensureReady()
        const plan = await this.obtenerPorId(planId)
        if (!plan) return null
        const nuevas = Array.isArray(plan.asignaciones) ? [...plan.asignaciones] : []
        nuevas.push(asignacion)
        await this.#planesModel.update(
            { asignaciones: JSON.stringify(nuevas) },
            { where: { id: planId } }
        )
        return this.obtenerPorId(planId)
    }
}

export default PlanesRepo
