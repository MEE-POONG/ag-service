require('dotenv').config()
const delay = require('delay')
var xl = require('excel4node')
const _ = require('lodash')

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

const startExport = async days => {
  const name = days.replace(/[/]/g, "-")
  const data = await Income.find({})
  var wb = new xl.Workbook()
  var ws = wb.addWorksheet(`รายได้พันธมิตร PSD99 ${name}`)
  ws.cell(1, 1).string('มาสเตอร์')
  ws.cell(1, 2).string('ยูส')
  ws.cell(1, 3).string('สู้ฟรี')
  ws.cell(1, 4).string('ออนไลน์')
  ws.cell(1, 5).string('คอมมิชชั่น')
  ws.cell(1, 6).string('แพ้ชนะเต็ม')
  ws.cell(1, 7).string('ยอดสรุปได้เสียลูกค้า')
  ws.cell(1, 8).string('ลูกค้าทีเสีย')
  ws.cell(1, 9).string('ลูกค้าทีได้')
  ws.cell(1, 10).string('ยอดค้างบวก')
  ws.cell(1, 11).string('ยอดสรุปได้เสีย')
  ws.cell(1, 12).string('ยูสลม')
  ws.cell(1, 13).string('หักยูสลม')
  ws.cell(1, 14).string('ยอดค้างโอน')
  ws.cell(1, 15).string('สรุปยอดโอน')
  ws.cell(1, 16).string('มียอดค้าง')
  ws.cell(1, 17).string('มีคอมมิสชั่น')
  ws.cell(1, 18).string('จ่าย')
  let index = 1
  for (const iterator of data) {
    index += 1
    console.log(iterator.hold, iterator.commission, iterator.pay)
    ws.cell(index, 1).string(iterator.master)
    ws.cell(index, 2).string(iterator.usernameAG)
    ws.cell(index, 3).number(iterator.share)
    ws.cell(index, 4).number(iterator.online)
    ws.cell(index, 5).number(iterator.commissionAgen)
    ws.cell(index, 6).number(iterator.lessCommission)
    ws.cell(index, 7).number(iterator.winAndLoseAgen)
    ws.cell(index, 8).number(iterator.customerLose)
    ws.cell(index, 9).number(iterator.customerWin)
    ws.cell(index, 10).number(iterator.positiveBalance)
    ws.cell(index, 11).number(iterator.summaryLose)
    ws.cell(index, 12).number(iterator.windCredit)
    ws.cell(index, 13).number(iterator.deductionWind)
    ws.cell(index, 14).number(iterator.transferBalance)
    ws.cell(index, 15).number(iterator.transferAmount)
    ws.cell(index, 16).string(iterator.hold.toString())
    ws.cell(index, 17).string(iterator.commission.toString())
    ws.cell(index, 18).string(iterator.pay.toString())
  }

  var ws1 = wb.addWorksheet(`รายได้มาสเตอร์ PSD99 ${name}`)
  ws1.cell(1, 1).string('ยูสมาสเตอร์')
  ws1.cell(1, 2).string('เสียบวกมาสเตอร์')
  ws1.cell(1, 3).string('ยอดโปรโมชั่น')
  ws1.cell(1, 4).string('ยอดเสียเอเย่นต์')
  ws1.cell(1, 5).string('ยอดเสียจ่ายจริง')
  ws1.cell(1, 6).string('ยอดค้างเก่า')
  ws1.cell(1, 7).string('สรุปยอดรวม')
  ws1.cell(1, 8).string('รายได้')
  let indexMaster = 1
  for (const iterator of _.uniqBy(data, 'master')) {
    indexMaster += 1
    ws1.cell(indexMaster, 1).string(iterator.master)
    ws1.cell(indexMaster, 2).number(iterator.windAndLossMaster)
    ws1.cell(indexMaster, 3).number(-iterator.promotion)
    ws1.cell(indexMaster, 4).number(iterator.payFull ? -iterator.sumCustomerLose : 0)
    ws1.cell(indexMaster, 5).number(!iterator.payFull ? -iterator.summaryLoseMaster : 0)
    ws1.cell(indexMaster, 6).number(iterator.positiveMaster)
    ws1.cell(indexMaster, 7).number(iterator.amountMaster)
    ws1.cell(indexMaster, 8).number(iterator.sumMaster)
  }

  wb.write(`รายได้-PSD99-${name}.xlsx`)
  console.log('Export Success')
}

exports.startExport = startExport

// startExport(from + '-' + to)
