import axios from 'axios'
import { Request, Response } from 'express'
import Movie from '../models/Movie'
import logger from '../utils/logger'

export const getMovies = (req: Request, res: Response) => {
    let limit: number
    let sort: string
    let fields: string
    const ALLOWED_MOVIES_FILTERS: RegExp = /^(Id|Title|Year|Rated|Released|Runtime|Genre|Director|Writer|Actors|Plot|Language|Country|Awards|Poster|Ratings|Metascore|imdbRating|imdbVotes|imdbID|Type|DVD|BoxOffice|Production|Website)$/
    req.query.limit ? (limit = parseInt(req.query.limit, 10)) : limit = 0
    req.query.sort
    ? req.query.sort.split(',').every((word: string) => ALLOWED_MOVIES_FILTERS.test(word))
        ? (sort = req.query.sort)
        : (sort = '')
    : (sort = '')
    req.query.fields
    ? req.query.fields.split(',').every((word: string) => ALLOWED_MOVIES_FILTERS.test(word))
        ? (fields = req.query.fields.split(',').join(' '))
        : (fields = '')
    : (fields = '')

    Movie.find({}).select(fields).limit(limit).sort(sort).exec().then(data => {
        res.json({ data })
    }).catch(err => {
        logger.error(err)
        throw err
     })
}

export const postMovie = (req: Request, res: Response) => {
    const OMDB_API_KEY = process.env.OMDB_API_KEY || ''
    const OMDB_LINK = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=`

    req.assert('title', 'Title is required').notEmpty()
    const errors: Record<string, any> = req.validationErrors()
    if (errors) {
        return res.status(400).json({
            errors,
        })
    }

    const title: string = req.body.title.trim()
    
    axios.get(OMDB_LINK + title)
         .then(omdbRes => {
            if (omdbRes.data.Response === 'False') {
                return res.status(404)
                          .type('application/vnd.api+json')
                          .send(JSON.stringify({ errors: 'Movie not found' }))
            }
            delete omdbRes.data.Response
            Movie.find({imdbID: omdbRes.data.imdbID}).count().exec().then((count: number) => {
                if (count > 0) {
                    return res.json({ data: omdbRes.data })
                } else {
                    Movie.create(omdbRes.data).then(() => {
                        logger.info(`Added movie ${omdbRes.data.Title} to the database.`)
                        return res.status(201).json({ data: omdbRes.data })
                    })
                }
            }).catch(err => {
                logger.error(err)
                throw err
            })
         })
}
