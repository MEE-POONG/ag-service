const express = require('express')
const teamController = require('../controllers/team.controller')

var router = express.Router()

router.get('/', teamController.teamList)
router.get('/:id', teamController.teamDetail)
router.post('/search', teamController.teamSearch)
router.post('/', teamController.teamStore)
router.put('/:id', teamController.teamUpdate)
router.delete('/:id', teamController.teamDelete)

module.exports = router