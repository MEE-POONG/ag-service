const express = require('express')
const agController = require('../controllers/ag.controller')
const agenController = require('../controllers/agen.controller')
const seniorController = require('../controllers/senior.controller')

var router = express.Router()
router.post('/create-customer', agenController.aCoppyCustomer)
router.post('/create-customer-zero', agenController.aCreateCustomer)
router.post('/create-agen', agController.agStoreAgen)
router.post('/money-allince', agController.agMoneyAllince)
router.post('/down-agen', agController.agDownAgen)
router.post('/set-pass-allince', agController.agSetPassAllince)
router.post('/set-agen-and-pass', agController.agSetAgenAndPass)
// router.post('/a-create-customer', agenController.aCreateCustomer)
// router.post('/a-coppy-customer', agenController.aCoppyCustomer)
router.post('/a-create-c', agenController.CreateCustomer)


module.exports = router
