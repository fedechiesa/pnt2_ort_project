import { DataTypes, Model } from 'sequelize'
import CnxSQLite from './DBSQLite.js'

class Rutina extends Model {}

class RutinasModel {
    static model = null

    static init = () => {
        if (!CnxSQLite.connectionOK || !CnxSQLite.sequelize) {
            throw new Error('La conexión a SQLite no está inicializada')
        }

        if (!RutinasModel.model) {
            RutinasModel.model = Rutina.init({
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                titulo: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                nivel: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                duracionMin: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                objetivo: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                estado: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: 'activa'
                },
                idPlan: {
                    // vínculo explícito a plan; opcional para rutinas libres
                    type: DataTypes.INTEGER,
                    allowNull: true
                },
                entrenadorId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                ejercicios: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: '[]'
                }
            }, {
                sequelize: CnxSQLite.sequelize,
                modelName: 'Rutina',
                tableName: 'rutinas',
                timestamps: true
            })
        }

        return RutinasModel.model
    }

    static sync = async () => {
        const model = RutinasModel.init()
        // Agregamos idPlan si no existe, evitando el backup con duplicados que hace alter:true
        const qi = CnxSQLite.sequelize.getQueryInterface()
        try {
            const desc = await qi.describeTable('rutinas')
            if (!desc.idPlan) {
                await qi.addColumn('rutinas', 'idPlan', { type: DataTypes.INTEGER, allowNull: true })
            }
        } catch (e) {
            // Si la tabla no existe aún, sync la crea más abajo
        }
        await model.sync()
        return model
    }
}

export default RutinasModel
