'use strict'

const express = require('express')
const app = express()
const helmet = require('helmet')
const axios = require('axios')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./database.sqlite')
const urlEncodedParser = bodyParser.urlencoded({ extended: false })

const SERVER_PORT = 8080
const OMDB_API_KEY = '8640b907'
const OMDB_LINK = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=`

app.use(helmet())

app.post('/movies', urlEncodedParser, (req, res) => {
    const title = req.body.title
    if (typeof title === 'undefined' || title.trim() === null || title.trim() === '') {
        return res.status(400).send('Title is required.')
    }

    const trimmedTitle = title.trim()

    axios
        .get(OMDB_LINK + trimmedTitle)
        .then(omdbRes => {
            let status = 200
            if (omdbRes.data.Response === 'False') {
                return res.status(404).send('Movie not found')
            }
            return new Promise((resolve, reject) => {
                db.get('SELECT Count(*) AS count FROM movies WHERE imdbID = ?', [omdbRes.data.imdbID], (err, row) => {
                    if (err) throw err
                    if (row.count === 0) {
                        db.run(
                            'INSERT INTO movies (Title, Year, Rated, Released, Runtime, Genre, Director, Writer, Actors, Plot, Language, Country, Awards, Poster, Ratings, Metascore, imdbRating, imdbVotes, imdbID, Type, DVD, BoxOffice, Production, Website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [
                                omdbRes.data.Title.toString(),
                                omdbRes.data.Year.toString(),
                                omdbRes.data.Rated.toString(),
                                omdbRes.data.Released.toString(),
                                omdbRes.data.Runtime.toString(),
                                omdbRes.data.Genre.toString(),
                                omdbRes.data.Director.toString(),
                                omdbRes.data.Writer.toString(),
                                omdbRes.data.Actors.toString(),
                                omdbRes.data.Plot.toString(),
                                omdbRes.data.Language.toString(),
                                omdbRes.data.Country.toString(),
                                omdbRes.data.Awards.toString(),
                                omdbRes.data.Poster.toString(),
                                JSON.stringify(omdbRes.data.Ratings),
                                omdbRes.data.Metascore.toString(),
                                omdbRes.data.imdbRating.toString(),
                                omdbRes.data.imdbVotes.toString(),
                                omdbRes.data.imdbID.toString(),
                                omdbRes.data.Type.toString(),
                                omdbRes.data.DVD.toString(),
                                omdbRes.data.BoxOffice.toString(),
                                omdbRes.data.Production.toString(),
                                omdbRes.data.Website.toString(),
                            ],
                            err => {
                                if (err) reject(err)
                                status = 201
                                console.log(`Movie ${trimmedTitle} added to database.`)
                                resolve({ status, content: omdbRes.data })
                            }
                        )
                    } else {
                        resolve({ status, content: omdbRes.data })
                    }
                })
            })
        })
        .then(data => {
            res.status(data.status).json(data.content)
        })
        .catch(error => {
            console.error(error)
        })
})

app.get('/movies', (req, res) => {
    let limit, sort, fields
    const ALLOWED_MOVIES_FILTERS = /^(Id|Title|Year|Rated|Released|Runtime|Genre|Director|Writer|Actors|Plot|Language|Country|Awards|Poster|Ratings|Metascore|imdbRating|imdbVotes|imdbID|Type|DVD|BoxOffice|Production|Website)$/
    req.query.limit ? (limit = `LIMIT ${req.query.limit}`) : (limit = '')
    req.query.sort
        ? req.query.sort.split(',').every(word => ALLOWED_MOVIES_FILTERS.test(word))
            ? (sort = `ORDER BY ${req.query.sort} ASC`)
            : (sort = '')
        : (sort = '')
    req.query.fields
        ? req.query.fields.split(',').every(word => ALLOWED_MOVIES_FILTERS.test(word))
            ? (fields = req.query.fields)
            : (fields = '')
        : (fields = '')
    db.all(`SELECT ${fields ? fields : '*'} FROM movies ${sort} ${limit}`, (err, rows) => {
        if (err) throw err
        for (let row of rows) {
            row.Ratings ? (row.Ratings = JSON.parse(row.Ratings)) : null
        }
        res.json(rows)
    })
})

app.post('/comments', urlEncodedParser, (req, res) => {
    if (
        req.body.content === null ||
        req.body.movie === null ||
        typeof req.body.content === 'undefined' ||
        typeof req.body.movie === 'undefined'
    ) {
        return res.status(400).send('Either content and movie ID are required.')
    }
    const trimmedContent = req.body.content.trim()
    const movieID = req.body.movie.trim()
    db.get('SELECT Count(*) AS count FROM movies WHERE id = ?', [movieID], (err, row) => {
        if (row.count === 0) {
            return res.status(404).send('Movie not found in database.')
        }
        db.run('INSERT INTO comments (content, movieID) VALUES (?, ?)', [trimmedContent, movieID], err => {
            if (err) throw err
            res
                .type('json')
                .status(201)
                .json({
                    movieID,
                    content: trimmedContent,
                })
        })
    })
})

app.get('/comments', (req, res) => {
    let limit, fields, movie
    const ALLOWED_COMMENT_FILTERS = /^(id|content|movieID)$/
    req.query.limit ? (limit = `LIMIT ${req.query.limit}`) : (limit = '')
    req.query.fields
        ? req.query.fields.split(',').every(word => ALLOWED_COMMENT_FILTERS.test(word))
            ? (fields = req.query.fields)
            : (fields = '')
        : (fields = '')
    req.query.movie ? (movie = `WHERE movieID = ${req.query.movie}`) : (movie = '')
    db.all(`SELECT ${fields ? fields : '*'} FROM comments ${movie} ${limit}`, (err, rows) => {
        if (err) throw err
        res.json(rows)
    })
})

app.listen(SERVER_PORT, () => {
    console.log(`Listening on port ${SERVER_PORT}`)
})

process.on('SIGINT', () => {
    db.close()
    process.exit(0)
})

module.exports = app
