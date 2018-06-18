import bodyParser from 'body-parser'
import compression from 'compression'
import dotenv from 'dotenv'
import express from 'express'
import expressValidator from 'express-validator'
import helmet from 'helmet'
import mongoose from 'mongoose'
import router from './routes/routes'
import logger from './utils/logger'

dotenv.config()
const app = express()

mongoose.connect(process.env.DB_URI || '').then(() => {
    logger.info('Connected to mongoDB.')
}).catch(err => { logger.error('Error while connecting to mongoDB.') })

app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())
app.use(expressValidator())
app.use(compression())

app.use('/', router)

export default app

module.exports = app
