var express = require('express')
const allianceRoute = require('./alliance.router')
const agRoute = require('./ag.router')
// const allianceRoute = require('./condition.router')
// const allianceRoute = require('./customer.router')
// const promotionRoute = require('./promotion.router')
// const transactionMoneyRoute = require('./transaction.router')
const userRoute = require('./user.router')
// const allianceRoute = require('./web.router')
// const allianceRoute = require('./weekly.router')

const loginRoute = require('../controllers/user.controller')

var apiResponse = require('../helpers/apiResponse')
var app = express()

app.use('/alliance/', allianceRoute)
app.use('/ag/', agRoute)
app.use('/user/', userRoute)


app.use('/login/', loginRoute.userLogin)

var publicDir = require('path').join(__dirname, '../assets')
app.use(express.static(publicDir))

app.use('/images/*', (req, res) => {
  res.sendFile(__dirname + '/default.png')
})

app.get('/', function (req, res) {
  return apiResponse.successResponse(res, 'Welcome To Service AG - MICROSERVICE V1.0.0')
})
// throw 404 if URL not found
app.all('*', function (req, res) {
  return apiResponse.notFoundResponse(res, 'Page not found')
})
module.exports = app
