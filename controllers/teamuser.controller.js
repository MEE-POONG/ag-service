// const TeamUserPlay = require('../models/user-play.model')
const TeamUser = require('../models/user.model')
const { body, validationResult } = require('express-validator')
const { sanitizeBody } = require('express-validator')
var mongoose = require('mongoose')
const bcrypt = require('bcrypt')
var dayjs = require('dayjs')
const he = require('he')
var ReadableData = require('stream').Readable
var fs = require('fs')
var apiResponse = require('../helpers/apiResponse')

// TeamUser Schema
function TeamUserData(data) {
    this.id = data._id
    this.adviser = data.adviser
    this.username = data.username
    this.password = data.password
    this.firstname = data.firstname
    this.lastname = data.lastname
    this.bankName = data.bankName
    this.bankAccount = data.bankAccount
    this.tel = data.tel
    this.line = data.line
    this.image = data.image
    this.statusFlag = data.statusFlag
    this.createdBy = data.createdBy
    this.createdAt = data.createdAt
    this.updatedBy = data.updatedBy
    this.updatedAt = data.updatedAt
}

function TeamUserDataLogin(data) {
    this.id = data._id
    this.adviser = data.adviser
    this.username = data.username
    this.firstname = data.firstname
    this.lastname = data.lastname
    this.bankName = data.bankName
    this.bankAccount = data.bankAccount
    this.tel = data.tel
    this.line = data.line
    this.image = data.image
    this.statusFlag = data.statusFlag
    this.createdBy = data.createdBy
    this.createdAt = data.createdAt
    this.updatedBy = data.updatedBy
    this.updatedAt = data.updatedAt
}
// TeamUserPlay Schema
// function TeamUserPlayData(data) {
//   this.id = data._id
//   this.userID = data.userID
//   this.usernameAG = data.usernameAG
//   this.passwordAG = data.passwordAG
//   this.useCheck = data.useCheck
//   this.statusFlag = data.statusFlag
//   this.createdBy = data.createdBy
//   this.createdAt = data.createdAt
//   this.updatedBy = data.updatedBy
//   this.updatedAt = data.updatedAt
// }
exports.userList = [
    async(req, res) => {
        try {
            const users = await TeamUser.find({}).limit(50)
            const userData = users.map(e => {
                return new TeamUserData(e)
            })

            return apiResponse.successResponseWithData(
                res,
                'Operation success',
                userData
            )
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]
exports.userLogin = [
    body('username', 'username must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('password', 'password must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    sanitizeBody('*').escape(),
    async(req, res) => {
        const username = req.body.username
        const password = req.body.password
        const statusFlag = 'A'
        try {
            // VALIDATION USER
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(
                    res,
                    'Validation Error.',
                    errors.array()
                )
            }
            if (username && password) {
                const user = await TeamUser.findOne({
                    username,
                    statusFlag
                })

                if (user !== null) {
                    const checkPassword = await bcrypt.compare(password, user.password)
                    if (!checkPassword) {
                        return apiResponse.unauthorizedResponse(
                            res,
                            'Authentication failed'
                        )
                    }
                    let userData = new TeamUserDataLogin(user)
                    return apiResponse.successResponseWithData(
                        res,
                        'Operation success',
                        userData
                    )
                } else {
                    return apiResponse.unauthorizedResponse(res, 'Authentication failed')
                }
            } else {
                return apiResponse.ErrorResponse(res, 'Authentication failed')
            }
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]
exports.userDetail = [
    async(req, res) => {
        const { id } = req.params

        try {
            const user = await TeamUser.findById(id)

            if (user !== null) {
                let userData = new TeamUserData(user)
                return apiResponse.successResponseWithData(
                    res,
                    'Operation success',
                    userData
                )
            } else {
                return apiResponse.successResponseWithData(res, 'Operation success', {})
            }
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]
exports.userStore = [
    body('username', 'ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร.')
    .isLength({ min: 3, max: 200 })
    .trim(),
    body('password', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร.')
    .isLength({ min: 6, max: 200 })
    .trim(),
    body('firstname', 'ชื่อจริงต้องมีอย่างน้อย 2 ตัวอักษร.')
    .isLength({ min: 2, max: 200 })
    .trim(),
    body('lastname', 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร.')
    .isLength({ min: 2, max: 200 })
    .trim(),
    body('bankName', 'ระบุชื่อธนาคารที่ถูกต้อง.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('bankAccount', 'เลขบัญชีต้องมี 10 หลัก.')
    .isLength({ min: 10, max: 10 })
    .trim(),
    body('bankAccount', 'เลขบัญชีไม่ถูกต้อง.')
    .isInt()
    .trim(),
    body('tel', 'เบอร์โทรต้องมี 10 หลัก.')
    .isLength({ min: 10, max: 10 })
    .trim(),
    body('line', 'กรุณาระบุ Line ID.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    sanitizeBody('*').escape(),
    async(req, res) => {
        const payload = req.body
        try {
            // VALIDATION USER
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(
                    res,
                    'Validation Error.',
                    errors.array()[0].msg
                )
            }

            const accountNumbers = payload.bankAccount.substr(
                payload.bankAccount.length - 6
            )
            const checkTeamUser = await TeamUser.findOne({
                $or: [{ username: payload.username }],
                statusFlag: 'A'
            })
            if (checkTeamUser) {
                return apiResponse.ErrorResponse(res, 'TeamUsername ถูกใช้ไปแล้ว')
            }
            const checkTel = await TeamUser.findOne({
                $or: [{ tel: payload.tel }],
                statusFlag: 'A'
            })
            if (checkTel) {
                return apiResponse.ErrorResponse(res, 'เบอร์นี้ถูกใช้ไปแล้ว')
            }
            const checkBank = await TeamUser.aggregate([{
                    $project: {
                        _id: 1,
                        bankAccount: { $substrBytes: ['$bankAccount', 4, 6] },
                        statusFlag: 1
                    }
                },
                {
                    $match: {
                        bankAccount: accountNumbers,
                        statusFlag: 'A'
                    }
                }
            ])
            if (checkBank.length > 0) {
                return apiResponse.ErrorResponse(res, 'เลขบัญชีธนาคารนี้ถูกใช้ไปแล้ว')
            }
            // NEW USER
            const user = new TeamUser({
                adviser: payload.adviser,
                username: payload.username,
                password: await bcrypt.hash(payload.password, 10),
                firstname: payload.firstname,
                lastname: payload.lastname,
                bankName: payload.bankName,
                bankAccount: payload.bankAccount,
                tel: payload.tel,
                line: payload.line,
                statusFlag: payload.statusFlag || 'A',
                createdBy: payload.createdBy,
                updatedBy: payload.updatedBy
            })

            // SAVE USER
            await user.save()
            const userData = new TeamUserData(user)
                // const paybacks = await (await TeamUserPlay.findOne({ userID: null })).toJSON()
                // const userPlayData = new TeamUserPlayData({
                //   ...paybacks,
                //   userID: userData.id
                // })
                // await TeamUserPlay.findByIdAndUpdate(userPlayData.id, {
                //   $set: userPlayData
                // })
            return apiResponse.successResponseWithData(
                res,
                'TeamUser add Success.',
                userData
            )
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]
exports.userUpdateImg = [
    body('image', 'image must not be empty.')
    .isLength({ min: 1 })
    .trim(),
    async(req, res) => {
        const payload = req.body
        const { id } = req.params

        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(
                    res,
                    'Validation Error.',
                    errors.array()
                )
            }

            imageName = dayjs().format('YYYY_MM_DD_HH_mm_ss_A_') + id + '.jpg'
            base64 = he.decode(payload.image)
            const imageBufferData = Buffer.from(base64, 'base64')
            var streamObj = new ReadableData()
            streamObj.push(imageBufferData)
            streamObj.push(null)
            streamObj.pipe(
                fs.createWriteStream(`assets/images/userProfile/${imageName}`)
            )

            const user = new TeamUser({
                image: imageName,
                _id: id
            })

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return apiResponse.validationErrorWithData(
                    res,
                    'Invalid Error.',
                    'Invalid ID'
                )
            }

            const checkTeamUser = await TeamUser.findById(id)
            if (checkTeamUser === null) {
                return apiResponse.notFoundResponse(res, 'TeamUser not exists with this id')
            }

            const updateTeamUser = await TeamUser.findByIdAndUpdate(id, {
                $set: user
            })

            if (updateTeamUser) {
                let userData = new TeamUserData(await TeamUser.findById(id))
                return apiResponse.successResponseWithData(
                    res,
                    'TeamUser update Success.',
                    userData
                )
            } else {
                return apiResponse.validationErrorWithData(
                    res,
                    'Invalid Error.',
                    'Invalid ID'
                )
            }
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]
exports.userUpdate = [
    body('username', 'username must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('password', 'password must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('firstname', 'firstname must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('lastname', 'lastname must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('bankName', 'bankName must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('bankAccount', 'bankAccount must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('tel', 'tel must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('line', 'line must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('image', 'image must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
    body('statusFlag', 'statusFlag must be 1 length.')
    .isLength({ min: 1, max: 1 })
    .trim(),
    body('createdBy', 'createdBy must be 24 length.')
    .isLength({ min: 24, max: 24 })
    .trim(),
    body('updatedBy', 'updatedBy must be 24 length.')
    .isLength({ min: 24, max: 24 })
    .trim(),
    sanitizeBody('*').escape(),
    async(req, res) => {
        const payload = req.body
        const { id } = req.params

        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(
                    res,
                    'Validation Error.',
                    errors.array()
                )
            }

            const checkTeamUserNotEqual = await TeamUser.findOne({
                _id: { $ne: id },
                username: payload.username,
                statusFlag: payload.statusFlag
            })
            if (checkTeamUserNotEqual) {
                return apiResponse.ErrorResponse(res, 'TeamUser exists with this id')
            }

            const user = new TeamUser({
                username: payload.username,
                password: await bcrypt.hash(payload.password, 10),
                firstname: payload.firstname,
                lastname: payload.lastname,
                bankName: payload.bankName,
                bankAccount: payload.bankAccount,
                tel: payload.tel,
                image: payload.image,
                statusFlag: payload.statusFlag,
                createdBy: payload.createdBy,
                updatedBy: payload.updatedBy,
                _id: id
            })

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return apiResponse.validationErrorWithData(
                    res,
                    'Invalid Error.',
                    'Invalid ID'
                )
            }

            const checkTeamUser = await TeamUser.findById(id)
            if (checkTeamUser === null) {
                return apiResponse.notFoundResponse(res, 'TeamUser not exists with this id')
            }

            const updateTeamUser = await TeamUser.findByIdAndUpdate(id, {
                $set: user
            })

            if (updateTeamUser) {
                let userData = new TeamUserData(await TeamUser.findById(id))
                return apiResponse.successResponseWithData(
                    res,
                    'TeamUser update Success.',
                    userData
                )
            } else {
                return apiResponse.validationErrorWithData(
                    res,
                    'Invalid Error.',
                    'Invalid ID'
                )
            }
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]

exports.userDelete = [
    async(req, res) => {
        const { id } = req.params

        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return apiResponse.validationErrorWithData(
                    res,
                    'Invalid Error.',
                    'Invalid ID'
                )
            }

            const checkTeamUser = await TeamUser.findById(id)
            if (checkTeamUser === null) {
                return apiResponse.notFoundResponse(res, 'TeamUser not exists with this id')
            }

            await TeamUser.findByIdAndDelete(id)

            return apiResponse.successResponse(res, `TeamUser delete Success.`)
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]