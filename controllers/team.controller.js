const Team = require('../models/team.model')
const { body, validationResult } = require('express-validator')
const { sanitizeBody } = require('express-validator')
var mongoose = require('mongoose')

var apiResponse = require('../helpers/apiResponse')

// Team Schema
function TeamData(data) {
    this.id = data._id
    this.name = data.name
    this.statusFlag = data.statusFlag
    this.createdBy = data.createdBy
    this.createdAt = data.createdAt
    this.updatedBy = data.updatedBy
    this.updatedAt = data.updatedAt
}

exports.teamList = [
    async(req, res) => {
        try {
            const teams = await Team.find({}).limit(50)
            return apiResponse.successResponseWithData(
                res,
                'Operation success',
                teams
            )
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]
exports.teamDetail = [
    async(req, res) => {
        const { id } = req.params

        try {
            const team = await Team.findById(id)

            if (team !== null) {
                let teamData = new TeamData(team)
                return apiResponse.successResponseWithData(
                    res,
                    'Operation success',
                    teamData
                )
            } else {
                return apiResponse.successResponseWithData(res, 'Operation success', {})
            }
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]
exports.teamSearch = [
    sanitizeBody('*').escape(),
    async(req, res) => {
        const keyword = req.body.keyword || '';
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
            const team = await Team.aggregate([
                { $match: { usernameAG: new RegExp(keyword, "i") } },
                { $limit: 50 }
            ])
            return apiResponse.successResponseWithData(
                res,
                'Operation success',
                team,
            )
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]
exports.teamStore = [
    body('name', 'name must not be empty.')
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
        try {
            // VALIDATION TEAM
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(
                    res,
                    'Validation Error.',
                    errors.array()
                )
            }
            const checkUser = await Team.findOne({
                $or: [{ usernameAG: payload.usernameAG }],
                statusFlag: 'A'
            })
            if (checkUser) {
                return apiResponse.ErrorResponse(
                    res,
                    'usernameAG exists with this id'
                )
            }
            // NEW TEAM
            const team = new Team({
                    userID: payload.userID,
                    name: payload.name,
                    statusFlag: payload.statusFlag,
                    createdBy: payload.createdBy,
                    updatedBy: payload.updatedBy
                })
                // SAVE TEAM
            await team.save()
            let teamData = new TeamData(team)

            return apiResponse.successResponseWithData(
                res,
                'Team add Success.',
                teamData
            )
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]
exports.teamUpdate = [
    body('name', 'name must not be empty.')
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
            const team = new Team({
                name: payload.name,
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

            const checkTeam = await Team.findById(id)
            if (checkTeam === null) {
                return apiResponse.notFoundResponse(
                    res,
                    'Team not exists with this id'
                )
            }

            const updateTeam = await Team.findByIdAndUpdate(id, {
                $set: team
            })

            if (updateTeam) {
                let teamData = new TeamData(await Team.findById(id))
                return apiResponse.successResponseWithData(
                    res,
                    'Team update Success.',
                    teamData
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

exports.teamDelete = [
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

            const checkTeam = await Team.findById(id)
            if (checkTeam === null) {
                return apiResponse.notFoundResponse(
                    res,
                    'Team not exists with this id'
                )
            }

            await Team.findByIdAndDelete(id)

            return apiResponse.successResponse(res, `Team delete Success.`)
        } catch (error) {
            return apiResponse.ErrorResponse(res, error)
        }
    }
]