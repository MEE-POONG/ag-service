const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FailedLoginSchema = new Schema(
  {
    usernameAG: String,
    detail: String,
    web: String,
    master: String,
  },
  { timestamps: true, versionKey: false }
)

const FailedLoginModel = mongoose.model('FailedLogin', FailedLoginSchema)

module.exports = FailedLoginModel
