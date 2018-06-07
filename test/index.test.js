/* eslint-disable */
let chai = require('chai')
let expect = chai.expect
let request = require('supertest')
let server = require('../index')

describe('GET /movies', () => {
    it('works with no parameters', done => {
        request(server)
            .get('/movies')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
    it('works with limit 5', () => {
        request(server)
            .get('/movies?limit=5')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                const length = res.body.length
                expect(length).to.be.at.most(5)
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with limit 0', () => {
        request(server)
            .get('/movies?limit=0')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect('Content-Length', '2')
            .expect(200)
            .then(res => {
                expect(res.body.length).to.be.equal(0)
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with negative limit', done => {
        request(server)
            .get('/movies?limit=-5')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
    it('works with only title field', () => {
        request(server)
            .get('/movies?fields=Title')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                expect(res.body[0]).to.have.keys('Title')
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with only plot field', () => {
        request(server)
            .get('/movies?fields=Plot')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                expect(res.body[0]).to.have.keys('Plot')
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with unknown fields', done => {
        request(server)
            .get('/movies?fields=Plsgsot')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
    it('works with sorting', () => {
        request(server)
            .get('/movies?sort=Year')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                expect(parseInt(res.body[0].Year)).to.be.at.most(parseInt(res.body[1].Year))
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('does its job with bizarre data', done => {
        request(server)
            .get('/movies?hakunamatata=dontworry')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
})

describe('POST /movies', () => {
    it('throws error on no paramaters', () => {
        request(server)
            .post('/movies')
            .expect(400)
    })
    it('adds movie to the database', () => {
        request(server)
            .post('/movies')
            .send('title=Jaws')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .then(res => {
                const body = res.body
                expect(res.status).to.be.oneOf([200, 201])
                expect(body.Title).to.equal('Jaws')
                expect(body.Year).to.equal('1975')
                expect(body.Rated).to.equal('PG')
                expect(body.Response).to.equal('True')
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('throws error when movie not found', () => {
        request(server)
            .post('/movies')
            .send('title=asjdofjhuishadfadfiodsi')
            .expect(404)
    })
    it('works fine with strange data', () => {
        request(server)
            .post('/movies')
            .send('title=Jaws')
            .send('ihearthedrums=echoingtonight')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                const body = res.body
                expect(body.Title).to.equal('Jaws')
                expect(body.Year).to.equal('1975')
                expect(body.Rated).to.equal('PG')
                expect(body.Response).to.equal('True')
            })
            .catch(err => {
                console.error(err)
            })
    })
})

describe('GET /comments', () => {
    it('works with no parameters', done => {
        request(server)
            .get('/comments')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
    it('works with limit 5', () => {
        request(server)
            .get('/comments?limit=5')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                const length = res.body.length
                expect(length).to.be.at.most(5)
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with limit 0', () => {
        request(server)
            .get('/comments?limit=0')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect('Content-Length', '2')
            .expect(200)
            .then(res => {
                expect(res.body.length).to.be.equal(0)
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with negative limit', done => {
        request(server)
            .get('/comments?limit=-10')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
    it('works with only content field', () => {
        request(server)
            .get('/comments?fields=content')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
                expect(res.body[0]).to.have.keys('content')
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works with unknown fields', done => {
        request(server)
            .get('/movies?fields=Pizza')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
    it('works fine with strange data', done => {
        request(server)
            .get('/comments?whoareyou=thewinner')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
    })
})

describe('POST /comments', () => {
    it('throws an error while no arguments', () => {
        request(server)
            .post('/comments')
            .expect(400)
    })
    it('throws an error while no movie ID', () => {
        request(server)
            .post('/comments')
            .send('content=Bizzaire!')
            .expect(400)
    })
    it('throws an error while no content', () => {
        request(server)
            .post('/comments')
            .send('movie=2')
            .expect(400)
    })
    it('throws 404 when no movie found', () => {
        request(server)
            .post('/comments')
            .send('movie=777')
            .expect(404)
    })
    it('works fine when it should to', () => {
        request(server)
            .post('/comments')
            .send('movie=2')
            .send('content=Bizzare!')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(201)
            .then(res => {
                expect(res.body).to.have.keys('movieID', 'content')
            })
            .catch(err => {
                console.error(err)
            })
    })
    it('works fine with strange data', () => {
        request(server)
            .post('/comments')
            .send('movie=2')
            .send('content=Bizzare!')
            .send('shouldyouhireme=yesplz')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(201)
            .then(res => {
                expect(res.body).to.have.keys('movieID', 'content')
            })
            .catch(err => {
                console.error(err)
            })
    })
})
