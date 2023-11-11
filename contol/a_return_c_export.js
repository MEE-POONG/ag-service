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
// 66	Win168+User66++
// top	Tpufa168wptop++
require('dotenv').config()

const PSD99 = async () => {
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
  wb.write('ยอดเสีย5เปอร์เซ็นPSD99.xlsx');
  console.log("Export PSD99 Success")
}

const UFA66 = async () => {
  const data = await ReturnCustomerUFA.find({})
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
  wb.write('ยอดเสีย5เปอร์เซ็น UFA66.xlsx');
  console.log("Export UFA66 Success")
}

const TOP168 = async () => {
  const data = await ReturnCustomerTOP.find({})
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
  wb.write('ยอดเสีย5เปอร์เซ็น TOP168.xlsx');
  console.log("Export TOP168 Success")
}

const startExport = async () => {
  await PSD99();
  await UFA66();
  await TOP168();
}

exports.startExport = startExport

exports.Excel = async (model, name) => {
  const data = await model.find({})
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
  wb.write(`ยอดเสีย5เปอร์เซ็น ${name}.xlsx`);
  console.log(`Export ${name}  Success`)
}


