import Server from './server.js'
import config from './config.js'
import CnxSQLite from './modelo/DBSQLite.js'
import UsuariosRepo from './modelo/usuariosRepo.js'
import AlumnosRepo from './modelo/alumnosRepo.js'

try {
    if (config.MODO_PERSISTENCIA == 'SQLITE') {
        await CnxSQLite.conectar()
        console.log('Conexión a SQLite establecida')

        // Seed alumnos a partir de usuarios con rol alumno
        const usuariosRepo = new UsuariosRepo()
        const alumnosRepo = new AlumnosRepo()
        const usuariosAlumnos = await usuariosRepo.listarPorRol('alumno')
        await alumnosRepo.seedDesdeUsuarios(usuariosAlumnos)
    }

    const server = new Server(config.PORT)
    server.start()
}
catch (error) {
    console.log(`Error en conexión de base de datos: ${error.message}`)
    if (error?.stack) {
        console.error(error.stack)
    }
}
