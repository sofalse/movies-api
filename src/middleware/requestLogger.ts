import { NextFunction, Request, Response } from 'express'
import logger from '../utils/logger'

const logRequests = (req: Request, res: Response, next: NextFunction ) => {
    logger.verbose(`${req.method} ${req.url}`)
    next()
}

export default logRequests
