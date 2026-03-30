import jwt from 'jsonwebtoken'
import config from '../config.js'

export const crearToken = usuario => {
    return jwt.sign(
        { ...usuario },
        config.TOKEN_SECRET,
        { expiresIn: `${config.TOKEN_EXPIRA_EN_MIN}m` }
    )
}

export const validarToken = token => {
    if (!token) {
        const error = new Error('Token faltante')
        error.status = 401
        throw error
    }

    try {
        return jwt.verify(token, config.TOKEN_SECRET)
    }
    catch (err) {
        const error = new Error(err.message || 'Token inválido')
        error.status = 401
        throw error
    }
}
