const delay = require('delay')
const puppeteer = require('puppeteer')
  ; +require('dotenv').config()
const { createWorker } = require('tesseract.js')
const chalk = require('chalk')
const { agtest, topMasterPass, seniorPass, sixMasterPass, adminUser, MasterPass } = process.env
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
exports.CreateMaster = [
  async (req, res) => {
    const { usernameAG, webname } = req.body
    const ag = agtest
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args
    })
    const page = await browser.newPage()
    try {
      console.log("85 CreateMaster");
      const captchaPath = 'captcha' + '.png'
      let element
      console.log("88 ag : " + ag);
      await page.goto(ag + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      // await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      // const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      // await captcha.screenshot({
      //   path: captchaPath
      // })

      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(seniorPass)

      await delay(3000)

      // await tesseractGet(captchaPath)
      //   .then(async result => {
      //     console.log("captchaPath", result)
      //     element = await page.$x(`//*[@id="txtCode"]`)
      //     await element[0].type(result)
      //   })
      //   .catch(function (err) {
      //     console.log(chalk.red(err))
      //   })
      element = await page.$x(`//*[@id="btnSignIn"]`)
      await element[0].click()

      const urls = page.url()
      console.log('Page URL : ' + urls)
      await delay(3000)

      await page.goto(ag + `/_SubAg1/MemberSet.aspx?`, {
        waitUntil: 'networkidle2'
      })
      await delay(1000)
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(`0`)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(`Aa123456+`)
      element = await page.$x(`//*[@  id="txtTotalLimit"]`)
      await element[0].type(`0`)

      //ยืนยัน
      element = await page.$x(`//*[@id="btnSave"]`)
      await element[0].click()

      element = await page.waitForXPath(`//*[@id="lblStatus"]`);
      [element] = await page.$x(`//*[@id="lblStatus"]`);
      result = await page.evaluate(element => element.textContent, element);
      // if (result === "Profile updated successfully.") {
      //   console.log('--- 514 ---');
      //   await page.close()
      //   await browser.close();
      //   apiResponse.successResponseWithData(res, 'Operation success สร้างสำเร็จ', {})
      // } else {
      //   await page.close()
      //   await browser.close();
      //   apiResponse.ErrorResponse(res, 'Operation success สร้างผิดพลาด', {})
      // }
    } catch (error) {
      // await page.close() // Close the website
      // await browser.close();
      apiResponse.ErrorResponse(res, 'Operation Error', {})
    }
  }
]
exports.CoppyMaster = [
  async (req, res) => {
    const { _id, webname } = req.body
    const ag = agtest
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args
    })
    const page = await browser.newPage()
    try {
      console.log("85 CoppyMaster");
      console.log("85 CoppyMaster : ", _id);

      // const alliance = await Alliance.aggregate([
      //   { $match: { adviserID: _id } }
      // ]).sort().limit(1);
      console.log("171 alliance : ", alliance);
      // if (alliance.length > 0) {
      //   if (alliance[0].usernameAG.substr(-1) == 9) {
      //     userNewSet = await usernameAG + String.fromCharCode(usernameAG, alliance[0].usernameAG.substr(-2, 1).charCodeAt(0) + 1) + "0"
      //     console.log(alliance[0].usernameAG, " : ", userNewSet);
      //   } else {
      //     userNewSet = await alliance[0].usernameAG.substring(0, alliance[0].usernameAG.length - 1) + Number(alliance[0].usernameAG.substr(-1) + 1)
      //     console.log(alliance[0].usernameAG, " : ", userNewSet);
      //   }
      // }



      const captchaPath = 'captcha' + '.png'
      let element
      console.log("88 ag : " + ag);
      await page.goto(ag + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      // await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      // const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      // await captcha.screenshot({
      //   path: captchaPath
      // })

      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(seniorPass)

      await delay(3000)

      // await tesseractGet(captchaPath)
      //   .then(async result => {
      //     console.log("captchaPath", result)
      //     element = await page.$x(`//*[@id="txtCode"]`)
      //     await element[0].type(result)
      //   })
      //   .catch(function (err) {
      //     console.log(chalk.red(err))
      //   })
      element = await page.$x(`//*[@id="btnSignIn"]`)
      await element[0].click()

      const urls = page.url()
      console.log('Page URL : ' + urls)
      await delay(3000)

      await page.goto(ag + `/_Part1/MasterSet.aspx?cName=` + usernameAG + `0&set=1`, {
        waitUntil: 'networkidle2'
      })
      await delay(1000)
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(``)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(`Aa123456+`)
      element = await page.$x(`//*[@  id="txtTotalLimit"]`)
      await element[0].type(`0`)

      //ยืนยัน
      element = await page.$x(`//*[@id="btnSave"]`)
      await element[0].click()

      element = await page.waitForXPath(`//*[@id="lblStatus"]`);
      [element] = await page.$x(`//*[@id="lblStatus"]`);
      result = await page.evaluate(element => element.textContent, element);
      // if (result === "Profile updated successfully.") {
      //   console.log('--- 514 ---');
      //   await page.close()
      //   await browser.close();
      //   apiResponse.successResponseWithData(res, 'Operation success สร้างสำเร็จ', {})
      // } else {
      //   await page.close()
      //   await browser.close();
      //   apiResponse.ErrorResponse(res, 'Operation success สร้างผิดพลาด', {})
      // }
    } catch (error) {
      // await page.close() // Close the website
      // await browser.close();
      apiResponse.ErrorResponse(res, 'Operation Error', {})
    }
  }
]
exports.BetLevelMaster = [
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

      await page.goto(ag + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath
      })
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      // await element[0].type(MasterPass)
      await element[0].type(webname === 'UFA-66' ? sixMasterPass : webname === 'TOP-168' ? topMasterPass : '')
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
        await page.goto(ag + `/_SubAg1/MemberSet.aspx?cName=` + usernameAG + `0&set=1`, {
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
exports.CheckCreditMaster = [
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

      await page.goto(ag + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath
      })
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      // await element[0].type(MasterPass)
      await element[0].type(webname === 'UFA-66' ? sixMasterPass : webname === 'TOP-168' ? topMasterPass : '')
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
        await page.goto(ag + `/_SubAg1/MemberSet.aspx?cName=` + usernameAG + `0&set=1`, {
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
exports.UpCreditMaster = [
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

      await page.goto(ag + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath
      })
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      // await element[0].type(MasterPass)
      await element[0].type(webname === 'UFA-66' ? sixMasterPass : webname === 'TOP-168' ? topMasterPass : '')
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
        await page.goto(ag + `/_SubAg1/MemberSet.aspx?cName=` + usernameAG + `0&set=1`, {
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
exports.TransferMaster = [
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

      await page.goto(ag + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath
      })
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      // await element[0].type(MasterPass)
      await element[0].type(webname === 'UFA-66' ? sixMasterPass : webname === 'TOP-168' ? topMasterPass : '')
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
        await page.goto(ag + `/_SubAg1/MemberSet.aspx?cName=` + usernameAG + `0&set=1`, {
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
exports.RePassMaster = [
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

      await page.goto(ag + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath
      })
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      // await element[0].type(MasterPass)
      await element[0].type(webname === 'UFA-66' ? sixMasterPass : webname === 'TOP-168' ? topMasterPass : '')
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
        await page.goto(ag + `/_SubAg1/MemberSet.aspx?cName=` + usernameAG + `0&set=1`, {
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
exports.LockMaster = [
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

      await page.goto(ag + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath
      })
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      // await element[0].type(MasterPass)
      await element[0].type(webname === 'UFA-66' ? sixMasterPass : webname === 'TOP-168' ? topMasterPass : '')
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
        await page.goto(ag + `/_SubAg1/MemberSet.aspx?cName=` + usernameAG + `0&set=1`, {
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
