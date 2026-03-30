import Joi from 'joi'

export const registroSchema = Joi.object({
    nombre: Joi.string().min(2).required(),
    apellido: Joi.string().min(2).optional(),   // 🆕
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    rol: Joi.string().valid('entrenador', 'alumno', 'admin').required()
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required()
})
