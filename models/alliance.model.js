const mongoose = require('mongoose')
const Schema = mongoose.Schema

const allianceSchema = new Schema(
  {
    usernameAG: String,
    userID: String,
    adviser: String,
    status: String,
    reserveUser: String,
    setZero: String,
    upSystem: Boolean,
    statusServe: String,
    action: String,
    statusFlag: { type: String, default: 'A' },
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId
  }, { timestamps: true, versionKey: false }
)

const AllianceModel = mongoose.model('Alliance', allianceSchema)

module.exports = AllianceModel
