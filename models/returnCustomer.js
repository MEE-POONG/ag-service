const mongoose = require('mongoose')
const Schema = mongoose.Schema

const returncustomerSchema = new Schema(
  {
    usernameAG: String,
    winLose: String,
    returnCredit: String,
    statusFlag: { type: String, default: 'A' },
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId
  }, { timestamps: true, versionKey: false }
)

const ReturnCustomerModel = mongoose.model('ReturnCustomer', returncustomerSchema)

module.exports = ReturnCustomerModel
