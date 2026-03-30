import { DataTypes, Model } from 'sequelize'
import CnxSQLite from './DBSQLite.js'

class Ejercicio extends Model {}

class EjerciciosModel {
    static model = null

    static init = () => {
        if (!CnxSQLite.connectionOK || !CnxSQLite.sequelize) {
            throw new Error('La conexión a SQLite no está inicializada')
        }

        if (!EjerciciosModel.model) {
            EjerciciosModel.model = Ejercicio.init({
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                nombre: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                descripcion: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                videoUrl: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
                entrenadorId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                }
            }, {
                sequelize: CnxSQLite.sequelize,
                modelName: 'Ejercicio',
                tableName: 'ejercicios',
                timestamps: true
            })
        }

        return EjerciciosModel.model
    }

    static sync = async () => {
        const model = EjerciciosModel.init()
        await model.sync()
        return model
    }
}

export default EjerciciosModel
