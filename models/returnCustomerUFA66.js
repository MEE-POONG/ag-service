const mongoose = require('mongoose')
const Schema = mongoose.Schema

const returnCustomerUFA66Schema = new Schema(
  {
    usernameAG: String,
    winLose: String,
    returnCredit: String,
    statusFlag: { type: String, default: 'A' },
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId
  }, { timestamps: true, versionKey: false }
)

const ReturnCustomerUFA66Model = mongoose.model('ReturnCustomerUFA66', returnCustomerUFA66Schema)

module.exports = ReturnCustomerUFA66Model
