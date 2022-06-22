const delay = require('delay')
const puppeteer = require('puppeteer');
  require('dotenv').config()
const { createWorker } = require('tesseract.js')
const chalk = require('chalk')
const { topAgenPass, sixAgenPass, topMasterPass, sixMasterPass, adminUser, adminPass } = process.env
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

exports.agStoreCustomer = [
  async (req, res) => {
    const { usernameAG, webname, countUser, customerLatest } = req.body
    let passAgen = webname === 'UFA-66' ? sixAgenPass : webname === 'TOP-168' ? topAgenPass : ''
    let userCopy = webname === 'UFA-66' ? "0001" : webname === 'TOP-168' ? "001" : ''
    const browser = await puppeteer.launch({
      headless: true,
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
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(passAgen)
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
        setUserNumber = (+customerLatest.substring(countUser) + idx).toString().padStart(checkZero, '0')
        await page.goto(`https://ag.ufa6666.com/_SubAg1/MemberSet.aspx?cName=` + usernameAG + userCopy + `&set=1`, {
          waitUntil: 'networkidle2'
        })
        element = await page.$x(`//*[@id="txtUserName"]`)
        await element[0].type(setUserNumber)
        console.log(chalk.black.bold.bgYellow('85 : ', idx))
        await element[0].type(`Aa123456+`)
        element = await page.$x(`//*[@id="txtTotalLimit"]`)
        await element[0].type(`0`)
        element = await page.$x(`//*[@id="btnSave"]`)
        await element[0].click()
        console.log(chalk.white.bgGreen.bold('ag seve customer for : ', idx))
        await delay(1000)
      }
      await page.close() // Close the website
      await browser.close();
      apiResponse.successResponseWithData(res, 'Operation success', {})
    } catch (error) {
      browser.close()
      apiResponse.ErrorResponse(res, error)
    }
  }
]
exports.agStoreAgen = [
  async (req, res) => {
    const { _id, usernameAG, status, webname, countUser, customerLatest } = req.body
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 },
      args
    })
    const page = await browser.newPage()
    try {
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
          ? sixMasterPass
          : webname === 'TOP-168'
            ? topMasterPass
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

      await page.close() // Close the website
      await browser.close();
      apiResponse.successResponseWithData(res, 'Operation success', {})
    } catch (error) {
      browser.close()
      return apiResponse.ErrorResponse(res, error)
    }

  }
]
exports.agMoneyAllince = [
  async (req, res) => {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1600, height: 1080 },
      args
    })
    const page = await browser.newPage()
    try {
      const { adviserID, usernameAG, status, webname, moneyAdd } = req.body;
      const alliance = await Alliance.findById(adviserID);
      let seniorPass = "168Ufa<>168++"
      let passAg
      let sumAdd
      let moneyOld

      if (alliance.status === 'senior') {
        passAg = await seniorPass;
      } else if (alliance.status === 'master') {
        console.log(webname);
        passAg = await webname === 'UFA-66' ? sixMasterPass : topMasterPass
      } else {
        return apiResponse.ErrorResponse(res, error)
      }
      console.log("passAg : ", passAg);
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
      moneyOld = Number(result.toString().replace(/,/g, ''));
      moneyOld += +moneyAdd
      console.log("moneyOld 3 : ", moneyOld);
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

      console.log('--- 511 ---');
      result = await page.evaluate(element => element.textContent, element);
      if (result === "Profile updated successfully.") {
        console.log('--- 514 ---');
        await page.close()
        await browser.close();
        apiResponse.successResponseWithData(res, 'Operation success', {})
      } else {
        console.log('--- 520 ---');
        if (status === "agen") {
          console.log('--- 523 ---');
          await page.goto('https://ag.ufa6666.com/_Age/AccBal.aspx?role=ag&userName=' + alliance.usernameAG + '&searchKey=' + usernameAG + '&pageIndex=1', {
            waitUntil: 'networkidle2'
          })
          await delay(1000)
          console.log('--- 527 ---');
          // element = await page.$x(`//*[@id="AccBal_cm1_txtSearch"]`);
          // await element[0].type(usernameAG);
          // element = await page.$x(`//a[@id='AccBal_cm1_btnSubmit']/span`);
          // await element[0].click();
          // element = await page.$x(`//a[@id='AccBal_cm1_btnSubmit']`);
          // await element[0].click();
          element = await page.$x(`//*[@id="chkPayAll"]`);
          await element[0].click();
          console.log('--- 536 ---');
          element = await page.$x(`//*[@id="AccBal_cm1_btnPayAll"]`);
          await element[0].click()
          console.log('--- 539 ---');
          await page.goto(`https://ag.ufa6666.com/_Age1/AgentSet.aspx?userName=` + usernameAG + `&set=1`, {
            waitUntil: 'networkidle2'
          })
          await delay(100)
          await page.waitForXPath(`//*[@id="txtTotalLimit"]`);
          element = await page.$x(`//*[@id="txtTotalLimit"]`);
          await element[0].click({ clickCount: 3 })
          await page.keyboard.press('Backspace')
          await element[0].type(sumAdd);
          element = await page.$x(`//*[@id="btnUpdateC"]`)
          await element[0].click()
          await delay(100);
          await page.waitForXPath(`//*[@id="lblStatus"]`);
          [element] = await page.$x(`//*[@id="lblStatus"]`);
          console.log('--- 552 ---');
          result = await page.evaluate(element => element.textContent, element);
          if (result === "Profile updated successfully.") {
            console.log('--- 555 ---');
            await page.close()
            await browser.close();
            apiResponse.successResponseWithData(res, 'Operation success', {})
          } else {
            await page.close()
            await browser.close();
            apiResponse.ErrorResponse(res, error)
          }
        } else {
          await page.close()
          await browser.close();
          apiResponse.ErrorResponse(res, error)
        }
      }
    } catch (error) {
      console.log(error)
      browser.close()
      return apiResponse.ErrorResponse(res, error)
    }

  }
]
exports.agDownAgen = [
  async (req, res) => {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1800, height: 1080 },
      args
    })
    const page = await browser.newPage()
    try {
      const { adviserID, usernameAG, status, webname, moneyAdd } = req.body;
      console.log(usernameAG, webname);

      const birthday = new Date();
      let element
      let userStar
      let agenPass
      if (webname === "UFA-66") {
        agenPass = await sixAgenPass
        userStar = await "****"
      } else if (webname === "TOP-168") {
        agenPass = await topAgenPass
        userStar = await "***"
      } else {
        return apiResponse.ErrorResponse(res, error)
      }
      console.log(agenPass);
      webname === "UFA-66" ? "****" : webname === "TOP-168" ? "***" : ''
      await page.goto(`http://ufa66.office168.work/?action=login`, { waitUntil: 'networkidle2' });
      await delay(500);
      element = await page.$x(`//*[@name="username"]`);
      await element[0].type(adminUser);
      element = await page.$x(`//*[@name="password"]`);
      await element[0].type(adminPass);
      element = await page.$x(`//*[@name="login"]`);
      await element[0].click();
      console.log('--- 1 ---');
      await delay(3000);
      await page.waitForXPath(`//a[contains(text(),'ตามลูกค้า')]`);
      element = await page.$x(`//a[contains(text(),'ตามลูกค้า')]`);
      await element[0].click();
      // await page.waitForXPath(`/html/body/div/div/div[1]/ul/li/ul/li[5]/a`);
      // element = await page.$x(`/html/body/div/div/div[1]/ul/li/ul/li[5]/a`);
      await element[0].click();
      console.log('--- 2 ---');
      await delay(100);
      await page.bringToFront();
      await page.goto(`http://ufa66.play168.xyz/__admin/?action=agent-list&game_id=1`, { waitUntil: 'networkidle2' });

      await delay(3000);
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[1]/div/input`);
      await element[0].type(usernameAG);
      console.log('--- 3 ---', usernameAG);
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[4]/div/input`);
      await element[0].type(usernameAG);
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[5]/div/input`);
      await element[0].type(agenPass);
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[7]/div/textarea`);
      await element[0].type(`_SubAg`);
      console.log('--- 4 ---');
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[8]/div/input`);
      await element[0].type(usernameAG);
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[9]/div/input`);
      await element[0].type(agenPass);
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[11]/div/input`);
      await element[0].type(`_SubAg`);
      console.log('--- 5 ---');
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[12]/div/input`);
      await element[0].type(usernameAG + userStar);
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[13]/div/input`);
      await element[0].type(`1`);
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[14]/div/input`);
      await element[0].type(webname === "UFA-66" ? "9999" : "999");
      console.log('--- 6 ---');
      element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[16]/div/button`);
      await element[0].click()
      await page.close() // Close the website
      await browser.close();
      apiResponse.successResponseWithData(res, 'Operation success', {})
    } catch (error) {
      await page.close()
      await browser.close();
      console.log(error);
      browser.close()
      return apiResponse.ErrorResponse(res, error)
    }
  }
]
exports.agSetPassAllince = [

  async (req, res) => {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 }, args });
    const page = await browser.newPage();
    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body

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
      await element[0].type(webname === "UFA-66" ? sixAgenPass : webname === "TOP-168" ? topAgenPass : "");
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
        await delay(1000);
        await element[0].click();
        console.log(chalk.black.bold.bgYellow("81 : ", idx));
        await delay(3000);
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
        console.log(chalk.white.bgGreen.bold("ag sever customer for : ", idx));
        await delay(1000);

      }
      await page.close(); // Close the website
      browser.close()
      return apiResponse.successResponseWithData(res, 'Operation success', {})

    } catch (error) {
      browser.close()
      return apiResponse.ErrorResponse(res, error)
    }

  }
]
exports.agSetAgenAndPass = [

  async (req, res) => {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 }, args });
    const page = await browser.newPage();
    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body

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
      await element[0].type(webname === "UFA-66" ? sixAgenPass : webname === "TOP-168" ? topAgenPass : "");
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
        await delay(1000);
        await element[0].click();
        console.log(chalk.black.bold.bgYellow("81 : ", idx));
        await delay(3000);
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
      await browser.close();
      return apiResponse.successResponseWithData(res, 'Operation success', {})
    } catch (error) {
      browser.close()
      return apiResponse.ErrorResponse(res, error)
    }

  }
]
