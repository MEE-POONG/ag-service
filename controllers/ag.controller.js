const delay = require('delay')
const puppeteer = require('puppeteer')
  ; +require('dotenv').config()
const { createWorker } = require('tesseract.js')
const worker = createWorker()
const chalk = require('chalk')
const { agenTopPass, agenSixPass, masterTopPass, masterSixPass } = process.env
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
async function tesseractGet(imagePath) {
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })
  const {
    data: { text }
  } = await worker.recognize(imagePath)
  await worker.terminate()
  return text
}

exports.agStoreCustomer = [

  async (req, res) => {

    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
        args
      })
      const page = await browser.newPage()
      const birthday = new Date();
      const date1 = birthday.getTime();
      const captchaPath = 'captcha' + '.png'
      let element

      await page.goto(
        `http://ag.ufa6666.com/Public/Default11.aspx`,
        { waitUntil: 'networkidle2' }
      )
      console.log(await page.title());
      console.log(page.url());
      console.log(chalk.red('ag in dName : ', date1));
      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      console.log("waitForSelector('#divImgCode > img'");
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      console.log("captcha = await page.$('#divImgCode > img'");

      await captcha.screenshot({
        path: captchaPath
      })
      console.log("captcha.screenshot");

      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      console.log("txtUserName");

      element = await page.$x(`//*[@id="txtPassword"]`)
      console.log("txtPassword");

      await element[0].type(
        webname === 'UFA-66'
          ? agenSixPass
          : webname === 'TOP-168'
            ? agenTopPass
            : ''
      )
      console.log("typePassword");

      await tesseractGet(captchaPath)
        .then(async result => {
          console.log("captchaPath", result)
          element = await page.$x(`//*[@id="txtCode"]`)
          await element[0].type(result)
        })
        .catch(function (err) {
          console.log(chalk.red(err))
        })

      await delay(5000)
      const title = await page.title()
      const urls = page.url()

      console.log('Page Title : ' + title)
      console.log('Page URL : ' + urls)

      for (const [idx, data] of arrayAG.entries()) {
        console.log(chalk.black.bold.bgYellow('ag in for : ', idx))
        console.log('countUser', countUser);
        console.log('customerLatest', customerLatest);
        setUserNumber = (+customerLatest.substring(countUser) + idx)
          .toString()
          .padStart(4, '0')
        console.log(
          chalk.black.bold.bgYellow(setUserNumber, ' : ', customerLatest)
        )
        await page.goto(`https://ag.ufa6666.com/_SubAg/MemberList.aspx`, {
          waitUntil: 'networkidle2'
        })
        await delay(1000)
        element = await page.$x(`//*[@id="MemberList_cm1_g_ctl02_btnCopy"]`)
        console.log(chalk.black.bold.bgYellow('79 : ', idx))
        await element[0].click()
        await delay(1000)
        element = await page.$x(`//*[@id="txtUserName"]`)
        await element[0].type(setUserNumber)
        console.log(chalk.black.bold.bgYellow('85 : ', idx))
        console.log(
          chalk.black.bold.bgYellow(
            'ag check username : ',
            idx,
            ' : ',
            setUserNumber
          )
        )
        element = await page.$x(`//*[@id="txtPassword"]`)
        await element[0].type(`Aa123456+`)
        element = await page.$x(`//*[@id="txtTotalLimit"]`)
        await element[0].type(`0`)
        element = await page.$x(`//*[@id="btnSave"]`)
        await element[0].click()
        console.log(chalk.white.bgGreen.bold('ag seve customer for : ', idx))
        await delay(1000)
      }
      await page.close() // Close the website
      apiResponse.successResponseWithData(res, 'Operation success', {})
      return pm2.restart('ag-service', (err, proc) => {
        // Disconnects from PM2
        pm2.disconnect()
      })
    } catch (error) {
      apiResponse.ErrorResponse(res, error)
      return pm2.restart('ag-service', (err, proc) => {
        // Disconnects from PM2
        pm2.disconnect()
      })
    }
  }
]
exports.agStoreCustomerTop = [

  async (req, res) => {

    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
        args
      })
      const page = await browser.newPage()
      const birthday = new Date();
      const date1 = birthday.getTime();
      const captchaPath = 'captcha' + '.png'
      let element

      await page.goto(
        `http://ag.ufa6666.com/Public/Default11.aspx`,
        { waitUntil: 'networkidle2' }
      )
      console.log(await page.title());
      console.log(page.url());
      console.log(chalk.red('ag in dName : ', date1));
      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      console.log("waitForSelector('#divImgCode > img'");
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      console.log("captcha = await page.$('#divImgCode > img'");

      await captcha.screenshot({
        path: captchaPath
      })
      console.log("captcha.screenshot");

      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      console.log("txtUserName");

      element = await page.$x(`//*[@id="txtPassword"]`)
      console.log("txtPassword");

      await element[0].type(
        webname === 'UFA-66'
          ? agenSixPass
          : webname === 'TOP-168'
            ? agenTopPass
            : ''
      )
      console.log("typePassword");

      await tesseractGet(captchaPath)
        .then(async result => {
          console.log("captchaPath", result)
          element = await page.$x(`//*[@id="txtCode"]`)
          await element[0].type(result)
        })
        .catch(function (err) {
          console.log(chalk.red(err))
        })

      await delay(5000)
      const title = await page.title()
      const urls = page.url()

      console.log('Page Title : ' + title)
      console.log('Page URL : ' + urls)

      for (const [idx, data] of arrayAG.entries()) {
        console.log(chalk.black.bold.bgYellow('ag in for : ', idx))
        console.log('countUser', countUser);
        console.log('customerLatest', customerLatest);
        setUserNumber = (+customerLatest.substring(countUser) + idx)
          .toString()
          .padStart(4, '0')
        console.log(
          chalk.black.bold.bgYellow(setUserNumber, ' : ', customerLatest)
        )
        await page.goto(`https://ag.ufa6666.com/_SubAg/MemberList.aspx`, {
          waitUntil: 'networkidle2'
        })
        await delay(1000)
        element = await page.$x(`//*[@id="MemberList_cm1_g_ctl02_btnCopy"]`)
        console.log(chalk.black.bold.bgYellow('79 : ', idx))
        await element[0].click()
        await delay(1000)
        element = await page.$x(`//*[@id="txtUserName"]`)
        await element[0].type(setUserNumber)
        console.log(chalk.black.bold.bgYellow('85 : ', idx))
        console.log(
          chalk.black.bold.bgYellow(
            'ag check username : ',
            idx,
            ' : ',
            setUserNumber
          )
        )
        element = await page.$x(`//*[@id="txtPassword"]`)
        await element[0].type(`Aa123456+`)
        element = await page.$x(`//*[@id="txtTotalLimit"]`)
        await element[0].type(`0`)
        element = await page.$x(`//*[@id="btnSave"]`)
        await element[0].click()
        console.log(chalk.white.bgGreen.bold('ag seve customer for : ', idx))
        await delay(1000)
      }
      await page.close() // Close the website
      apiResponse.successResponseWithData(res, 'Operation success', {})
      return pm2.restart('ag-service', (err, proc) => {
        // Disconnects from PM2
        pm2.disconnect()
      })
    } catch (error) {
      apiResponse.ErrorResponse(res, error)
      return pm2.restart('ag-service', (err, proc) => {
        // Disconnects from PM2
        pm2.disconnect()
      })
    }
  }
]
exports.agStoreAgen = [
  async (req, res) => {
    try {
      const { _id, usernameAG, status, webname, countUser, customerLatest } = req.body
      let userNewSet = usernameAG + "a0"
      const alliance = await Alliance.aggregate([
        { $match: { adviserID: _id } }
      ]).sort({ usernameAG: -1 }).limit(1);
      if (alliance.length > 0) {
        if (alliance[0].usernameAG.substr(-1) == 9) {
          userNewSet = await usernameAG + String.fromCharCode(usernameAG, alliance[0].usernameAG.substr(-2, 1).charCodeAt(0) + 1) + "0"
          console.log(alliance[0].usernameAG, " : ", userNewSet);
        } else {
          userNewSet = await alliance[0].usernameAG.substring(0, alliance[0].usernameAG.length - 1) + Number(alliance[0].usernameAG.substr(-1) + 1)
          console.log(alliance[0].usernameAG, " : ", userNewSet);
        }
      }

      const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
        args
      })
      const page = await browser.newPage()
      const birthday = new Date();
      const date1 = birthday.getTime();
      const captchaPath = 'captcha' + '.png'
      let element

      await page.goto(
        `http://ag.ufa6666.com/Public/Default11.aspx`,
        { waitUntil: 'networkidle2' }
      )
      console.log(await page.title());
      console.log(page.url());
      console.log(chalk.red('ag in dName : ', date1));
      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      console.log("waitForSelector('#divImgCode > img'");
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      console.log("captcha = await page.$('#divImgCode > img'");

      await captcha.screenshot({
        path: captchaPath
      })
      console.log("captcha.screenshot");

      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      console.log("txtUserName");

      element = await page.$x(`//*[@id="txtPassword"]`)
      console.log("txtPassword");

      await element[0].type(
        webname === 'UFA-66'
          ? masterSixPass
          : webname === 'TOP-168'
            ? masterTopPass
            : ''
      )
      console.log("typePassword");

      await tesseractGet(captchaPath)
        .then(async result => {
          console.log("captchaPath", result)
          element = await page.$x(`//*[@id="txtCode"]`)
          await element[0].type(result)
        })
        .catch(function (err) {
          console.log(chalk.red(err))
        })

      await delay(5000)
      const title = await page.title()
      const urls = page.url()

      console.log('Page Title : ' + title)
      console.log('Page URL : ' + urls)
      console.log(alliance);

      await page.goto(`https://ag.ufa6666.com/_Age/AgentList.aspx`, {
        waitUntil: 'networkidle2'
      })
      element = await page.$x(`//*[@id="MemberList_cm1_g_ctl02_btnCopy"]`)
      await element[0].click()
      await delay(1000)
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(userNewSet)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(`Aa123456+`)
      element = await page.$x(`//*[@id="txtTotalLimit"]`)
      await element[0].type(`0`)
      //   element = await page.$x(`//*[@id="btnSave2"]`)
      //   await element[0].click()

      // apiResponse.successResponseWithData(res, 'Operation success', {})
      // return pm2.restart('ag-service', (err, proc) => {
      //   // Disconnects from PM2
      //   pm2.disconnect()
      // })
    } catch (error) {
      return apiResponse.ErrorResponse(res, error)
    }

  }
]
exports.agMoneyAllince = [
  async (req, res) => {
    try {
      const { adviserID, usernameAG, status, webname, moneyAdd } = req.body;
      console.log(1000);
      const alliance = await Alliance.findById(adviserID);
      let seniorPass = "168Ufavip168++"
      let passAg
      let sumAdd
      let moneyOld
      
      if (alliance.status === 'senior') {
        passAg = await seniorPass;
      } else if (alliance.status === 'master') {
        console.log(alliance.webname);
        passAg = await alliance.webname === 'UFA-66' ? masterSixPass : masterTopPass
      } else {
        return apiResponse.ErrorResponse(res, error)
      }
      console.log("passAg : ", passAg);
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1600, height: 1080 },
        args
      })
      const page = await browser.newPage()
      const birthday = new Date();
      const date1 = birthday.getTime();
      const captchaPath = 'captcha' + '.png'
      let element

      await page.goto(
        `http://ag.ufa6666.com/Public/Default11.aspx`,
        { waitUntil: 'networkidle2' }
      )
      console.log(await page.title());
      console.log(page.url());
      console.log(chalk.red('ag in dName : ', date1));
      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      console.log("waitForSelector('#divImgCode > img'");
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      console.log("captcha = await page.$('#divImgCode > img'");

      await captcha.screenshot({
        path: captchaPath
      })
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(alliance.usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(passAg);

      await tesseractGet(captchaPath)
        .then(async result => {
          console.log("captchaPath", result)
          element = await page.$x(`//*[@id="txtCode"]`)
          await element[0].type(result)
        })
        .catch(function (err) {
          console.log(chalk.red(err))
        })
      await delay(1000)
      const title = await page.title()
      const urls = page.url()
      console.log('Page Title : ' + title)
      console.log('Page URL : ' + urls)
      // ค้นหา
      if (status === "master") {
        console.log('480 : ', usernameAG)
        await page.goto(urls.replace('/Main.aspx?lang=EN-US', '1/MasterSet.aspx?userName=' + usernameAG + '&set=1'), {
          waitUntil: 'networkidle2'
        })
      } else if (status === "agen") {
        console.log('485')
        await page.goto(urls.replace('/Main.aspx?lang=EN-US', '1/AgentSet.aspx?userName=' + usernameAG + '&set=1'), {
          waitUntil: 'networkidle2'
        })
      } else {
        return apiResponse.ErrorResponse(res, error)
      }
      await delay(100)
      await page.waitForXPath(`//*[@id="txtTotalLimit"]`);
      [elements] = await page.$x(`//*[@id="txtTotalLimit"]`);
      result = await page.evaluate(element => element.value, elements);
      moneyOld = Number(result.toString().replace(',', ''));
      console.log("moneyAdd :", +moneyAdd);
      console.log("moneyOld :", moneyOld);
      moneyOld += +moneyAdd
      console.log(moneyOld);
      sumAdd = moneyOld.toString()
      await delay(100);
      element = await page.$x(`//*[@id="txtTotalLimit"]`);
      await element[0].click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await element[0].type(sumAdd);
      element = await page.$x(`//*[@id="btnUpdateC"]`)
      await element[0].click()
      await delay(100);
      await page.waitForXPath(`//*[@id="lblStatus"]`);
      [element] = await page.$x(`//*[@id="lblStatus"]`);

      console.log('--- 11 ---');
      result = await page.evaluate(element => element.textContent, element);
      if (result === "Profile updated successfully.") {
        apiResponse.successResponseWithData(res, 'Operation success', {})
        return pm2.restart('ag-service', (err, proc) => {
          pm2.disconnect()
        })
      } else {
        console.log('error', data);
        await browser.close();
      }

    } catch (error) {
      console.log(error);
      return apiResponse.ErrorResponse(res, error)
    }

  }
]
exports.agDownAgen = [

  async (req, res) => {

    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 }, args });
      const page = await browser.newPage();
      const captchaPath = 'captcha' + '.png';
      let element, formElement, tabs;

      await page.goto(`http://ag.ufa6666.com/Public/Default11.aspx?lang=EN-US`, { waitUntil: 'networkidle2' });
      await page.waitForSelector("#divImgCode > img"); // Method to ensure that the element is loaded
      const captcha = await page.$("#divImgCode > img"); // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath,
      });

      element = await page.$x(`//*[@id="txtUserName"]`);
      await element[0].type(usernameAG);
      element = await page.$x(`//*[@id="txtPassword"]`);
      await element[0].type(webname === "UFA-66" ? agenSixPass : webname === "TOP-168" ? agenTopPass : "");
      await tesseractGet(captchaPath)
        .then(async (result) => {
          console.log(result);
          element = await page.$x(`//*[@id="txtCode"]`);
          await element[0].type(result);
        })
        .catch(function (err) {
          console.log(chalk.red(err));
        });

      await delay(5000);
      const title = await page.title();
      const urls = await page.url();

      console.log("Page Title : " + title);
      console.log("Page URL : " + urls);

      for (const [idx, data] of arrayAG.entries()) {



        console.log(chalk.black.bold.bgYellow("ag in for : ", idx))
        setUserNumber = (+customerLatest.substring(countUser) + idx)
          .toString()
          .padStart(4, '0')
        console.log(chalk.black.bold.bgYellow(setUserNumber, " : ", customerLatest));
        await page.goto(`https://ag.ufa6666.com/_SubAg/MemberList.aspx`, { waitUntil: 'networkidle2' });
        element = await page.$x(`//*[@id="MemberList_cm1_g_ctl02_btnCopy"]`);
        console.log(chalk.black.bold.bgYellow("79 : ", idx));
        await element[0].click();
        console.log(chalk.black.bold.bgYellow("81 : ", idx));
        await delay(1000);
        element = await page.$x(`//*[@id="txtUserName"]`);
        await element[0].type(setUserNumber);
        console.log(chalk.black.bold.bgYellow("85 : ", idx));
        console.log(chalk.black.bold.bgYellow("ag check username : ", idx, " : ", setUserNumber));
        element = await page.$x(`//*[@id="txtPassword"]`);
        await element[0].type(`Aa123456+`);
        element = await page.$x(`//*[@id="txtTotalLimit"]`);
        await element[0].type(`0`);
        element = await page.$x(`//*[@id="btnSave"]`);
        await element[0].click();
        console.log(chalk.white.bgGreen.bold("ag seve customer for : ", idx));
        await delay(1000);

      }
      await page.close(); // Close the website
      return apiResponse.successResponseWithData(res, 'Operation success', {})

    } catch (error) {
      return apiResponse.ErrorResponse(res, error)
    }

  }
]
exports.agSetPassAllince = [

  async (req, res) => {

    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 }, args });
      const page = await browser.newPage();
      const captchaPath = 'captcha' + '.png';
      let element, formElement, tabs;

      await page.goto(`http://ag.ufa6666.com/Public/Default11.aspx?lang=EN-US`, { waitUntil: 'networkidle2' });
      await page.waitForSelector("#divImgCode > img"); // Method to ensure that the element is loaded
      const captcha = await page.$("#divImgCode > img"); // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath,
      });

      element = await page.$x(`//*[@id="txtUserName"]`);
      await element[0].type(usernameAG);
      element = await page.$x(`//*[@id="txtPassword"]`);
      await element[0].type(webname === "UFA-66" ? agenSixPass : webname === "TOP-168" ? agenTopPass : "");
      await tesseractGet(captchaPath)
        .then(async (result) => {
          console.log(result);
          element = await page.$x(`//*[@id="txtCode"]`);
          await element[0].type(result);
        })
        .catch(function (err) {
          console.log(chalk.red(err));
        });

      await delay(5000);
      const title = await page.title();
      const urls = await page.url();

      console.log("Page Title : " + title);
      console.log("Page URL : " + urls);

      for (const [idx, data] of arrayAG.entries()) {



        console.log(chalk.black.bold.bgYellow("ag in for : ", idx))
        setUserNumber = (+customerLatest.substring(countUser) + idx)
          .toString()
          .padStart(4, '0')
        console.log(chalk.black.bold.bgYellow(setUserNumber, " : ", customerLatest));
        await page.goto(`https://ag.ufa6666.com/_SubAg/MemberList.aspx`, { waitUntil: 'networkidle2' });
        element = await page.$x(`//*[@id="MemberList_cm1_g_ctl02_btnCopy"]`);
        console.log(chalk.black.bold.bgYellow("79 : ", idx));
        await element[0].click();
        console.log(chalk.black.bold.bgYellow("81 : ", idx));
        await delay(1000);
        element = await page.$x(`//*[@id="txtUserName"]`);
        await element[0].type(setUserNumber);
        console.log(chalk.black.bold.bgYellow("85 : ", idx));
        console.log(chalk.black.bold.bgYellow("ag check username : ", idx, " : ", setUserNumber));
        element = await page.$x(`//*[@id="txtPassword"]`);
        await element[0].type(`Aa123456+`);
        element = await page.$x(`//*[@id="txtTotalLimit"]`);
        await element[0].type(`0`);
        element = await page.$x(`//*[@id="btnSave"]`);
        await element[0].click();
        console.log(chalk.white.bgGreen.bold("ag seve customer for : ", idx));
        await delay(1000);

      }
      await page.close(); // Close the website
      return apiResponse.successResponseWithData(res, 'Operation success', {})

    } catch (error) {
      return apiResponse.ErrorResponse(res, error)
    }

  }
]
exports.agSetAgenAndPass = [

  async (req, res) => {

    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 }, args });
      const page = await browser.newPage();
      const captchaPath = 'captcha' + '.png';
      let element, formElement, tabs;

      await page.goto(`http://ag.ufa6666.com/Public/Default11.aspx?lang=EN-US`, { waitUntil: 'networkidle2' });
      await page.waitForSelector("#divImgCode > img"); // Method to ensure that the element is loaded
      const captcha = await page.$("#divImgCode > img"); // captcha is the element you want to capture
      await captcha.screenshot({
        path: captchaPath,
      });

      element = await page.$x(`//*[@id="txtUserName"]`);
      await element[0].type(usernameAG);
      element = await page.$x(`//*[@id="txtPassword"]`);
      await element[0].type(webname === "UFA-66" ? agenSixPass : webname === "TOP-168" ? agenTopPass : "");
      await tesseractGet(captchaPath)
        .then(async (result) => {
          console.log(result);
          element = await page.$x(`//*[@id="txtCode"]`);
          await element[0].type(result);
        })
        .catch(function (err) {
          console.log(chalk.red(err));
        });

      await delay(5000);
      const title = await page.title();
      const urls = await page.url();

      console.log("Page Title : " + title);
      console.log("Page URL : " + urls);

      for (const [idx, data] of arrayAG.entries()) {
        console.log(chalk.black.bold.bgYellow("ag in for : ", idx))
        setUserNumber = (+customerLatest.substring(countUser) + idx)
          .toString()
          .padStart(4, '0')
        console.log(chalk.black.bold.bgYellow(setUserNumber, " : ", customerLatest));
        await page.goto(`https://ag.ufa6666.com/_SubAg/MemberList.aspx`, { waitUntil: 'networkidle2' });
        element = await page.$x(`//*[@id="MemberList_cm1_g_ctl02_btnCopy"]`);
        console.log(chalk.black.bold.bgYellow("79 : ", idx));
        await element[0].click();
        console.log(chalk.black.bold.bgYellow("81 : ", idx));
        await delay(1000);
        element = await page.$x(`//*[@id="txtUserName"]`);
        await element[0].type(setUserNumber);
        console.log(chalk.black.bold.bgYellow("85 : ", idx));
        console.log(chalk.black.bold.bgYellow("ag check username : ", idx, " : ", setUserNumber));
        element = await page.$x(`//*[@id="txtPassword"]`);
        await element[0].type(`Aa123456+`);
        element = await page.$x(`//*[@id="txtTotalLimit"]`);
        await element[0].type(`0`);
        element = await page.$x(`//*[@id="btnSave"]`);
        await element[0].click();
        console.log(chalk.white.bgGreen.bold("ag seve customer for : ", idx));
        await delay(1000);

      }
      await page.close(); // Close the website
      return apiResponse.successResponseWithData(res, 'Operation success', {})

    } catch (error) {
      return apiResponse.ErrorResponse(res, error)
    }

  }
]
      // set Game
      // console.log("Ball");
      // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[10]/td/table/tbody/tr[1]/td/table`);
      // await element[0].click();
      // console.log("GDG CASINO");
      // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[12]/td/table/tbody/tr[1]/td/table`);
      // await element[0].click();
      // console.log("SA GAMING");
      // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[14]/td/table/tbody/tr[1]/td/table`);
      // await element[0].click();
      // console.log("ITP (AE, CQ9, PNG, BNG, GF, APIU)");
      // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[16]/td/table/tbody/tr[1]/td/table`);
      // await element[0].click();
      // console.log("ITP (UPG/MG)");
      // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[18]/td/table/tbody/tr[1]/td/table`);
      // await element[0].click();
      // console.log("JOKER");
      // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[20]/td/table/tbody/tr[1]/td/table`);
      // await element[0].click();
      // console.log("GDG GH CASINO / EB CASINO");
      // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[22]/td/table/tbody/tr[1]/td/table`);
      // await element[0].click();
      // console.log("GH COCKFT");
      // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[24]/td/table/tbody/tr[1]/td/table`);
      // await element[0].click();
      // console.log("GDG CASINO");
      // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[12]/td/table/tbody/tr[1]/td/table`);
      // await element[0].click();
      // console.log("GDG CASINO");
      // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[12]/td/table/tbody/tr[1]/td/table`);
      // await element[0].click();
      // lstCommissionRAR
      // lstCommissionRBF
      // lstCommissionRBG
      // lstCommissionRBM
      // for (const [idx, data] of arrayAG.entries()) {
      //   console.log(chalk.black.bold.bgYellow('ag in for : ', idx))
      //   console.log('countUser', countUser);
      //   console.log('customerLatest', customerLatest);
      //   setUserNumber = (+customerLatest.substring(countUser) + idx)
      //     .toString()
      //     .padStart(4, '0')
      //   console.log(
      //     chalk.black.bold.bgYellow(setUserNumber, ' : ', customerLatest)
      //   )
      //   await page.goto(`https://ag.ufa6666.com/_SubAg/MemberList.aspx`, {
      //     waitUntil: 'networkidle2'
      //   })
      //   await delay(1000)
      //   element = await page.$x(`//*[@id="MemberList_cm1_g_ctl02_btnCopy"]`)
      //   console.log(chalk.black.bold.bgYellow('79 : ', idx))
      //   await element[0].click()
      //   await delay(1000)
      //   element = await page.$x(`//*[@id="txtUserName"]`)
      //   await element[0].type(setUserNumber)
      //   console.log(chalk.black.bold.bgYellow('85 : ', idx))
      //   console.log(
      //     chalk.black.bold.bgYellow(
      //       'ag check username : ',
      //       idx,
      //       ' : ',
      //       setUserNumber
      //     )
      //   )
      //   element = await page.$x(`//*[@id="txtPassword"]`)
      //   await element[0].type(`Aa123456+`)
      //   element = await page.$x(`//*[@id="txtTotalLimit"]`)
      //   await element[0].type(`0`)
      //   element = await page.$x(`//*[@id="btnSave"]`)
      //   await element[0].click()
      //   console.log(chalk.white.bgGreen.bold('ag seve customer for : ', idx))
      //   await delay(1000)
      // }
      // await page.close() // Close the website

      // apiResponse.successResponseWithData(res, 'Operation success', {})
      // return pm2.restart('ag-service', (err, proc) => {
      //   // Disconnects from PM2
      //   pm2.disconnect()
      // })