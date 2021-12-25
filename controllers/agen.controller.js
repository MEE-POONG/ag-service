const delay = require('delay')
const puppeteer = require('puppeteer');
require('dotenv').config()
const { createWorker } = require('tesseract.js')
const chalk = require('chalk')
const { agtrue, topAgenPass, sixAgenPass, adminUser, AgenPass } = process.env
const { unlinkSync } = require('fs')
const pm2 = require('pm2')
const Alliance = require('../models/alliance.model')
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
    const { usernameAG, webname } = req.body
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args
    })
    const page = await browser.newPage()
    try {
      const captchaPath = 'captcha' + '.png'
      let element

      await page.goto(agtrue + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath
      })

      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(webname === 'UFA-66' ? sixAgenPass : webname === 'TOP-168' ? topAgenPass : '')

      await delay(3000)

      await tesseractGet(captchaPath)
        .then(async result => {
          console.log("captchaPath", result)
          element = await page.$x(`//*[@id="txtCode"]`)
          await element[0].type(result)
        })
        .catch(function (err) {
          console.log(chalk.red(err))
        })
      // element = await page.$x(`//*[@id="btnSignIn"]`)
      // await element[0].click()

      const urls = page.url()
      console.log('Page URL : ' + urls)
      await delay(3000)

      await page.goto(agtrue + `/_SubAg1/MemberSet.aspx?`, {
        waitUntil: 'networkidle2'
      })
      await delay(1000)
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(`0`)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(`Aa123456+`)
      element = await page.$x(`//*[@  id="txtTotalLimit"]`)
      await element[0].type(`0`)
      //ปรับไม้
      //SPORTSBOOK
      element = await page.$x(`//*[@id="tbSports"]`)
      await element[0].click()
      element = await page.select("select#lstCommission", "0")
      element = await page.select("select#lstCommissionX12", "0")
      element = await page.select("select#lstCommissionPar", "0")
      element = await page.select("select#lstCommissionOther", "0")
      //GDG CASINO
      element = await page.$x(`//table[@onclick="toggleSetting('trRAM',this)"]`);
      await element[0].click();
      //ปรับเซอเซน 0
      element = await page.select("select#lstCommissionRAM", "0")
      //ปรับไม้ 6 ระดับ
      element = await page.$x(`//*[@id="optRAMProfile1"]`)
      await element[0].click()
      // element = await page.$x(`//*[@id="optRAMProfile2"]`)
      // await element[0].click()
      // element = await page.$x(`//*[@id="optRAMProfile3"]`)
      // await element[0].click()
      // element = await page.$x(`//*[@id="optRAMProfile4"]`)
      // await element[0].click()
      // element = await page.$x(`//*[@id="optRAMProfile5"]`)
      // await element[0].click()
      // element = await page.$x(`//*[@id="optRAMProfile6"]`)
      // await element[0].click()

      //SA GAMING 
      element = await page.$x(`//table[@onclick="toggleSetting('trRAR',this)"]`);
      await element[0].click();
      //ปรับเซอเซน 0
      element = await page.select("select#lstCommissionRAR", "0")
      //ปรับไม้ 6 ระดับ
      element = await page.$x(`//*[@id="optRARProfile1"]`)
      await element[0].click()
      // element = await page.$x(`//*[@id="optRARProfile2"]`)
      // await element[0].click()
      // element = await page.$x(`//*[@id="optRARProfile3"]`)
      // await element[0].click()
      // element = await page.$x(`//*[@id="optRARProfile4"]`)
      // await element[0].click()
      // element = await page.$x(`//*[@id="optRARProfile5"]`)
      // await element[0].click()
      // element = await page.$x(`//*[@id="optRARProfile6"]`)
      // await element[0].click()

      //  ITP (CQ9, PNG, BNG, GF, PTS, AUG, NS, HB, MPoker, MTPoker)
      element = await page.$x(`//table[@onclick="toggleSetting('trRAS',this)"]`);
      await element[0].click();

      //  ITP (UPG/MG)
      element = await page.$x(`//table[@onclick="toggleSetting('trRCV',this)"]`);
      await element[0].click();

      //  JOKER
      element = await page.$x(`//table[@onclick="toggleSetting('trRAU',this)"]`);
      await element[0].click();

      //GH CASINO / EB CASINO / BG
      element = await page.$x(`//table[@onclick="toggleSetting('trRBF',this)"]`);
      await element[0].click();
      //ปรับเซอเซน 0
      element = await page.select("select#lstCommissionRBF", "0")
      //ปรับไม้ 6 ระดับ
      element = await page.$x(`//*[@id="optRBFProfile1"]`)
      await element[0].click()

      //  AE7
      element = await page.$x(`//table[@onclick="toggleSetting('trRCZ',this)"]`);
      await element[0].click();

      //  GH COCKFT / HORSE RACING
      element = await page.$x(`//table[@onclick="toggleSetting('trRBG',this)"]`);
      await element[0].click();
      //ปรับเซอเซน 0
      element = await page.select("select#lstCommissionRBG", "0")
      //ปรับไม้ 6 ระดับ
      element = await page.$x(`//*[@id="optRBGProfile1"]`)
      await element[0].click()

      //  GH COCKFT / HORSE RACING
      element = await page.$x(`//table[@onclick="toggleSetting('trRBH',this)"]`);
      await element[0].click();

      //  SIAM LOTTO
      element = await page.$x(`//table[@onclick="toggleSetting('trRBI',this)"]`);
      await element[0].click();
      //ปรับไม้ 6 ระดับ
      element = await page.$x(`//*[@id="optRBIProfile1"]`)
      await element[0].click()

      //  UFA SLOT / UFA FISHING
      element = await page.$x(`//table[@onclick="toggleSetting('trRBL',this)"]`);
      await element[0].click();

      //  MUAY STEP
      element = await page.$x(`//table[@onclick="toggleSetting('trRBM',this)"]`);
      await element[0].click();
      //ปรับเซอเซน 0
      element = await page.select("select#lstCommissionRBM", "0")
      //ปรับไม้ 6 ระดับ
      element = await page.$x(`//*[@id="optRBMProfile1"]`)
      await element[0].click()

      //  VIRTUAL SPORTS
      element = await page.$x(`//table[@onclick="toggleSetting('trRBO',this)"]`);
      await element[0].click();
      //ปรับเซอเซน 0
      element = await page.select("select#lstCommissionRBO", "0")
      //ปรับไม้ 6 ระดับ
      element = await page.$x(`//*[@id="optRBOProfile1"]`)
      await element[0].click()

      //  UFA LOTTO - YEEKEE
      element = await page.$x(`//table[@onclick="toggleSetting('trRCW',this)"]`);
      await element[0].click();

      //  UFA THAI LOTTO / ASEAN LOTTO
      element = await page.$x(`//table[@onclick="toggleSetting('trRCX',this)"]`);
      await element[0].click();
      //ยืนยัน
      element = await page.$x(`//*[@id="btnSave"]`)
      await element[0].click()

      element = await page.waitForXPath(`//*[@id="lblStatus"]`);
      [element] = await page.$x(`//*[@id="lblStatus"]`);
      result = await page.evaluate(element => element.textContent, element);
      if (result === "Profile updated successfully.") {
        console.log('--- 514 ---');
        await page.close()
        await browser.close();
        apiResponse.successResponseWithData(res, 'Operation success สร้างสำเร็จ', {})
      } else {
        await page.close()
        await browser.close();
        apiResponse.ErrorResponse(res, 'Operation success สร้างผิดพลาด', {})
      }
    } catch (error) {
      await page.close() // Close the website
      await browser.close();
      apiResponse.ErrorResponse(res, 'Operation Error', {})
    }
  }
]
exports.aCoppyCustomer = [
  async (req, res) => {
    const { usernameAG, customerLatest, webname } = req.body
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 },
      args
    })
    const page = await browser.newPage()
    try {
      const captchaPath = 'captcha' + '.png'
      let element

      await page.goto(agtrue + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath
      })
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      // await element[0].type(AgenPass)
      await element[0].type(webname === 'UFA-66' ? sixAgenPass : webname === 'TOP-168' ? topAgenPass : '')
      console.log("usernameAG", usernameAG);
      console.log("txtPassword", usernameAG);
      await delay(3000)

      await tesseractGet(captchaPath)
        .then(async result => {
          console.log("captchaPath", result)
          element = await page.$x(`//*[@id="txtCode"]`)
          await element[0].type(result)
        })
        .catch(function (err) {
          console.log(chalk.red(err))
        })

      // element = await page.$x(`//*[@id="btnSignIn"]`)
      // await element[0].click()

      const urls = page.url()
      console.log('Page URL : ' + urls)

      await delay(3000)

      for (const [idx, data] of arrayAG.entries()) {
        setUserNumber = (+ customerLatest.substring() + idx).toString().padStart(customerLatest.length, '0')
        console.log("125 : ", setUserNumber);
        console.log(idx);
        console.log(setUserNumber.substr(-1, 1));
        await page.goto(agtrue + `/_SubAg1/MemberSet.aspx?cName=` + usernameAG + `0&set=1`, {
          waitUntil: 'networkidle2'
        })
        await delay(3000)

        element = await page.$x(`//*[@id="txtUserName"]`)
        await element[0].type(setUserNumber)
        element = await page.$x(`//*[@id="txtPassword"]`)
        await element[0].type(`Aa123456+`)
        element = await page.$x(`//*[@id="txtTotalLimit"]`)
        await element[0].type(`0`)
        element = await page.$x(`//*[@id="btnSave"]`)
        await element[0].click()
        await delay(1000)

        element = await page.waitForXPath(`//*[@id="lblStatus"]`);
        [element] = await page.$x(`//*[@id="lblStatus"]`);
        result = await page.evaluate(element => element.textContent, element);

        if (result !== "Profile updated successfully.") {
          console.log('--- 514 ---');
          await page.close()
          await browser.close();
          apiResponse.successResponseWithData(res, 'สร้างยูส ' + setUserNumber + ' faill สร้างไม่สำเร็จ', {})
        } else if (setUserNumber.substr(-1, 1) === 0 || idx === 9) {
          console.log("125 : ", setUserNumber);
          console.log(idx);
          console.log(setUserNumber.substr(-1, 1));
          console.log("เสร็จ");
          await page.close() // Close the website
          await browser.close();
          apiResponse.successResponseWithData(res, 'Operation success สำเร็จ 10 ยูส ' + usernameAG + setUserNumber, {})
        }
      }
      await page.close() // Close the website
      await browser.close();
      apiResponse.successResponseWithData(res, 'Operation success อาจมีข้อผิดพลาด ' + usernameAG + setUserNumber, {})
    } catch (error) {
      await page.close() // Close the website
      await browser.close();
      apiResponse.ErrorResponse(res, error)
    }
  }
]
exports.CreateCustomer = [
  async (req, res) => {
    const { usernameAG, customerLatest, webname } = req.body
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 },
      args
    })
    const page = await browser.newPage()
    try {
      const captchaPath = 'captcha' + '.png'
      let element

      await page.goto(agtrue + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath
      })
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      // await element[0].type(AgenPass)
      await element[0].type(webname === 'UFA-66' ? sixAgenPass : webname === 'TOP-168' ? topAgenPass : '')
      console.log("usernameAG", usernameAG);
      console.log("txtPassword", usernameAG);
      await delay(3000)

      await tesseractGet(captchaPath)
        .then(async result => {
          console.log("captchaPath", result)
          element = await page.$x(`//*[@id="txtCode"]`)
          await element[0].type(result)
        })
        .catch(function (err) {
          console.log(chalk.red(err))
        })

      // element = await page.$x(`//*[@id="btnSignIn"]`)
      // await element[0].click()

      const urls = page.url()
      console.log('Page URL : ' + urls)

      await delay(3000)

      for (const [idx, data] of arrayAG.entries()) {
        setUserNumber = (+ customerLatest.substring() + idx).toString().padStart(customerLatest.length, '0')
        console.log("125 : ", setUserNumber);
        console.log(idx);
        console.log(setUserNumber.substr(-1, 1));
        await page.goto(agtrue + `/_SubAg1/MemberSet.aspx?cName=` + usernameAG + `0&set=1`, {
          waitUntil: 'networkidle2'
        })
        await delay(3000)

        element = await page.$x(`//*[@id="txtUserName"]`)
        await element[0].type(setUserNumber)
        element = await page.$x(`//*[@id="txtPassword"]`)
        await element[0].type(`Aa123456+`)
        element = await page.$x(`//*[@id="txtTotalLimit"]`)
        await element[0].type(`0`)
        element = await page.$x(`//*[@id="btnSave"]`)
        await element[0].click()
        await delay(1000)

        element = await page.waitForXPath(`//*[@id="lblStatus"]`);
        [element] = await page.$x(`//*[@id="lblStatus"]`);
        result = await page.evaluate(element => element.textContent, element);

        if (result !== "Profile updated successfully.") {
          console.log('--- 514 ---');
          await page.close()
          await browser.close();
          apiResponse.successResponseWithData(res, 'สร้างยูส ' + setUserNumber + ' faill สร้างไม่สำเร็จ', {})
        } else if (setUserNumber.substr(-1, 1) === 0 || idx === 9) {
          console.log("125 : ", setUserNumber);
          console.log(idx);
          console.log(setUserNumber.substr(-1, 1));
          console.log("เสร็จ");
          await page.close() // Close the website
          await browser.close();
          apiResponse.successResponseWithData(res, 'Operation success สำเร็จ 10 ยูส ' + usernameAG + setUserNumber, {})
        }
      }
      await page.close() // Close the website
      await browser.close();
      apiResponse.successResponseWithData(res, 'Operation success อาจมีข้อผิดพลาด ' + usernameAG + setUserNumber, {})
    } catch (error) {
      await page.close() // Close the website
      await browser.close();
      apiResponse.ErrorResponse(res, error)
    }
  }
]