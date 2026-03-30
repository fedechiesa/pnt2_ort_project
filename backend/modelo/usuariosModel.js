import { DataTypes, Model } from "sequelize";
import CnxSQLite from "./DBSQLite.js";

class Usuario extends Model {}

class UsuariosModel {
  static model = null;

  static init = () => {
    if (!CnxSQLite.connectionOK || !CnxSQLite.sequelize) {
      throw new Error("La conexión a SQLite no está inicializada");
    }

    if (!UsuariosModel.model) {
      UsuariosModel.model = Usuario.init(
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
          apellido: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
              isEmail: true,
            },
          },
          password: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          rol: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        },
        {
          sequelize: CnxSQLite.sequelize,
          modelName: "Usuario",
          tableName: "usuarios",
          timestamps: true,
        }
      );
    }

    return UsuariosModel.model;
  };

  static sync = async () => {
    const model = UsuariosModel.init();
    await model.sync();
    return model;
  };
}

export default UsuariosModel;
