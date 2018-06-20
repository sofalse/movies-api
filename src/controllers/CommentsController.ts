import { Request, Response } from 'express'
import Comment from '../models/Comment'
import Movie from '../models/Movie'
import logger from '../utils/logger'

export const getComments = (req: Request, res: Response) => {
    let limit: number
    let fields: string
    let movie: object
    const ALLOWED_COMMENT_FILTERS: RegExp = /^(id|content|movieID)$/
    req.query.limit ? (limit = parseInt(req.query.limit, 10)) : (limit = 0)
    req.query.fields
    ? req.query.fields.split(',').filter((word: string) => ALLOWED_COMMENT_FILTERS.test(word))
        ? (fields = req.query.fields.split(',').join(' '))
        : (fields = '')
    : (fields = '')
    req.query.movie ? (movie = { movieID: req.query.movie }) : (movie = {})
    Comment.find(movie).select(fields).limit(limit).exec().then(data => {
        res.json({ data })
    }).catch(err => {
        logger.error(err)
        throw err
    })
}

export const postComment = (req: Request, res: Response) => {
    req.assert('content', 'Comment body cannot be empty!').notEmpty()
    req.assert('movie', 'Movie ID has to be specified.').notEmpty()
    req.assert('movie', 'Invalid movie ID format').isMongoId()
    const errors: Record<string, any> = req.validationErrors()
    if (errors) {
        return res.status(400).json({
            errors,
        })
    }

    const content = req.body.content.trim()
    const movieID = req.body.movie.trim()
    Movie.findById(movieID).count().exec().then(count => {
        if (count === 0) {
            return res.status(422).json({ errors: 'Invalid movie ID' })
        } else {
            Comment.create({
                content,
                movieID,
            }).then(addedComment => {
                logger.info(`Comment ${addedComment._id} added to database.`)
                return res.status(201).json({ data: addedComment })
            }).catch(err => {
                logger.error(err)
                throw err
            })
        }
    })
}
