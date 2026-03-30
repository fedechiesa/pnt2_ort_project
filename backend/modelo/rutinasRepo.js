import RutinasModel from './rutinasModel.js'

class RutinasRepo {
    #rutinasModel = null
    #ready = null

    constructor() {
        this.#rutinasModel = RutinasModel.init()
        this.#ready = RutinasModel.sync()
    }

    #ensureReady = async () => {
        await this.#ready
    }

    #mapRow = row => {
        if (!row) return null
        const plain = row.get({ plain: true })
        let ejercicios = []
        try {
            ejercicios = plain.ejercicios ? JSON.parse(plain.ejercicios) : []
        } catch (_e) {
            ejercicios = []
        }
        return {
            ...plain,
            ejercicios
        }
    }

    crear = async rutina => {
        await this.#ensureReady()
        const creada = await this.#rutinasModel.create({
            ...rutina,
            idPlan: rutina.idPlan ?? null,
            ejercicios: JSON.stringify(rutina.ejercicios || [])
        })
        return this.#mapRow(creada)
    }

    listar = async ({ entrenadorId } = {}) => {
        await this.#ensureReady()
        const where = entrenadorId ? { entrenadorId } : {}
        const rows = await this.#rutinasModel.findAll({
            where,
            order: [['id', 'DESC']]
        })
        return rows.map(this.#mapRow)
    }

    listarPorPlan = async (planId) => {
        await this.#ensureReady()
        if (!planId) return []
        const rows = await this.#rutinasModel.findAll({
            where: { idPlan: planId },
            order: [['id', 'ASC']]
        })
        return rows.map(this.#mapRow)
    }

    agregarEjercicio = async (rutinaId, ejercicio) => {
        await this.#ensureReady()
        const rutina = await this.#rutinasModel.findByPk(rutinaId)
        if (!rutina) return null

        const ejercicios = rutina.ejercicios ? JSON.parse(rutina.ejercicios) : []
        ejercicios.push(ejercicio)

        await this.#rutinasModel.update(
            { ejercicios: JSON.stringify(ejercicios) },
            { where: { id: rutinaId } }
        )

        const updated = await this.#rutinasModel.findByPk(rutinaId)
        return this.#mapRow(updated)
    }

    /**
     * Busca múltiples rutinas por id. Se usa para unir un plan -> rutinas -> ejercicios
     * sin tener que traer todas las rutinas de la base.
     */
    buscarPorIds = async (ids = []) => {
        await this.#ensureReady()
        if (!Array.isArray(ids) || !ids.length) return []
        // Aceptamos ids como string o number, filtrando los válidos
        const numericIds = ids
            .map(id => parseInt(id))
            .filter(n => !Number.isNaN(n))
        if (!numericIds.length) return []

        const rows = await this.#rutinasModel.findAll({
            where: { id: numericIds }
        })
        return rows.map(row => this.#mapRow(row))
    }

    /**
     * Asocia un conjunto de rutinas a un plan (set idPlan) en batch.
     */
    asignarPlanARutinas = async (rutinaIds = [], planId) => {
        await this.#ensureReady()
        const ids = (rutinaIds || [])
            .map(r => (typeof r === 'object' ? r.id ?? r.rutinaId ?? r : r))
            .map(n => parseInt(n))
            .filter(n => !Number.isNaN(n))
        if (!ids.length || !planId) return 0
        const result = await this.#rutinasModel.update(
            { idPlan: planId },
            { where: { id: ids } }
        )
        return result?.[0] ?? 0
    }

    /**
     * Desasocia todas las rutinas de un plan (setea idPlan en null).
     */
    limpiarPlan = async (planId) => {
        await this.#ensureReady()
        if (!planId) return 0
        const result = await this.#rutinasModel.update(
            { idPlan: null },
            { where: { idPlan: planId } }
        )
        return result?.[0] ?? 0
    }
}

export default RutinasRepo
