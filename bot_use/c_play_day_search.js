const FROM = '09/01/2022'
const TO = '09/30/2022'
const { User_Check } = require('../data/user_check')
const MASTER_TEST = 'ufh273'
const AGEN_TEST = 'ufh273a2'
const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const pass = "Pp123456++"
const agtest = "http://ocean.isme99.com"
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
(async () => {

  const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 5000 }, args });
  const page = await browser.newPage();
  let element, formElement, tabs;

  let check = '';
  for (const [idx, data] of User_Check.entries()) {
    await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })
    await delay(1000);
    element = await page.$x(`//*[@id="txtUserName"]`)
    await element[0].type(data.username);
    element = await page.$x(`//*[@id="txtPassword"]`)
    await element[0].type(pass);
    element = await page.$x(`//*[@id="btnSignIn"]`)
    await element[0].click()
    console.log('login สำเร็จ');
    await delay(1000);

    await page.goto(
      agtest + `/_Part_Sub/SubAccsWinLose2.aspx?role=pa&userName=` + 
      data.useCheck + `&from=${FROM}&to=${TO}&gId=-1&checkAll=True`,
      {
        waitUntil: 'load'
      }
    )

    await page.goto(
      agtest + `/_Part_Sub/SubAccsWinLose2.aspx?role=ag&userName=` + 
      MASTER_TEST + `&from=${FROM}&to=${TO}&userID=` +
      data.useCheck +
      `&checkAll=True`,
      {
        waitUntil: 'load'
      }
    )
    
    await page.goto(
      agtest + `/_Part_Sub/SubAccsWinLose2.aspx?role=sa&userName=` + 
      AGEN_TEST + `&from=${FROM}&to=${TO}&userID=` +
      MASTER_TEST +
      `&checkAll=True`,
      {
        waitUntil: 'load'
      }
    )
    // element = await page.$x(`//*[@id="txtPassword"]`)
    // await element[0].type(passA);
    // // //ยืนยัน
    // element = await page.$x(`//*[@id="btnUpdateG"]`)
    // await element[0].click()
    // await delay(2000);

  }


})();
