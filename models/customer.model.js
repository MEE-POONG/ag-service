const mongoose = require('mongoose')
const Schema = mongoose.Schema

const customerSchema = new Schema(
  {
    webname: String,
    usernameAG: String,
    customerID: String,
    customerTAG: String,
    countCustomer: Number,
    statusServe: String,
    statusAG: String,
    statusFlag: String,
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId
  },
  { timestamps: true, versionKey: false }
)

const CustomerModel = mongoose.model('Customer', customerSchema)

module.exports = CustomerModel
