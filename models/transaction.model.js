const mongoose = require('mongoose')
const Schema = mongoose.Schema

const allianceSchema = new Schema(
  {
    userID: String,
    adminID: String,
    type: String,
    promotionID: String,
    amount: String,
    statusFlag: String,
    createdBy: String,
    updatedBy: String
  },
  { timestamps: true, versionKey: false }
)

const AllianceModel = mongoose.model('Alliance', allianceSchema)

module.exports = AllianceModel
