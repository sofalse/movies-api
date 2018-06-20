/* eslint-disable */
const chai = require('chai')
const expect = chai.expect
const server = require('../dist/index')
const agent = require('supertest')(server)

describe('GET /movies', () => {
    it('works with no parameters', done => {
        agent
            .get('/movies')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
    it('works with limit 5', done => {
        agent
            .get('/movies?limit=5')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                const length = res.body.data.length
                expect(length).to.be.at.most(5)
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with negative limit', done => {
        agent
            .get('/movies?limit=-1')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                expect(res.body.data.length).to.equal(1)
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with only title field', done => {
        agent
            .get('/movies?fields=Title')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                expect(res.body.data[0]).to.have.keys('_id', 'Title')
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with unknown fields', done => {
        agent
            .get('/movies?fields=Plsgsot, Year')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                expect(res.body.data[0]).to.have.keys('_id', 'Year')
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with sorting', done => {
        agent
            .get('/movies?sort=Year')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                expect(parseInt(res.body.data[0].Year))
                .to.be.at.most(parseInt(res.body.data[1].Year))
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('does its job with bizarre data', done => {
        agent
            .get('/movies?hakunamatata=dontworry')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
})

describe('POST /movies', () => {
    it('throws error on no paramaters', done => {
        agent
            .post('/movies')
            .expect(400, done)
    })
    it('adds movie to the database', done => {
        agent
            .post('/movies')
            .send('title=Jaws')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
                const body = res.body
                expect(res.status).to.be.oneOf([200, 201])
                expect(body.data.Title).to.equal('Jaws')
                expect(body.data.Year).to.equal('1975')
                expect(body.data.Rated).to.equal('PG')
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('throws an error when movie not found', done => {
        agent
            .post('/movies')
            .send('title=asjdofjhuishadfadfiodsi')
            .expect(404, done)
    })
    it('works fine with strange data', done => {
        agent
            .post('/movies')
            .send('title=Jaws')
            .send('ihearthedrums=echoingtonight')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                const body = res.body
                expect(body.data.Title).to.equal('Jaws')
                expect(body.data.Year).to.equal('1975')
                expect(body.data.Rated).to.equal('PG')
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
})

describe('GET /comments', () => {
    it('works with no parameters', done => {
        agent
            .get('/comments')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
    it('works with limit 2', done => {
        agent
            .get('/comments?limit=2')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                const length = res.body.data.length
                expect(length).to.be.at.most(2)
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with negative limit', done => {
        agent
            .get('/comments?limit=-2')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                const length = res.body.data.length
                expect(length).to.be.at.most(2)
                done()
            })
    })
    it('works with only content field', done => {
        agent
            .get('/comments?fields=content')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                expect(res.body.data[0]).to.have.keys('_id', 'content')
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with unknown fields', done => {
        agent
            .get('/comments?fields=Pizza,content')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                expect(res.body.data[0]).to.have.keys('_id', 'content')
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works fine with strange data', done => {
        agent
            .get('/comments?whoareyou=thewinner')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
})

describe('POST /comments', () => {
    it('throws an error while no arguments', done => {
        agent
            .post('/comments')
            .expect(400, done)
    })
    it('throws an error while no movie ID', done => {
        agent
            .post('/comments')
            .send('content=Bizzaire!')
            .expect(400, done)
    })
    it('throws an error while no content', done => {
        agent
            .post('/comments')
            .send('movie=2')
            .expect(400, done)
    })
    it('throws 422 when no movie found', done => {
        agent
            .post('/comments')
            .send('content=Obnoxious!')
            .send('movie=5b112b63fb6fc074433c775e')
            .expect(422, done)
    })
    it('works fine when it should to', done => {
        agent
            .post('/comments')
            .send('movie=5b112b63fb6fc07c033c775e')
            .send('content=Bizzare!')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(201)
            .then(res => {
                expect(res.body.data)
                .to.have.keys('_id', 'movieID', 'content', '__v', 'createdAt', 'updatedAt')
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works fine with strange data', done => {
        agent
            .post('/comments')
            .send('movie=5b112b63fb6fc07c033c775e')
            .send('content=Bizzare!')
            .send('shouldyouhireme=yesplz')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(201)
            .then(res => {
                expect(res.body.data)
                .to.have.keys('_id', 'movieID', 'content', '__v', 'createdAt', 'updatedAt')
                done()
            })
            .catch(err => {
                console.error(err)
            })
    })
})
