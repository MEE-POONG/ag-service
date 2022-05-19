const UFH27USER = 'ufh27vipp'
const UFRCBUSER = 'ufrcbvip'
const UFRCEUSER = 'ufrcevip'
const TOPUSER = 'ufrcbvip'
const UFRUUUSER = 'ufruuvip'
const UFRUVUSER = 'ufruvvip'
const FROM = '04/01/2022'
const TO = '04/30/2022'

require('dotenv').config()
const delay = require('delay')

const chalk = require('chalk')
console.log(chalk.green('START AG SETVICE VERSION 1.0.0'))

const fs = require('fs')

const { readImg } = require('../system/utils/tesseractGet')
const { createWorker } = require('tesseract.js')
const worker = createWorker()

const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI

console.log(MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })

mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})

const FailedLogin = require('../models/failedLogin.model')
const ReturnCustomerPSD = require('../models/returnCustomerPSD')
const ReturnCustomerUFA66 = require('../models/returnCustomerUFA66')
const ReturnCustomerTOP = require('../models/returnCustomerTOP')
// psd	T99Ppvip999.
// 66	Vip66ufa~168++
// top	Tpufa168wptop++
const puppeteer = require('puppeteer')
require('dotenv').config()
const userA = 'ufrcb38a2'
const passA = 'Pp123456++'
const passPsd = 'T99Ppvip999.'
const passTop = 'Tpufa168wptop++'
const agtest = 'http://ocean.isme99.com'
const { UFRUU, UFRUV, UFH27, UFRCB, UFRCE, TOP } = require('../dataWeb')
const { Excel } = require('./a_return_c_export')

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

const reconnect = async (web, page, agen, senior, idx, total) => {
  if (page.url() === 'http://ocean.isme99.com/AccessDenied.aspx') {
    await delay(1000)
    return await reconnect(web, page, agen, senior, idx, total)
  }
  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type('ufrcbvip')
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(passA)
  console.log(passA)
  element = await page.$x(`//*[@id="btnSignIn"]`)

  await Promise.all([
    element[0].click(),
    page.waitForNavigation({ waitUntil: 'load' })
  ])

  const title = await page.title()

  if (title === ':: Management ::') {
    return await reconnect(web, page, agen, senior, idx, total)
  }

  return handleWithdraw(web, page, agen, senior, idx, total)
}
const handleWithdraw = async (web, page, agen, senior, idx, total) => {
  console.log(
    agtest +
    `/_Part_Sub/SubAccsWinLose2.aspx?role=sa&userName=` +
    agen +
    `&from=${FROM}&to=${TO}&userID=` +
    senior +
    `&checkAll=True`
  )
  await Promise.all([
    await page.goto(
      agtest +
      `/_Part_Sub/SubAccsWinLose2.aspx?role=sa&userName=` +
      agen +
      `&from=${FROM}&to=${TO}&userID=` +
      senior +
      `&checkAll=True`,
      {
        waitUntil: 'load'
      }
    )
  ])
  console.log(idx, '/', total, page.url(), await page.title())

  if (page.url() === 'http://ocean.isme99.com/AccessDenied.aspx') {
    await reconnect(web, page, agen, senior, idx, total)
  }

  await page.waitForXPath(`//*[@id="SubAccsWinLose_cm1_g"]`, {
    visible: true
  })
  resultTable = await page.evaluate(async () => {
    const rows = document.querySelectorAll('#SubAccsWinLose_cm1_g tbody tr')
    console.log('rows 92 : ', rows)
    return Array.from(rows, row => {
      const columns = row.querySelectorAll('td')
      console.log('columns : ', columns)
      return Array.from(columns, column => column.innerText)
    })
  })

  if (resultTable.length <= 3) {
    return
  }

  await resultTable.shift()
  await resultTable.pop()
  // //เอาช่อง 4 ยูสเซอร์ ช่อง 9 Balance	 ช่อง 10 Balance แสดงสำหรับ เติมไม่ได้
  // //ตัดข้อมูลทิ้ง
  console.log('--- ตัดข้อมูลทิ้ง ---')

  let i = 0
  for (const iterator of resultTable) {
    if ((await iterator[2]) !== 'THB') {
      await resultTable.splice(i, 1)
    }
    i += await 1
  }

  let index = 0
  for (const iterator of resultTable) {
    const money = await Number(iterator[10].toString().replace(/,/g, ''))
    const user = await iterator[0]
    withdraw = 0
    if (web === 'PSD99') {
      withdraw = (await money) < -2000 ? 0 - money * 0.05 : 0
      withdraw = (await withdraw) > 3000 ? 3000 : withdraw
      const customerPSD = new ReturnCustomerPSD({
        usernameAG: user,
        winLose: money,
        returnCredit: withdraw,
        statusFlag: 'A',
        createdBy: '60dc8d9e9762420ab43ba7b1',
        updatedBy: '60dc8d9e9762420ab43ba7b1'
      })
      // SAVE CUSTOMER
      console.log(web, (index += 1), user, ' : ', money, ': คืน :', withdraw)
      await customerPSD.save()
    } else if (web === 'UFA66') {
      withdraw = (await money) < 0 ? 0 - money * 0.05 : 0
      withdraw = (await withdraw) > 1000 ? 1000 : withdraw
      const customerUFA66 = new ReturnCustomerUFA66({
        usernameAG: user,
        winLose: money,
        returnCredit: withdraw,
        statusFlag: 'A',
        createdBy: '60dc8d9e9762420ab43ba7b1',
        updatedBy: '60dc8d9e9762420ab43ba7b1'
      })
      // SAVE CUSTOMER
      console.log(web, (index += 1), user, ' : ', money, ': คืน :', withdraw)
      await customerUFA66.save()
    } else if (web === 'TOP168') {
      withdraw = (await money) < -3000 ? 0 - money * 0.05 : 0
      withdraw = (await withdraw) > 1000 ? 1000 : withdraw
      const customerTOP = new ReturnCustomerTOP({
        usernameAG: user,
        winLose: money,
        returnCredit: withdraw,
        statusFlag: 'A',
        createdBy: '60dc8d9e9762420ab43ba7b1',
        updatedBy: '60dc8d9e9762420ab43ba7b1'
      })
      // SAVE CUSTOMER
      console.log(web, (index += 1), user, ' : ', money, ': คืน :', withdraw)
      await customerTOP.save()
    }
  }
}

