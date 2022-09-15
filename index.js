const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const app = express()
const PORT = process.env.PORT || 8000
const ExpressError = require('./utils/ExpressError')
const { join } = require('path')
const ejs = require('ejs')
const Cors = require('cors')
const authRouter = require('./routes/AuthRouter')
const { existsSync, mkdirSync } = require('node:fs')
mongoose
  .connect('mongodb://localhost/storm', {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(function (data) {
    console.log('DATABASE CONNECTED SUCCESSFULLY')
  })
  .catch(function (e) {
    console.log('ERROR WHILE CONNECTING DATABASE')
    console.log(e)
  })

const sessionConfig = {
  secret: 'thisisthesecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig))

export const publicPath = join(__dirname, '/public')
export const photoFilesPath = join(__dirname, '/public/photofiles')
export const coachFilesPath = join(__dirname, '/public/coachfiles')
export const instructorFilesPath = join(__dirname, '/public/instructorfiles')
existsSync(publicPath) || mkdirSync(publicPath)
existsSync(photoFilesPath) || mkdirSync(photoFilesPath)
existsSync(coachFilesPath) || mkdirSync(coachFilesPath)
existsSync(instructorFilesPath) || mkdirSync(instructorFilesPath)

console.log({
  publicPath,
  photoFilesPath,
  coachFilesPath,
  instructorFilesPath
})

app.use(express.static(publicPath))
app.use(express.static(photoFilesPath))
app.use(express.static(coachFilesPath))
app.use(express.static(instructorFilesPath))

// app.use(express.static(path.join(__dirname, '/instructorfiles')))
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'ejs')
// app.set('view engine', 'ejs');
// app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(Cors())

const CoachRouter = require('./routes/CoachRouter')
const InstractorRouter = require('./routes/InstractorRouter')

app.use('/', CoachRouter)
app.use('/', InstractorRouter)
app.use('/', authRouter)

app.all('*', function (req, res, next) {
  next(new ExpressError('Page Not Found', 404))
})

app.use(function (err, req, res, next) {
  const { statusCode = 500 } = err
  if (!err.message) {
    err.message = 'Someting Went Wrong'
  }
  res.json({ err: err.message, status: statusCode })
})

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT)
})
