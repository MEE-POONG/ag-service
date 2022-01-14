const mongoose = require('mongoose')
const Schema = mongoose.Schema

const customerSchema = new Schema(
  {
    usernameAG: String,
    customerID: String,
    customerTAG: String,
    countCustomer: Number,
    statusServe: String,
    statusAG: String,
    statusFlag: { type: String, default: 'A' },
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId
  }, { timestamps: true, versionKey: false }
)

const CustomerModel = mongoose.model('Customer', customerSchema)

module.exports = CustomerModel
