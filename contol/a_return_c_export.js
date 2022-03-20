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

const ReturnCustomerPSD = require('../models/returnCustomerPSD')
const ReturnCustomerUFA66 = require('../models/returnCustomerUFA66')
const ReturnCustomerTOP = require('../models/returnCustomerTOP')
// psd	T99Ppvip999.
// 66	Vip66ufa~168++
// top	Tpufa168wptop++
require('dotenv').config()

const startExport = async () => {
  const data = await ReturnCustomerPSD.find({})
  var wb = new xl.Workbook()
  var ws = wb.addWorksheet('Sheet 1')
  ws.cell(1, 1).string('ยูส')
  ws.cell(1, 2).string('ยอด')
  let index = 1
  for (const iterator of data) {
    index += 1
    ws.cell(index, 1).string(iterator.usernameAG)
    ws.cell(index, 2).string(iterator.returnCredit)
  }
  wb.write('ยอดเสีย5เปอร์เซ็นUFA66.xlsx');
  console.log("Export Success")
}
startExport()
