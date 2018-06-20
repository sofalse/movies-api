import { createLogger, format, Logger, transports } from 'winston'

const logger: Logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.splat(),
        format.json(),
        format.splat(),
    ),
    level: process.env.LOGGING_LEVEL || 'info',
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log'}),
    ],
})
if (process.env.ENV === 'DEV') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple(),
        ),
    }))
}

export default logger
