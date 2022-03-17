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
const AgInformation = require('../models/agInformation.model')

// psd	T99Ppvip999.
// 66	Vip66ufa~168++
// top	Tpufa168wptop++
require('dotenv').config()

const startExport = async days => {
  const name = days.replace(/[/]/g, "-")
  const AGdata = await AgInformation.find({})
  const data = await Income.find({})
  var wb = new xl.Workbook()

  var ws0 = wb.addWorksheet(`ข้อมูล`)
  ws0.cell(1, 1).string('N1')
  ws0.cell(1, 2).string('N2')
  ws0.cell(1, 3).string('N3')
  ws0.cell(1, 4).string('N4')
  ws0.cell(1, 5).string('N5')
  ws0.cell(1, 6).string('N6')
  ws0.cell(1, 7).string('N7')
  ws0.cell(1, 8).string('N8')
  ws0.cell(1, 9).string('N9')
  ws0.cell(1, 10).string('N10')
  ws0.cell(1, 11).string('N11')
  ws0.cell(1, 12).string('N12')
  ws0.cell(1, 13).string('N13')
  ws0.cell(1, 14).string('N14')
  ws0.cell(1, 15).string('N15')
  ws0.cell(1, 16).string('N16')
  ws0.cell(1, 17).string('N17')
  ws0.cell(1, 18).string('N18')
  ws0.cell(1, 19).string('N19')
  
  let idx = 1
  for (const iterator of AGdata) {
    idx += 1
    ws0.cell(idx, 1).string(iterator.N1)
    ws0.cell(idx, 2).string(iterator.N2)
    ws0.cell(idx, 3).string(iterator.N3)
    ws0.cell(idx, 4).string(iterator.N4)
    ws0.cell(idx, 5).string(iterator.N5)
    ws0.cell(idx, 6).string(iterator.N6)
    ws0.cell(idx, 7).string(iterator.N7)
    ws0.cell(idx, 8).string(iterator.N8)
    ws0.cell(idx, 9).string(iterator.N9)
    ws0.cell(idx, 10).string(iterator.N10)
    ws0.cell(idx, 11).string(iterator.N11)
    ws0.cell(idx, 12).string(iterator.N12)
    ws0.cell(idx, 13).string(iterator.N13)
    ws0.cell(idx, 14).string(iterator.N14)
    ws0.cell(idx, 15).string(iterator.N15)
    ws0.cell(idx, 16).string(iterator.N16)
    ws0.cell(idx, 17).string(iterator.N17)
    ws0.cell(idx, 18).string(iterator.N18)
    ws0.cell(idx, 19).string(iterator.N19)
  }


  var ws = wb.addWorksheet(`รายได้พันธมิตร UFA66`)
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

  var ws1 = wb.addWorksheet(`รายได้มาสเตอร์ UFA66`)
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

  wb.write(`รายได้-UFA66-${name}.xlsx`)
  console.log('Export Success')
}

exports.startExport = startExport


