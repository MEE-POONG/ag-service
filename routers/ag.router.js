const express = require('express')
const agController = require('../controllers/ag.controller')
const agenController = require('../controllers/agen.controller')
const seniorController = require('../controllers/senior.controller')

var router = express.Router()
// router.post('/create-customer', agenController.aCoppyCustomer)
// router.post('/create-customer-zero', agenController.aCreateCustomer)
// router.post('/create-agen', agController.agStoreAgen)
// router.post('/money-allince', agController.agMoneyAllince)
// router.post('/down-agen', agController.agDownAgen)
// router.post('/set-pass-allince', agController.agSetPassAllince)
// router.post('/set-agen-and-pass', agController.agSetAgenAndPass)

// router.post('/s-create-m', seniorController.CreateMaster)
router.post('/s-coppy-m', seniorController.CoppyMaster)
// router.post('/s-betlevel-m', seniorController.BetLevelMaster)
// router.post('/s-checkredit-m', seniorController.CheckCreditMaster)
// router.post('/s-upcredit-m', seniorController.UpCreditMaster)
// router.post('/s-transfer-m', seniorController.TransferMaster)
// router.post('/s-repass-m', seniorController.RePassMaster)
// router.post('/s-lock-m', seniorController.LockMaster)

module.exports = router
