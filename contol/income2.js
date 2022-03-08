require('dotenv').config()

const delay = require('delay')
const { Poseidon99, UFA66, TOP168 } = require('../dataWeb')
const _ = require('lodash')
const chalk = require('chalk')
const Income = require('../models/income.model')

var moment = require('moment')
var mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})

const puppeteer = require('puppeteer')
require('dotenv').config()
const userA = 'ufrcbvip'
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
;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 5000 },
    args
  })
  const page = await browser.newPage()
  let element, formElement, tabs
  await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' })

  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type(userA)
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(passA)
  element = await page.$x(`//*[@id="btnSignIn"]`)

  await Promise.all([
    element[0].click(),
    page.waitForNavigation({ waitUntil: 'load' })
  ])

  for (const iterator of _.uniqBy(UFA66, 'master')) {
    await fetchWinLose(page, iterator.master, iterator.senior, iterator.share, iterator.positiveBalance, iterator.transferBalance)
  }
})()

const fetchWinLose = async (page, master, senior, share, positiveBalance, transferBalance) => {
  await page.goto(
    agtest +
      `/_Part_Sub/SubAccsWinLose2.aspx?role=ag&userName=` +
      master +
      `&from=02/28/2022&to=03/06/2022&userID=` +
      senior +
      `&checkAll=True`,
    {
      waitUntil: 'load'
    }
  )
  console.log(chalk.green(`${master} - ${senior}`))

  await page.waitForXPath(`//*[@name="datBegin"]`, { visible: true })
  ;[element] = await page.$x(`//*[@name="datBegin"]`)
  let incomeStartDate = await page.evaluate(element => element.value, element)

  await page.waitForXPath(`//*[@name="datEnd"]`, { visible: true })
  ;[element] = await page.$x(`//*[@name="datEnd"]`)
  let incomeEndDate = await page.evaluate(element => element.value, element)

  await page.waitForXPath(`//*[@id="SubAccsWinLose_cm1_g"]`, { visible: true })
  resultTable = await page.evaluate(async () => {
    const rows = document.querySelectorAll('#SubAccsWinLose_cm1_g tbody tr')
    return Array.from(rows, row => {
      const columns = row.querySelectorAll('td')
      return Array.from(columns, column => column.innerText)
    })
  })
  for (var i = 0; i < resultTable.length; i++) {
    if (resultTable[i][2] !== 'THB') {
      resultTable.splice(i, 1)
    }
  }
  await resultTable.shift()
  for (const iterator of resultTable) {
    const commissionAgen = await Number(
      iterator[9].toString().replace(/,/g, '')
    )
    const winAndLoseAgen = await Number(
      iterator[10].toString().replace(/,/g, '')
    )
    const winAndLoseMaster = await Number(
      iterator[14].toString().replace(/,/g, '')
    )
    const customerWin = Math.floor((0 - winAndLoseAgen) * share)
    const summaryLose = customerWin + positiveBalance
    console.log(
      chalk.yellow(
        iterator[0],
        iterator[5],
        iterator[9],
        iterator[10],
        "customerWin:" + winAndLoseAgen > 0 ? customerWin : 0,
        "customerLose:" + winAndLoseAgen < 0 ? customerWin : 0,
        "positiveBalance:" + positiveBalance,
        "transferBalance:" + transferBalance,
        "summaryLose:" + summaryLose,
        iterator[14]
      )
    )
    const income = new Income({
      usernameAG: iterator[0],
      online: iterator[5],
      commissionAgen: commissionAgen,
      winAndLoseAgen: winAndLoseAgen,
      customerWin: winAndLoseAgen > 0 ? customerWin : 0,
      customerLose: winAndLoseAgen < 0 ? customerWin : 0,
      positiveBalance: positiveBalance,
      transferBalance: transferBalance,
      summaryLose: summaryLose,
      winAndLoseMaster: winAndLoseMaster,
      incomeStartDate: moment(
        incomeStartDate + ' 12:00',
        'MM-DD-YYYY HH:mm'
      ).format(),
      incomeEndDate: moment(
        incomeEndDate + ' 12:00',
        'MM-DD-YYYY HH:mm'
      ).format(),
      agStatus: '',
      statusFlag: 'A',
      action: '',
      createdBy: mongoose.Types.ObjectId('61ff9d0049b196b7ba3476d6'),
      updatedBy: mongoose.Types.ObjectId('61ff9d0049b196b7ba3476d6')
    })
    await income.save()
  }
  return
}
