const mongoose = require('mongoose')
const Schema = mongoose.Schema

const allianceSchema = new Schema(
  {
    userID: String,
    webname: String,
    status: String,
    usernameAG: String,
    countUser: Number,
    reserveUser: String,
    incomeDividID: String,
    statusFlag: String,
    createdBy: String,
    updatedBy: String
  },
  { timestamps: true, versionKey: false }
)

const AllianceModel = mongoose.model('Alliance', allianceSchema)

module.exports = AllianceModel
