const express = require('express')
const allianceController = require('../controllers/alliance.controller')

var router = express.Router()

router.get('/', allianceController.allianceList)
router.get('/:id', allianceController.allianceDetail)
router.post('/search', allianceController.allianceSearch)
router.post('/', allianceController.allianceStore)
router.put('/:id', allianceController.allianceUpdate)
router.delete('/:id', allianceController.allianceDelete)

module.exports = router
