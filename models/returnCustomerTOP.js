const mongoose = require('mongoose')
const Schema = mongoose.Schema

const returnCustomerTOPSchema = new Schema(
  {
    usernameAG: String,
    winLose: String,
    returnCredit: String,
    statusFlag: { type: String, default: 'A' },
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId
  }, { timestamps: true, versionKey: false }
)

const ReturnCustomerTOPModel = mongoose.model('ReturnCustomerTOP', returnCustomerTOPSchema)

module.exports = ReturnCustomerTOPModel
