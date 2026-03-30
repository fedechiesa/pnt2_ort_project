import { DataTypes, Model } from 'sequelize'
import CnxSQLite from './DBSQLite.js'

class Plan extends Model {}

class PlanesModel {
    static model = null

    static init = () => {
        if (!CnxSQLite.connectionOK || !CnxSQLite.sequelize) {
            throw new Error('La conexión a SQLite no está inicializada')
        }

        if (!PlanesModel.model) {
            PlanesModel.model = Plan.init({
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                alumnoId: {
                    type: DataTypes.INTEGER,
                    allowNull: true
                },
                nombre: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                objetivo: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                entrenadorId: {
                    type: DataTypes.INTEGER,
                    allowNull: true
                },
                entrenadorNombre: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                vigenciaDesde: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                vigenciaHasta: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                rutinas: {
                    // JSON string con ids o rutinas completas según se cree el plan.
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: '[]'
                },
                asignacion: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: '[]'
                },
                asignaciones: {
                    // lista de alumnos asignados a este plan base
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: '[]'
                },
                sesiones: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: '[]'
                },
                meta: {
                    type: DataTypes.TEXT,
                    allowNull: true
                }
            }, {
                sequelize: CnxSQLite.sequelize,
                modelName: 'Plan',
                tableName: 'planes',
                timestamps: true
            })
        }

        return PlanesModel.model
    }

    static sync = async () => {
        const model = PlanesModel.init()
        const qi = CnxSQLite.sequelize.getQueryInterface()
        try {
            const desc = await qi.describeTable('planes')
            if (!desc.vigenciaDesde) {
                await qi.addColumn('planes', 'vigenciaDesde', { type: DataTypes.STRING, allowNull: true })
            }
            if (!desc.vigenciaHasta) {
                await qi.addColumn('planes', 'vigenciaHasta', { type: DataTypes.STRING, allowNull: true })
            }
            if (!desc.entrenadorNombre) {
                await qi.addColumn('planes', 'entrenadorNombre', { type: DataTypes.STRING, allowNull: true })
            }
            if (!desc.meta) {
                await qi.addColumn('planes', 'meta', { type: DataTypes.TEXT, allowNull: true })
            }
            if (!desc.asignaciones) {
                await qi.addColumn('planes', 'asignaciones', { type: DataTypes.TEXT, allowNull: false, defaultValue: '[]' })
            }
            if (desc.alumnoId && desc.alumnoId.allowNull === false) {
                await qi.changeColumn('planes', 'alumnoId', {
                    type: DataTypes.INTEGER,
                    allowNull: true
                })
            }
        } catch (_e) {
            // si la tabla no existe todavía, sync la crea
        }
        await model.sync()
        return model
    }
}

export default PlanesModel
