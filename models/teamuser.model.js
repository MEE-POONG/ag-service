const mongoose = require('mongoose')
const Schema = mongoose.Schema

const teamUserSchema = new Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    tel: String,
    line: String,
    team: String,
    status: String,
    bankName: String,
    bankAccount: String,
    statusFlag: String,
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId
}, { timestamps: true, versionKey: false })

const TeamUserModel = mongoose.model('TeamUser', teamUserSchema)

module.exports = TeamUserModel