import { model, Schema } from 'mongoose'

const Movie = new Schema({
    Actors: String,
    Awards: String,
    BoxOffice: String,
    Country: String,
    DVD: String,
    Director: String,
    Genre: String,
    Language: String,
    Metascore: Number,
    Plot: String,
    Poster: String,
    Production: String,
    Rated: String,
    Ratings: Array,
    Released: String,
    Runtime: String,
    Title: String,
    Type: String,
    Website: String,
    Writer: String,
    Year: String,
    imdbID: String,
    imdbRating: Number,
    imdbVotes: String,

})

export default model('Movie', Movie)
