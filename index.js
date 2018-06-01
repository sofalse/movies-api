'use strict'

const express = require('express')
const app = express()
const helmet = require('helmet')
const axios = require('axios')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('./database.sqlite')
const urlEncodedParser = bodyParser.urlencoded({ extended: false })

const SERVER_PORT = 80
const OMDB_API_KEY = 'KEYHERE'
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
            if (omdbRes.data.Response === 'False') {
                return res.status(404).send('Movie not found')
            }
            db.get('SELECT Count(*) AS count FROM movies WHERE imdbID = ?', [omdbRes.data.imdbID], (err, row) => {
                if (err) throw err
                if (row.count === 0) {
                    db.run(
                        'INSERT INTO movies (Title, Year, Rated, Released, Runtime, Genre, Director, Writer, Actors, Plot, Language, Country, Awards, Metascore, imdbRating, imdbVotes, imdbID, Type, DVD, BoxOffice, Production, Website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
                            if (err) throw err
                            console.log(`Movie ${trimmedTitle} added to database.`)
                        }
                    )
                }
            })
            res.send(omdbRes.data)
        })
        .catch(error => {
            console.error(error)
        })
})

app.get('/movies', (req, res) => {
    let limit, sort, fields
    req.query.limit ? (limit = `LIMIT ${req.query.limit}`) : (limit = '')
    req.query.sort ? (sort = `ORDER BY ${req.query.sort} ASC`) : (sort = '')
    req.query.fields ? (fields = req.query.fields) : (fields = '')
    db.all(`SELECT ${fields ? fields : '*'} FROM movies ${sort} ${limit}`, (err, rows) => {
        if (err) throw err
        res.send(rows)
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
            res.type('json').send(
                JSON.stringify({
                    movieID: movieID,
                    content: trimmedContent,
                })
            )
        })
    })
})

app.get('/comments', (req, res) => {
    let limit, fields, movie
    req.query.limit ? (limit = `LIMIT ${req.query.limit}`) : (limit = '')
    req.query.fields ? (fields = req.query.fields) : (fields = '')
    req.query.movie ? (movie = `WHERE movieID = ${req.query.movie}`) : (movie = '')
    db.all(`SELECT ${fields ? fields : '*'} FROM comments ${movie} ${limit}`, (err, rows) => {
        if (err) throw err
        res.send(rows)
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
