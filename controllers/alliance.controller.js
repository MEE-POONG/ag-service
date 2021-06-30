const Alliance = require('../models/alliance.model')
const { body, validationResult } = require('express-validator')
const { sanitizeBody } = require('express-validator')
var mongoose = require('mongoose')

var apiResponse = require('../helpers/apiResponse')

// Alliance Schema
function AllianceData(data) {
  this.id = data._id
  this.userID = data.userID
  this.webname = data.webname
  this.status = data.status
  this.usernameAG = data.usernameAG
  this.reserveUser = data.reserveUser
  this.incomeDividID = data.incomeDividID
  this.statusFlag = data.statusFlag
  this.createdBy = data.createdBy
  this.createdAt = data.createdAt
  this.updatedBy = data.updatedBy
  this.updatedAt = data.updatedAt
}

exports.allianceList = [
  async (req, res) => {
    try {
      const alliances = await Alliance.find({})
      return apiResponse.successResponseWithData(
        res,
        'Operation success',
        alliances
      )
    } catch (error) {
      return apiResponse.ErrorResponse(res, error)
    }
  }
]
exports.allianceDetail = [
  async (req, res) => {
    const { id } = req.params

    try {
      const alliance = await Alliance.findById(id)

      if (alliance !== null) {
        let allianceData = new AllianceData(alliance)
        return apiResponse.successResponseWithData(
          res,
          'Operation success',
          allianceData
        )
      } else {
        return apiResponse.successResponseWithData(res, 'Operation success', {})
      }
    } catch (error) {
      return apiResponse.ErrorResponse(res, error)
    }
  }
]
exports.allianceSearch = [
  sanitizeBody('*').escape(),
  async (req, res) => {
    const keyword = req.body.keyword || '';
    const senior = req.body.seniorStatus;
    const master = req.body.masterStatus;
    const agen = req.body.agentStatus;
    const webSearch = req.body.webSearch
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
      const alliance = await Alliance.aggregate([
        { $match: { usernameAG: new RegExp(keyword, "i"), webname: new RegExp(webSearch, "i") } }
      ])
      return apiResponse.successResponseWithData(
        res,
        'Operation success',
        alliance,
        console.log(alliance),
      )
    } catch (error) {
      return apiResponse.ErrorResponse(res, error)
    }
  }
]
exports.allianceStore = [
  body('webname', 'webname must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
  body('status', 'status must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
  body('usernameAG', 'usernameAG must not be empty.')
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
  async (req, res) => {
    const payload = req.body
    try {
      // VALIDATION ALLIANCE
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          'Validation Error.',
          errors.array()
        )
      }
      const checkUser = await Alliance.findOne({
        $or: [{ usernameAG: payload.usernameAG }],
        statusFlag: 'A'
      })
      if (checkUser) {
        return apiResponse.ErrorResponse(
          res,
          'usernameAG exists with this id'
        )
      }
      // NEW ALLIANCE
      const alliance = new Alliance({
        userID: payload.userID,
        webname: payload.webname,
        status: payload.status,
        usernameAG: payload.usernameAG,
        reserveUser: payload.reserveUser,
        incomeDividID: payload.incomeDividID,
        statusFlag: payload.statusFlag,
        createdBy: payload.createdBy,
        updatedBy: payload.updatedBy
      })
      // SAVE ALLIANCE
      await alliance.save()
      let allianceData = new AllianceData(alliance)

      return apiResponse.successResponseWithData(
        res,
        'Alliance add Success.',
        allianceData
      )
    } catch (error) {
      return apiResponse.ErrorResponse(res, error)
    }
  }
]
exports.allianceUpdate = [
  body('webname', 'webname must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
  body('status', 'status must not be empty.')
    .isLength({ min: 1, max: 200 })
    .trim(),
  body('usernameAG', 'usernameAG must not be empty.')
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
  async (req, res) => {
    const payload = req.body
    const { id } = req.params

    try {
      const alliance = new Alliance({
        userID: payload.userID,
        webname: payload.webname,
        status: payload.status,
        usernameAG: payload.usernameAG,
        passwordAG: payload.passwordAG,
        reserveUser: payload.reserveUser,
        incomeDividID: payload.incomeDividID,
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

      const checkAlliance = await Alliance.findById(id)
      if (checkAlliance === null) {
        return apiResponse.notFoundResponse(
          res,
          'Alliance not exists with this id'
        )
      }

      const updateAlliance = await Alliance.findByIdAndUpdate(id, {
        $set: alliance
      })

      if (updateAlliance) {
        let allianceData = new AllianceData(await Alliance.findById(id))
        return apiResponse.successResponseWithData(
          res,
          'Alliance update Success.',
          allianceData
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

exports.allianceDelete = [
  async (req, res) => {
    const { id } = req.params

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return apiResponse.validationErrorWithData(
          res,
          'Invalid Error.',
          'Invalid ID'
        )
      }

      const checkAlliance = await Alliance.findById(id)
      if (checkAlliance === null) {
        return apiResponse.notFoundResponse(
          res,
          'Alliance not exists with this id'
        )
      }

      await Alliance.findByIdAndDelete(id)

      return apiResponse.successResponse(res, `Alliance delete Success.`)
    } catch (error) {
      return apiResponse.ErrorResponse(res, error)
    }
  }
]
