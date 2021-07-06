const express = require('express')
const agController = require('../controllers/ag.controller')

var router = express.Router()
router.post('/create-customer', agController.agStoreCustomer)
router.post('/create-allince', agController.agStoreAllince)
router.post('/money-allince', agController.agMoneyAllince)
router.post('/down-agen', agController.agDownAgen)
router.post('/set-pass-allince', agController.agSetPassAllince)
router.post('/set-agen-and-pass', agController.agSetAgenAndPass)

module.exports = router
