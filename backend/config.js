import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT || 3001
const MODO_PERSISTENCIA = process.env.MODO_PERSISTENCIA || 'SQLITE'
const DB_PATH = process.env.DB_PATH || join(__dirname, 'data', 'database.sqlite')
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'fitandtrack-secret'
const TOKEN_EXPIRA_EN_MIN = parseInt(process.env.TOKEN_EXPIRA_EN_MIN || '120')

export default {
    PORT,
    MODO_PERSISTENCIA,
    DB_PATH,
    TOKEN_SECRET,
    TOKEN_EXPIRA_EN_MIN
}
