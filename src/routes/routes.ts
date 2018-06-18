import { Router } from 'express'
import { getComments, postComment } from '../controllers/CommentsController'
import { getMovies, postMovie } from '../controllers/MoviesController'
import requestLogger from '../middleware/requestLogger'

const router = Router()

router.use(requestLogger)
router.get('/movies', getMovies)
router.post('/movies', postMovie)
router.get('/comments', getComments)
router.post('/comments', postComment)

export default router
