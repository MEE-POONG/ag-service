const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    adviser: String,
    bankName: String,
    bankAccount: String,
    tel: String,
    line: String,
    image: String,
    statusFlag: String,
    createdBy: String,
    updatedBy: String
  },
  { timestamps: true, versionKey: false }
)

const UserModel = mongoose.model('User', userSchema)

module.exports = UserModel