const startUFH27 = async () => {
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 5000 },
    args
  })

  const page = await browser.newPage()

  let element
  await Promise.all([
    page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' }),
    page.waitForNavigation({ waitUntil: 'load' })
  ])
  await delay(500)

  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type(UFH27USER)
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(passA)
  console.log(passA)
  element = await page.$x(`//*[@id="btnSignIn"]`)

  await Promise.all([
    element[0].click(),
    page.waitForNavigation({ waitUntil: 'load' })
  ])

  const title = await page.title()
  const urls = page.url()

  console.log('Page Title :' + title)
  console.log('Page URL : ' + urls)

  index = 0

  await ReturnCustomerUFA66.remove({}, function (err) { })
  for (const iterator of UFH27) {
    await handleWithdraw(
      iterator.web,
      page,
      iterator.username,
      iterator.senior,
      (index += 1),
      UFH27.length
    )
  }
  await Excel(ReturnCustomerUFA66, 'UFH27')
  await ReturnCustomerUFA66.remove({}, function (err) { })
}
const startUFRCB = async () => {
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 5000 },
    args
  })

  const page = await browser.newPage()

  let element
  await Promise.all([
    page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' }),
    page.waitForNavigation({ waitUntil: 'load' })
  ])
  await delay(500)

  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type(UFRCBUSER)
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(passA)
  console.log(passA)
  element = await page.$x(`//*[@id="btnSignIn"]`)

  await Promise.all([
    element[0].click(),
    page.waitForNavigation({ waitUntil: 'load' })
  ])

  const title = await page.title()
  const urls = page.url()

  console.log('Page Title :' + title)
  console.log('Page URL : ' + urls)

  index = 0

  await ReturnCustomerUFA66.remove({}, function (err) { })
  for (const iterator of UFRCB) {
    await handleWithdraw(
      iterator.web,
      page,
      iterator.username,
      iterator.senior,
      (index += 1),
      UFRCB.length
    )
  }
  await Excel(ReturnCustomerUFA66, 'UFRCB')
  await ReturnCustomerUFA66.remove({}, function (err) { })
}
const startUFRCE = async () => {
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 5000 },
    args
  })

  const page = await browser.newPage()

  let element
  await Promise.all([
    page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' }),
    page.waitForNavigation({ waitUntil: 'load' })
  ])
  await delay(500)

  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type(UFRCEUSER)
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(passA)
  console.log(passA)
  element = await page.$x(`//*[@id="btnSignIn"]`)

  await Promise.all([
    element[0].click(),
    page.waitForNavigation({ waitUntil: 'load' })
  ])

  const title = await page.title()
  const urls = page.url()

  console.log('Page Title :' + title)
  console.log('Page URL : ' + urls)

  index = 0

  await ReturnCustomerUFA66.remove({}, function (err) { })
  for (const iterator of UFRCE) {
    await handleWithdraw(
      iterator.web,
      page,
      iterator.username,
      iterator.senior,
      (index += 1),
      UFRCE.length
    )
  }
  await Excel(ReturnCustomerUFA66, 'UFRCE')
  await ReturnCustomerUFA66.remove({}, function (err) { })
}
const startTOP = async () => {
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 5000 },
    args
  })

  const page = await browser.newPage()

  let element
  await Promise.all([
    page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' }),
    page.waitForNavigation({ waitUntil: 'load' })
  ])
  await delay(500)
  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type(TOPUSER)
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(passA)
  console.log(passA)
  element = await page.$x(`//*[@id="btnSignIn"]`)

  await Promise.all([
    element[0].click(),
    page.waitForNavigation({ waitUntil: 'load' })
  ])

  const title = await page.title()
  const urls = page.url()

  console.log('Page Title :' + title)
  console.log('Page URL : ' + urls)

  index = 0

  await ReturnCustomerTOP.remove({}, function (err) { })
  for (const iterator of TOP) {
    await handleWithdraw(
      iterator.web,
      page,
      iterator.username,
      iterator.senior,
      (index += 1),
      TOP.length
    )
  }
  await Excel(ReturnCustomerTOP, 'TOP')
  await ReturnCustomerTOP.remove({}, function (err) { })
}
const startUFRUU = async () => {
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 5000 },
    args
  })

  const page = await browser.newPage()

  let element
  await Promise.all([
    page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' }),
    page.waitForNavigation({ waitUntil: 'load' })
  ])
  await delay(500)

  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type(UFRUUUSER)
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(passA)
  console.log(passA)
  element = await page.$x(`//*[@id="btnSignIn"]`)

  await Promise.all([
    element[0].click(),
    page.waitForNavigation({ waitUntil: 'load' })
  ])

  const title = await page.title()
  const urls = page.url()

  console.log('Page Title :' + title)
  console.log('Page URL : ' + urls)

  index = 0

  await ReturnCustomerPSD.remove({}, function (err) { })
  for (const iterator of UFRUU) {
    await handleWithdraw(
      iterator.web,
      page,
      iterator.username,
      iterator.senior,
      (index += 1),
      UFRUU.length
    )
  }
  await Excel(ReturnCustomerPSD, 'UFRUU')
  await ReturnCustomerPSD.remove({}, function (err) { })
}
const startUFRUV = async () => {
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 5000 },
    args
  })

  const page = await browser.newPage()

  let element
  await Promise.all([
    page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' }),
    page.waitForNavigation({ waitUntil: 'load' })
  ])
  await delay(500)

  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type(UFRUVUSER)
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(passA)
  console.log(passA)
  element = await page.$x(`//*[@id="btnSignIn"]`)

  await Promise.all([
    element[0].click(),
    page.waitForNavigation({ waitUntil: 'load' })
  ])

  const title = await page.title()
  const urls = page.url()

  console.log('Page Title :' + title)
  console.log('Page URL : ' + urls)

  index = 0

  await ReturnCustomerPSD.remove({}, function (err) { })
  for (const iterator of UFRUV) {
    await handleWithdraw(
      iterator.web,
      page,
      iterator.username,
      iterator.senior,
      (index += 1),
      UFRUV.length
    )
  }
  await Excel(ReturnCustomerPSD, 'UFRUV')
  await ReturnCustomerPSD.remove({}, function (err) { })
}

  ; (async () => {
    // await startUFH27() //UFH27
    // await startUFRCB() //UFRCB
    // await startUFRCE() //UFRCE
    // await startTOP() //TOP
    await startUFRUU() //PSD
    await startUFRUV() //PSD
  })()
