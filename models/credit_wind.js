const mongoose = require('mongoose')
const Schema = mongoose.Schema

const creditWindSchema = new Schema(
  {
    userWind: String,
    usernameAG: String,
    winAndLoseCustomer: String,
    winAndLoseCompany: String,
    statusFlag: { type: String, default: 'A' },
    action: String,
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId,
    setZeroBy: mongoose.Types.ObjectId,
    upAgentBy: mongoose.Types.ObjectId
  }, { timestamps: true, versionKey: false }
)

const creditWindModel = mongoose.model('creditWind', creditWindSchema)

module.exports = creditWindModel
