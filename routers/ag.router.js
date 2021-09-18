const express = require('express')
const agController = require('../controllers/ag.controller')
const agenController = require('../controllers/agen.controller')

var router = express.Router()
router.post('/create-customer', agController.agStoreCustomer)
router.post('/create-agen', agController.agStoreAgen)
router.post('/money-allince', agController.agMoneyAllince)
router.post('/down-agen', agController.agDownAgen)
router.post('/set-pass-allince', agController.agSetPassAllince)
router.post('/set-agen-and-pass', agController.agSetAgenAndPass)
router.post('/a-create-customer', agenController.aCreateCustomer)

module.exports = router
