require('dotenv').config()

const creditWindModel = require('../models/credit_wind')

var moment = require('moment')
var mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})

const delay = require('delay')
const puppeteer = require('puppeteer')
require('dotenv').config()
const userA = 'ufruuvip'
const passA = 'Pp123456++'
const agtest = 'http://ocean.isme99.com'
const args = [
  '--start-maximized',
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--unhandled-rejections=strict',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
  '--ignore-certificate-errors'
]

exports.credit_wind_PSD99 = async (from, to) => {
  const remove = await creditWindModel.remove({})
  console.log(remove)

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 5000 },
    args
  })
  const page = await browser.newPage()
  let element, formElement, tabs
  await page.goto(agtest + `/Public/Default11.aspx`, {
    waitUntil: 'networkidle2'
  })

  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type(userA)
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(passA)
  element = await page.$x(`//*[@id="btnSignIn"]`)
  await element[0].click()
  console.log('login สำเร็จ')
  await delay(5000)

  // for (let index = 195; index < 210; index++) {
  // 	let number = index.toString().padStart(3, '0').toString()
  // 	console.log(`/_SubAg1/MemberSet.aspx?userName=ufrcbxb8` + number + `&set=1`);
  await page.goto(
    agtest +
      `/_Part_Sub/SubAccsWinLose2.aspx?role=ag&userName=ufruu00&from=${from}&to=${to}&userID=ufruu&checkAll=True`,
    {
      waitUntil: 'networkidle2'
    }
  )
  console.log('SubAccsWinLose_cm1_g tbody tr')
  await page.waitForXPath(`//*[@id="SubAccsWinLose_cm1_g"]`, { visible: true })
  resultTable = await page.evaluate(async () => {
    const rows = document.querySelectorAll('#SubAccsWinLose_cm1_g tbody tr')
    console.log('rows 92 : ', rows)
    return Array.from(rows, row => {
      const columns = row.querySelectorAll('td')
      console.log('columns : ', columns)
      return Array.from(columns, column => column.innerText)
    })
  })
  console.log('--- ตัดข้อมูลทิ้ง ---')
  for (var i = 0; i < resultTable.length; i++) {
    if (resultTable[i][2] !== 'THB') {
      resultTable.splice(i, 1)
    }
  }
  await resultTable.shift()
  console.log('89 : ', resultTable)
  for (var i = 0; i < resultTable.length; i++) {
    const userWind = resultTable[i][0]
    const winAndLoseCompany = resultTable[i][16]
    console.log(i, ' : ', userWind, winAndLoseCompany)

    const model = new creditWindModel({
      userWind: userWind,
      winAndLoseCompany: winAndLoseCompany
    })
    model.save()
  }
}
