const delay = require('delay')
const puppeteer = require('puppeteer')
  ; +require('dotenv').config()
const { createWorker } = require('tesseract.js')
const chalk = require('chalk')
const { AgenPass, agtest, agture } = process.env
const { unlinkSync } = require('fs')
const pm2 = require('pm2')
const arrayAG = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
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
];

var apiResponse = require('../helpers/apiResponse');
const e = require('cors');
const { check } = require('express-validator');
async function tesseractGet(imagePath) {
  const worker = createWorker()
  console.log(1)
  await worker.load()
  console.log(2)
  await worker.loadLanguage('eng')
  console.log(3)
  await worker.initialize('eng')
  console.log(4)
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })
  console.log(5)
  const {
    data: { text }
  } = await worker.recognize(imagePath)
  await worker.terminate()
  return text
}

exports.aCreateCustomer = [
  async (req, res) => {
    const { AgenPass, agtest, agture } = req.body
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args
    })
    const page = await browser.newPage()
    try {
      const birthday = new Date();
      const date1 = birthday.getTime();
      const captchaPath = 'captcha' + '.png'
      let checkZero = customerLatest.length - countUser
      console.log("checkZero ", checkZero);
      let element

      await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })
      
      // console.log(await page.title());
      // console.log(page.url());
      // console.log(chalk.red('ag in dName : ', date1));
      // await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      // console.log("waitForSelector('#divImgCode > img'");
      // const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      // console.log("captcha = await page.$('#divImgCode > img'");
      // await captcha.screenshot({
      //   path: captchaPath
      // })
      // element = await page.$x(`//*[@id="txtUserName"]`)
      // await element[0].type(usernameAG)
      // element = await page.$x(`//*[@id="txtPassword"]`)
      // await element[0].type(passAgen)
      // await tesseractGet(captchaPath)
      //   .then(async result => {
      //     console.log("captchaPath", result)
      //     element = await page.$x(`//*[@id="txtCode"]`)
      //     await element[0].type(result)
      //   })
      //   .catch(function (err) {
      //     console.log(chalk.red(err))
      //   })
      // await delay(5000)
      // const title = await page.title()
      // const urls = page.url()
      // console.log('Page Title : ' + title)
      // console.log('Page URL : ' + urls)
      // for (const [idx, data] of arrayAG.entries()) {
      //   setUserNumber = (+customerLatest.substring(countUser) + idx).toString().padStart(checkZero, '0')
      //   await page.goto(`https://ag.ufa6666.com/_SubAg1/MemberSet.aspx?cName=` + usernameAG + userCopy + `&set=1`, {
      //     waitUntil: 'networkidle2'
      //   })
      //   element = await page.$x(`//*[@id="txtUserName"]`)
      //   await element[0].type(setUserNumber)
      //   console.log(chalk.black.bold.bgYellow('85 : ', idx))
      //   await element[0].type(`Aa123456+`)
      //   element = await page.$x(`//*[@id="txtTotalLimit"]`)
      //   await element[0].type(`0`)
      //   element = await page.$x(`//*[@id="btnSave"]`)
      //   await element[0].click()
      //   console.log(chalk.white.bgGreen.bold('ag seve customer for : ', idx))
      //   await delay(1000)
      // }
      // await page.close() // Close the website
      // await browser.close();
      // apiResponse.successResponseWithData(res, 'Operation success', {})
    } catch (error) {
      browser.close()
      apiResponse.ErrorResponse(res, error)
    }
  }
]
