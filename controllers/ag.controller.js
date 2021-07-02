const delay = require("delay");
const puppeteer = require('puppeteer'); +
  require('dotenv').config()
const { masterTopPass, agenTopPass, masterSixPass, agenSixPass, adminuser, adminpass } = process.env
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
const { body, validationResult } = require('express-validator')
const { sanitizeBody } = require('express-validator')
var mongoose = require('mongoose')

var apiResponse = require('../helpers/apiResponse')

exports.agStoreUser = [

  async (req, res) => {
    try {
      const { usernameAG, webname, countUser, customerLatest } = req.body
      const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 }, args });
      const page = await browser.newPage();
      let element, formElement, tabs;

      await page.goto(`http://ocean.isme99.com/Public/Default11.aspx?lang=EN-US`, { waitUntil: 'networkidle2' });
      element = await page.$x(`//*[@id="txtUserName"]`);
      await element[0].type(usernameAG);
      element = await page.$x(`//*[@id="txtPassword"]`);
      await element[0].type(webname === "UFA-66" ? agenSixPass : webname === "TOP-168" ? agenTopPass : "");
      element = await page.$x(`//*[@id="btnSignIn"]`);
      await element[0].click();
      await delay(1000);
      for (const [idx, data] of arrayAG.entries()) {
        console.log(idx);
        setUserNumber = (+customerLatest.substring(countUser) + idx)
          .toString()
          .padStart(4, '0')
        await page.goto(`http://ocean.isme99.com/_SubAg1/MemberSet.aspx?cName=${customerLatest}&set=1`, { waitUntil: 'networkidle2' });
        element = await page.$x(`//*[@id="txtUserName"]`);
        await element[0].type(setUserNumber);
        element = await page.$x(`//*[@id="txtPassword"]`);
        await element[0].type(`Aa123456+`);
        element = await page.$x(`//*[@id="txtTotalLimit"]`);
        await element[0].type(`0`);
        element = await page.$x(`//*[@id="btnSave"]`);
        await element[0].click();
        await delay(1000);

      }
      // await browser.close();
       return apiResponse.successResponseWithData(res, 'Operation success', {})
    } catch (error) {
      return apiResponse.ErrorResponse(error).then((error)=>{
        console.log(error);
      })
    }
  }
]