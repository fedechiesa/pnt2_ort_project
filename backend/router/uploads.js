import express from 'express'
import multer from 'multer'
import { join } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { validarToken } from '../servicio/tokenService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const uploadsDir = join(__dirname, '..', 'public', 'uploads')

// nos aseguramos de que exista la carpeta
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
        cb(null, `${Date.now()}_${safeName}`)
    }
})

const fileFilter = (_req, file, cb) => {
    if (file.mimetype?.startsWith('image/') || file.mimetype?.startsWith('video/')) {
        cb(null, true)
    } else {
        cb(new Error('Formato no permitido. Solo imágenes o videos'))
    }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } }) // 20MB

class RouterUploads {
    #extraerToken = req => {
        const authHeader = req.headers.authorization || ''
        if (authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7)
        }
        return req.body?.token || ''
    }

    #auth = (req, res, next) => {
        try {
            const token = this.#extraerToken(req)
            const payload = validarToken(token)
            if (payload.rol !== 'entrenador' && payload.rol !== 'admin') {
                const err = new Error('No autorizado')
                err.status = 403
                throw err
            }
            req.user = payload
            next()
        }
        catch (error) {
            res.status(error.status || 401).json({ message: error.message || 'No autorizado' })
        }
    }

    config = () => {
        const router = express.Router()
        router.post('/media', this.#auth, upload.single('file'), (req, res) => {
            if (!req.file) {
                return res.status(400).json({ message: 'Archivo requerido' })
            }
            const url = `/uploads/${req.file.filename}`
            res.status(201).json({ url, filename: req.file.originalname, size: req.file.size })
        })
        return router
    }
}

export default RouterUploads
