const delay = require('delay')
const puppeteer = require('puppeteer')
  ; +require('dotenv').config()
const { createWorker } = require('tesseract.js')
const worker = createWorker()
const chalk = require('chalk')
const { agenTopPass, agenSixPass } = process.env
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

var apiResponse = require('../helpers/apiResponse')
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
      const captchaPath = 'captcha' + '.png'
      let element

      await page.goto(
        `http://ag.ufa6666.com/Public/Default11.aspx`,
        { waitUntil: 'networkidle2' }
      )
      console.log(await page.title());
      console.log(page.url());
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
          console.log(result)
          element = await page.$x(`//*[@id="txtCode"]`)
          await element[0].type(result)
        })
        .catch(function (err) {
          console.log(chalk.red(err))
        })

      await delay(5000)
      const title = await page.title()
      const urls = await page.url()

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
        element = await page.$x(`//*[@id="MemberList_cm1_g_ctl02_btnCopy"]`)
        console.log(chalk.black.bold.bgYellow('79 : ', idx))
        await element[0].click()
        console.log(chalk.black.bold.bgYellow('81 : ', idx))
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
      return apiResponse.ErrorResponse(res, error)
    }
  }
]
exports.agStoreAgen = [

  async (req, res) => {
    
    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args });
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
exports.agStoreMaster = [

  async (req, res) => {
    
    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args });
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
exports.agAgenMoney = [

  async (req, res) => {
    
    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args });
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
exports.agMasterMoney = [

  async (req, res) => {
    
    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args });
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
exports.agDownAgen = [

  async (req, res) => {
    
    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args });
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
exports.agSetAgenPass = [

  async (req, res) => {
    
    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args });
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
exports.agSetMasterPass = [

  async (req, res) => {
    
    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args });
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
      const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args });
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
