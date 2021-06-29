const express = require('express')
const app = express()
const mongoose = require('mongoose')
const apiResponse = require('./helpers/apiResponse')
var cors = require('cors')
var path = require('path')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT || 6002

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })

mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})

app.use(cors())
app.use(express.json())

var publicDir = require('path').join(__dirname, './assets')
app.use(express.static(publicDir))

const apiRouter = require('./routers/api.router')

app.use('/api/', apiRouter)

app.get('/', function(req, res) {
  return apiResponse.successResponse(res, 'Welcome To Service TESTA-666 V1.0.0')
})

// throw 404 if URL not found
// app.all('*', function(req, res) {
//   return apiResponse.notFoundResponse(res, 'Page not found')
// })

app.listen(PORT, () => {
  console.log(`Application is running on port ${PORT}`)
})
