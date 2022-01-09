const mongoose = require('mongoose')
const Schema = mongoose.Schema

const teamSchema = new Schema({
    name: String,
    statusFlag: String,
    statusServe: String,
    createdBy: String,
    updatedBy: String
}, { timestamps: true, versionKey: false })

const TeamModel = mongoose.model('Team', teamSchema)

module.exports = TeamModel