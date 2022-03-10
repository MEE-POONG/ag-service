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

exports.startExport = async (days) => {
  const data = await Income.find({})
  var wb = new xl.Workbook()
  var ws = wb.addWorksheet(`รายได้พันธมิตร UFA66 ${days}`)
  ws.cell(1, 1).string('มาสเตอร์')
  ws.cell(1, 2).string('ยูส')
  ws.cell(1, 3).string('สู้ฟรี')
  ws.cell(1, 4).string('ออนไลน์')
  ws.cell(1, 5).string('คอมมิชชั่น')
  ws.cell(1, 6).string('ยอดสรุปได้เสียลูกค้า')
  ws.cell(1, 7).string('ลูกค้าทีเสีย')
  ws.cell(1, 8).string('ลูกค้าทีได้')
  ws.cell(1, 9).string('ยอดค้างบวก')
  ws.cell(1, 10).string('ยอดสรุปได้เสีย')
  ws.cell(1, 11).string('ยูสลม')
  ws.cell(1, 12).string('หักยูสลม')
  ws.cell(1, 13).string('ยอดค้างโอน')
  ws.cell(1, 14).string('สรุปยอดโอน')
  let index = 1
  for (const iterator of data) {
    index += 1
    ws.cell(index, 1).string(iterator.master)
    ws.cell(index, 2).string(iterator.usernameAG)
    ws.cell(index, 3).number(iterator.share)
    ws.cell(index, 4).number(iterator.online)
    ws.cell(index, 5).number(iterator.commissionAgen)
    ws.cell(index, 6).number(iterator.winAndLoseAgen)
    ws.cell(index, 7).number(iterator.customerLose)
    ws.cell(index, 8).number(iterator.customerWin)
    ws.cell(index, 9).number(iterator.positiveBalance)
    ws.cell(index, 10).number(iterator.summaryLose)
    ws.cell(index, 11).number(iterator.windCredit)
    ws.cell(index, 12).number(iterator.deductionWind)
    ws.cell(index, 13).number(iterator.transferBalance)
    ws.cell(index, 14).number(iterator.transferAmount)
  }
  wb.write(`รายได้พันธมิตร-UFA66-${days}.xlsx`)
  console.log('Export Success')
}


