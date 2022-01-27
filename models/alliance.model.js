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
    jobServe: String,
    statusFlag: { type: String, default: 'A' },
    action: String,
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId,
    setZeroBy: mongoose.Types.ObjectId,
    upAgentBy: mongoose.Types.ObjectId
  }, { timestamps: true, versionKey: false }
)

const AllianceModel = mongoose.model('Alliance', allianceSchema)

module.exports = AllianceModel
