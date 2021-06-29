const express = require('express')
const promotionController = require('../controllers/promotion.controller')

var router = express.Router()

router.get('/', promotionController.promotionList)
router.get('/:id', promotionController.promotionDetail)
router.post('/', promotionController.promotionStore)
router.put('/:id', promotionController.promotionUpdate)
router.delete('/:id', promotionController.promotionDelete)

module.exports = router
