const express = require('express')
const agController = require('../controllers/ag.controller')

var router = express.Router()
router.post('/create-customer', agController.agStoreCustomer)
router.post('/create-agen', agController.agStoreAgen)
router.post('/create-master', agController.agStoreMaster)
router.post('/agen-money', agController.agAgenMoney)
router.post('/master-money', agController.agMasterMoney)
router.post('/down-agen', agController.agDownAgen)
router.post('/set-agen-pass', agController.agSetAgenPass)
router.post('/set-master-pass', agController.agSetMasterPass)
router.post('/set-agen-and-pass', agController.agSetAgenAndPass)

module.exports = router
