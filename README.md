# Movies API
## Simple movie info API written in NodeJS using Express

*Sample data in SQLite database included, as well as Mocha + Chai + Supertest Unit Tests. Everything's been debugged, tested and protected against possible user errors.*

### Routing:

** GET ** /movies - fetches the list of movies in the database.

Available parameters:
* `limit=x` - limits the response to x records,
* `sort=Key` - sorts the data by the given key. Available keys: 
	* Title
	* Year
	* Rated
	* Released
	* Runtime
	* Genre
	* Director
	* Writer
	* Actors
	* Plot
	* Language
	* Country
	* Awards
	* Metascore
	* imdbRating
	* imdbVotes
	* imdbID
	* Type
	* DVD
	* BoxOffice
	* Production
	* Website
* `fields=Key1,Key2,...` - when given, response will contain only these keys.
Data is being returned with `application/json` content type.

------------

** GET ** /comments - fetches the list of comments being stored in application database. Can be modified with `limit` and `fields` parameters (check above), as well with `movie` parameter, which filters the comments by the movie ID. Cannot be sorted!


Data is being returned with `application/json` content type.

------------

** POST ** /movies - adds a movie to the database. Expects **one** parameter (* x-www-form-urlencoded data type *) - `title`, which specifies title of the movie. All the remaining data is being downloaded from the OMBD API. 

Returns movie object in *JSON* format.

------------

** POST ** /comments - adds a comment to the movie. Expects **two** parameters (* x-www-form-urlencoded data type *):
* `movie` - ID of the movie that's being commented,
* `content` - text content of the comment.

Returns comment object in *JSON* format.