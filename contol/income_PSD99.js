require('dotenv').config()

const { startExport } = require('./income_PSD99_export')

const delay = require('delay')
const { PSD99 } = require('../dataWeb')
const _ = require('lodash')
const chalk = require('chalk')
const Income = require('../models/income.model')
const creditWindModel = require('../models/credit_wind')

var moment = require('moment')
var mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})

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
  let pageIndex = 0
  const masterUFA66 = _.uniqBy(PSD99, 'master')

  const remove = await Income.remove({})
  console.log(remove)

  for (const iterator of masterUFA66) {
    await fetchWinLose(
      page,
      iterator.master,
      iterator.senior,
      (pageIndex += 1),
      masterUFA66.length,
      iterator.promotion,
      iterator.positiveMaster,
      iterator.shareMaster,
      iterator.payFull
    )
  }
})()

const fetchWinLose = async (
  page,
  master,
  senior,
  pageIndex,
  total,
  promotion,
  positiveMaster,
  shareMaster,
  payFull
) => {
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

  if (resultTable.length <= 3) {
    return
  }

  const windAndLossMaster =
    formatNumber(resultTable[resultTable.length - 1][14]) | 0
  for (var i = 0; i < resultTable.length; i++) {
    if (resultTable[i][2] !== 'THB') {
      resultTable.splice(i, 1)
    }
  }
  await resultTable.shift()
  let sumCustomerLose = 0
  let summaryLoseMaster = 0
  for (const iterator of resultTable) {
    const {
      share,
      positiveBalance,
      transferBalance,
      userWind,
      hold,
      commission,
      pay
    } = PSD99.find(({ username }) => iterator[0] === username)
    const creditWind = await creditWindModel.findOne({ userWind })
    const windCreditCal = Number(
      ((creditWind && creditWind.winAndLoseCompany) || 0)
        .toString()
        .replace(/,/g, '')
    )
    const windCredit =
      windCreditCal < 0 ? Math.floor(windCreditCal) : Math.ceil(windCreditCal)

    const commissionAgen = Number(iterator[7].toString().replace(/,/g, '')) | 0
    const lessCommission = Number(iterator[10].toString().replace(/,/g, '')) | 0

    const winAndLoseAgen = lessCommission + commissionAgen
    const winAndLoseMaster =
      Number(iterator[14].toString().replace(/,/g, '')) | 0
    const customerWin = Math.floor((0 - winAndLoseAgen) * share) | 0
    const summaryLose = (customerWin + positiveBalance) | 0
    const deductionWind =
      ((summaryLose > 0 ? summaryLose : 0) + commissionAgen - windCredit) | 0
    const transferAmount =
      ((deductionWind > 0 ? deductionWind : 0) + transferBalance) | 0
    const customerLose = winAndLoseAgen < 0 ? customerWin : 0
    console.log(
      chalk.yellow(
        master,
        iterator[0],
        share,
        iterator[5],
        iterator[9],
        iterator[10],
        winAndLoseAgen > 0 ? customerWin : 0,
        lessCommission,
        customerLose,
        positiveBalance,
        transferBalance,
        summaryLose,
        userWind,
        windCredit,
        deductionWind,
        transferAmount,
        iterator[14]
      )
    )
    const income = new Income({
      master,
      usernameAG: iterator[0],
      online: iterator[5],
      share,
      commissionAgen: commissionAgen,
      lessCommission,
      winAndLoseAgen: winAndLoseAgen,
      customerWin: winAndLoseAgen > 0 ? customerWin : 0,
      customerLose: customerLose,
      positiveBalance: positiveBalance,
      summaryLose: summaryLose,
      windCredit: windCredit,
      deductionWind: deductionWind,
      userWind,
      hold,
      commission,
      pay,
      transferBalance: transferBalance,
      transferAmount: transferAmount,
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
    sumCustomerLose += customerLose
    summaryLoseMaster += summaryLose > 0 ? summaryLose : 0
  }
  const amountMaster =
    (windAndLossMaster +
      (0 -
        promotion +
        positiveMaster +
        (payFull ? -sumCustomerLose : -summaryLoseMaster))) |
    0
  await Income.updateMany(
    { master },
    {
      $set: {
        windAndLossMaster: windAndLossMaster,
        promotion: promotion,
        sumCustomerLose: sumCustomerLose,
        summaryLoseMaster: summaryLoseMaster,
        positiveMaster: positiveMaster,
        amountMaster: amountMaster,
        sumMaster: (amountMaster * shareMaster) | 0
      }
    }
  )
  if (pageIndex == total) {
    console.log('START EXPORT EXCEL')
    await startExport('20220228-20220306')
  }
  return
}

const formatNumber = item => Number(item.toString().replace(/,/g, ''))
