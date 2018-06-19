import bodyParser from 'body-parser'
import compression from 'compression'
import dotenv from 'dotenv'
import express from 'express'
import expressValidator from 'express-validator'
import helmet from 'helmet'
import router from './routes/routes'
import Database from './utils/database'

dotenv.config()
const app = express()

const database = new Database()
database.connect()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())
app.use(expressValidator())
app.use(compression())

app.use('/', router)

export default app

module.exports = app
