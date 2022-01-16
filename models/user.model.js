const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
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

const UserModel = mongoose.model('User', userSchema)

module.exports = UserModel