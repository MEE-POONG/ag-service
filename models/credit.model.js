const mongoose = require('mongoose')
const Schema = mongoose.Schema

const creditSchema = new Schema(
  {
    usernameAG: String,
    adviser: String,
    credit: Number,
    status: String,
    creditBy: String,
    statusServe: String,
    statusAG: String,
    statusFlag: { type: String, default: 'A' },
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId
  }, { timestamps: true, versionKey: false }
)

const CreditModel = mongoose.model('Credit', creditSchema)

module.exports = CreditModel
