require('dotenv').config()
const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})
const User = require('../models/user.model')
const { hashedPassword } = require('./utils/encrypt')

async function Create() {
  const user = new User({
    username: "admin",
    password: hashedPassword("admin"),
    firstname: "admin",
    lastname: "admin",
    nickname: "CHUN",
    tel: "0918136426",
    line: "admin",
    team: "admin",
    position: "ADMIN",
    bankName: "-",
    bankAccount: "-",
    statusFlag: "A",
    createdBy: "61cd65365602453e1e211aeb",
    updatedBy: "61cd65365602453e1e211aeb"
  })
  // SAVE USER
  console.log(user)
  await user.save()
  console.log('SUCCESS\n')
}

Create()
