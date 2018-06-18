import app from './index'
import logger from './utils/logger'

const SERVER_PORT = process.env.PORT || 8080

const server = app.listen(SERVER_PORT, () => {
    logger.info(`Listening on port ${SERVER_PORT}`)
})

export default server

module.exports = server
