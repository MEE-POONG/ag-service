const mongoose = require('mongoose')
const Schema = mongoose.Schema

const teamSchema = new Schema(
  {
    name: String,
    statusFlag: { type: String, default: 'A' },
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId
  }, { timestamps: true, versionKey: false }
)

const TeamModel = mongoose.model('Team', teamSchema)

module.exports = TeamModel
