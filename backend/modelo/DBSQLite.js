import { Sequelize } from 'sequelize'
import { mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'

import config from '../config.js'

class CnxSQLite {
    static connectionOK = false
    static sequelize = null

    static conectar = async () => {
        const dbPath = config.DB_PATH
        const dbDir = dirname(dbPath)

        if (!existsSync(dbDir)) {
            mkdirSync(dbDir, { recursive: true })
        }

        CnxSQLite.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: dbPath,
            logging: false,
            dialectOptions: {
                // aumenta tolerancia a locks de SQLite
                busyTimeout: 3000,
            },
            pool: {
                max: 5,
                min: 0,
                idle: 10000,
            }
        })

        await CnxSQLite.sequelize.authenticate()
        // Minimiza locking entre lectores/escritores
        await CnxSQLite.sequelize.query('PRAGMA journal_mode = WAL;')
        await CnxSQLite.sequelize.query('PRAGMA busy_timeout = 3000;')
        CnxSQLite.connectionOK = true
    }

    static cerrar = async () => {
        if (CnxSQLite.sequelize) {
            await CnxSQLite.sequelize.close()
            CnxSQLite.connectionOK = false
        }
    }
}

export default CnxSQLite
