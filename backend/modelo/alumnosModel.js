import { DataTypes, Model } from "sequelize";
import CnxSQLite from "./DBSQLite.js";

class Alumno extends Model {}

class AlumnosModel {
  static model = null;

  static init = () => {
    if (!CnxSQLite.connectionOK || !CnxSQLite.sequelize) {
      throw new Error("La conexión a SQLite no está inicializada");
    }

    if (!AlumnosModel.model) {
      AlumnosModel.model = Alumno.init(
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          nombre: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
          },
          objetivo: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "activo",
          },
          entrenadorId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          avatarUrl: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          peso: {
            type: DataTypes.FLOAT,
            allowNull: true,
          },
          altura: {
            type: DataTypes.FLOAT,
            allowNull: true,
          },
          planId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
        },
        {
          sequelize: CnxSQLite.sequelize,
          modelName: "Alumno",
          tableName: "alumnos",
          timestamps: true,
        }
      );
    }

    return AlumnosModel.model;
  };

  static sync = async () => {
    const model = AlumnosModel.init();
    // Agregamos planId si falta sin recrear la tabla (evita errores de alter en SQLite)
    const qi = CnxSQLite.sequelize.getQueryInterface();
    try {
      const desc = await qi.describeTable("alumnos");
      if (!desc.planId) {
        await qi.addColumn("alumnos", "planId", {
          type: DataTypes.INTEGER,
          allowNull: true,
        });
      }
    } catch (_e) {
      // Si la tabla no existe aún, sync la creará abajo
    }
    await model.sync();
    return model;
  };
}

export default AlumnosModel;
