const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
app.use(express.json())

const dbpath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeServerAndDB = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is up and running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error: ${e.message}`)
    process.exit(1)
  }
}

initializeServerAndDB()

//get list of movie names
app.get('/movies/', async (request, response) => {
  const getmovienamequery = `
  SELECT movie_name as movieName FROM movie;
  `
  const queryvalue = await db.all(getmovienamequery)
  response.send(queryvalue)
})

//posting a new movie
app.post('/movies/', async (request, response) => {
  const val = request.body
  const {directorId, movieName, leadActor} = val
  //console.log(val)
  const postmoviequery = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES(
    ${directorId},'${movieName}','${leadActor}'
  );`
  await db.run(postmoviequery)
  response.send('Movie Successfully Added')
})

//get a movie with id
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getmidquery = `
  SELECT * FROM movie WHERE movie_id = ${movieId};
  `
  const dbval = await db.get(getmidquery)
  if (dbval) {
    const {movie_id, director_id, movie_name, lead_actor} = dbval
    response.send({
      movieId: movie_id,
      directorId: director_id,
      movieName: movie_name,
      leadActor: lead_actor,
    })
  } else {
    console.log('error dbval is null')
  }
})

//put a movie with id
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const val = request.body
  const {directorId, movieName, leadActor} = val
  const getmidquery = `
  update movie set 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE movie_id = ${movieId};
  `
  await db.run(getmidquery)
  response.send('Movie Details Updated')
})

//deleting a movie
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const dbquery = `delete from movie where movie_id = ${movieId}`
  await db.run(dbquery)
  response.send('Movie Removed')
})

//list of directors
app.get('/directors/', async (request, response) => {
  const getdirnamequery = `
  SELECT director_id as directorId,director_name as directorName FROM director;
  `
  const queryvalue = await db.all(getdirnamequery)
  response.send(queryvalue)
})

//list of movies directed by director
app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getdirnamequery = `
  SELECT movie_name AS movieName 
  FROM movie INNER JOIN director ON movie.director_id = director.director_id
   WHERE director.director_id=${directorId};
  `
  const val = await db.all(getdirnamequery)
  response.send(val)
})

module.exports = app
