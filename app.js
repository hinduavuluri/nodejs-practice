const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDbApi1 = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

//API 1
app.get('/movies/', async (request, response) => {
  const getMovieNames = `
  SELECT movie_name FROM movie;`
  const movies = await db.all(getMovieNames)
  response.send(movies.map(eachMovie => convertDbApi1(eachMovie)))
})

// API 2
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const createNewMovie = `
  INSERT INTO movie (director_id, movie_name, lead_actor) VALUES (${directorId}, '${movieName}', '${leadActor}');`
  const newMovie = await db.run(createNewMovie)
  response.send('Movie Successfully Added')
})

//API 3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieName = `SELECT * FROM movie WHERE movie_id = ${movieId};`
  const movie = await db.get(getMovieName)
  response.send(convertDbObjectToResponseObject(movie))
})

//API 4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
  UPDATE  movie SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = ${movieId};`
  const updateMovie = await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//API 5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE * FROM movie WHERE movie_id=${movieId};`
  const deleteMovie = await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//API 6
const convertToApi6 = objectItem => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  }
}
app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director;`
  const getDirector = await db.all(getDirectorQuery)
  response.send(getDirector.map(eachDirector => convertToApi6(eachDirector)))
})

//API 7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getmoviesByDirector = `SELECT movie_name as movieName from movie WHERE director_id = ${director_id};`
  const getDirectorMovies = await db.run(getmoviesByDirector)
  response.send(getDirectorMovies)
})

module.exports = app
