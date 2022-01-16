const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    nickname: String,
    tel: String,
    line: String,
    team: String,
    position: String,
    bankName: String,
    bankNumber: String,
    statusFlag: String,
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId
}, { timestamps: true, versionKey: false })

const UserModel = mongoose.model('User', userSchema)

module.exports = UserModel