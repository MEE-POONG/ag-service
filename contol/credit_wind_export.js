require('dotenv').config()
const delay = require('delay')
var xl = require('excel4node')

const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI

console.log(MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })

mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})
const Income = require('../models/income.model')

// psd	T99Ppvip999.
// 66	Vip66ufa~168++
// top	Tpufa168wptop++
require('dotenv').config()

const startExport = async () => {
  const data = await Income.find({})
  var wb = new xl.Workbook()
  var ws = wb.addWorksheet('Sheet 1')
  ws.cell(1, 1).string('ยูส')
  ws.cell(1, 2).string('ออนไลน์')
  ws.cell(1, 3).string('คอมมิชชั่น')
  ws.cell(1, 4).string('ลูกค้าทีเสีย')
  ws.cell(1, 5).string('ลูกค้าทีได้')
  ws.cell(1, 6).string('ยอดค้างบวก')
  ws.cell(1, 7).string('ยอดสรุปยูสลม')
  ws.cell(1, 8).string('ยอดสรุปได้เสีย')
  ws.cell(1, 9).string('ยอดค้างโอน')
  ws.cell(1, 10).string('ยอดสรุป')
  let index = 1
  for (const iterator of data) {
    index += 1
    ws.cell(index, 1).string(iterator.usernameAG)
    ws.cell(index, 2).string(iterator.online)
    ws.cell(index, 3).string(iterator.commissionAgen)
    ws.cell(index, 4).string(iterator.customerLose)
    ws.cell(index, 5).string(iterator.customerWin)
    ws.cell(index, 6).string(iterator.positiveBalance)
    ws.cell(index, 7).string(iterator.deductionWind)
    ws.cell(index, 8).string(iterator.summaryLose)
    ws.cell(index, 9).string(iterator.transferBalance)
    ws.cell(index, 10).string(iterator.transferAmount)
  }
  wb.write('รายได้พันธมิตร.xlsx')
  console.log('Export Success')
}
startExport()
