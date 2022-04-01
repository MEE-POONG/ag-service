require('dotenv').config()

const { startExport } = require('./income_UFA66_export')
const { credit_wind_UFA66 } = require('./credit_wind_UFA66')

const delay = require('delay')
const { Poseidon99, UFA66, TOP168 } = require('../dataWeb')
const _ = require('lodash')
const chalk = require('chalk')
const Income = require('../models/income.model')
const AgInformation = require('../models/agInformation.model')
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

// const from = '07/03/2022'
// const to = '13/03/2022'

const fetchWinLose = async (
  from,
  to,
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
      `&from=${from} &to=${to}&userID=` +
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
    const { share, positiveBalance, transferBalance, userWind } = UFA66.find(
      ({ username }) => iterator[0] === username
    )
    const creditWind = await creditWindModel.findOne({ userWind })
    const windCreditCal = Number(
      ((creditWind && creditWind.winAndLoseCompany) || 0)
        .toString()
        .replace(/,/g, '')
    )
    const windCredit =
      windCreditCal < 0 ? Math.floor(windCreditCal) : Math.ceil(windCreditCal)

    const commissionAgen = Number(iterator[9].toString().replace(/,/g, '')) | 0
    const winAndLoseAgen = Number(iterator[10].toString().replace(/,/g, '')) | 0
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
    const agInformation = new AgInformation({
      N1: iterator[0],
      N2: iterator[1],
      N3: iterator[2],
      N4: iterator[3],
      N5: iterator[4],
      N6: iterator[5],
      N7: iterator[6],
      N8: iterator[7],
      N9: iterator[8],
      N10: iterator[9],
      N11: iterator[10],
      N12: iterator[11],
      N13: iterator[12],
      N14: iterator[13],
      N15: iterator[14],
      N16: iterator[15],
      N17: iterator[16],
      N18: iterator[17],
      N19: iterator[18],
    })
    await agInformation.save()
    const income = new Income({
      master,
      usernameAG: iterator[0],
      online: iterator[5],
      share,
      commissionAgen: commissionAgen,
      winAndLoseAgen: winAndLoseAgen,
      customerWin: winAndLoseAgen > 0 ? customerWin : 0,
      customerLose: customerLose,
      positiveBalance: positiveBalance,
      summaryLose: summaryLose,
      windCredit: windCredit,
      deductionWind: deductionWind,
      userWind,
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
    await startExport(from + '-' + to)
  }
  return
}

const formatNumber = item => Number(item.toString().replace(/,/g, ''))

exports.income_UFA66 = async (from, to) => {
  await credit_wind_UFA66(from, to)
  const browser = await puppeteer.launch({
    headless: true,
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
  const masterUFA66 = _.uniqBy(UFA66, 'master')

  const remove = await Income.remove({})
  console.log(remove)
  const removeAG = await AgInformation.remove({})
  console.log(removeAG)

  for (const iterator of masterUFA66) {
    await fetchWinLose(
      from,
      to,
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
}
