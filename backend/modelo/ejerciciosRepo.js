import EjerciciosModel from './ejerciciosModel.js'

class EjerciciosRepo {
    #ejerciciosModel = null
    #ready = null

    constructor() {
        this.#ejerciciosModel = EjerciciosModel.init()
        this.#ready = EjerciciosModel.sync()
    }

    #ensureReady = async () => {
        await this.#ready
    }

    crear = async ejercicio => {
        await this.#ensureReady()
        const creado = await this.#ejerciciosModel.create(ejercicio)
        return creado.get({ plain: true })
    }

    actualizar = async (id, data) => {
        await this.#ensureReady()
        const rows = await this.#ejerciciosModel.update(data, { where: { id } })
        if (!rows[0]) return null
        const encontrado = await this.#ejerciciosModel.findByPk(id)
        return encontrado ? encontrado.get({ plain: true }) : null
    }

    eliminar = async id => {
        await this.#ensureReady()
        return this.#ejerciciosModel.destroy({ where: { id } })
    }

    listar = async ({ entrenadorId } = {}) => {
        await this.#ensureReady()
        const where = entrenadorId ? { entrenadorId } : {}
        const rows = await this.#ejerciciosModel.findAll({
            where,
            order: [['id', 'DESC']]
        })
        return rows.map(r => r.get({ plain: true }))
    }
}

export default EjerciciosRepo
