const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const passS = "Est1540+*#"
const { UFRUU_AGENT_1 } = require('./betflix_data')
const passM = "Ufr168pppt99~+"
const passA = "Maxufapsd168-++"
const agtest = "https://bo.psg777.com/bo"

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
  '--ignore-certificate-errors',
  '--lang=th-TH,th',
  '--user-data-dir=%userprofile%\\AppData\\Local\\Chromium\\User Data\\Profile 1'
];
(async () => {


  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 60, // slow down by 250ms
    defaultViewport: { width: 1080, height: 1080 },
    args: args
  });

  const page = await browser.newPage();
  let element, formElement, tabs;
  // element = await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

  element = await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

  element = await page.setExtraHTTPHeaders({
    'Accept-Language': 'th'
  });
  element = await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "language", {
      get: function () {
        return "th-TH";
      }
    });
    Object.defineProperty(navigator, "languages", {
      get: function () {
        return ["th-TH", "th"];
      }
    });
  });

  let check = '';
  //await delay(1000);
  for (const [idx, data] of UFRUU_AGENT_1.entries()) {
    console.log(idx, " : ", data.username);
    if (check != data.master) {
      check = data.master
      element = await page.goto(agtest, { waitUntil: 'load' })

      element = await page.waitForXPath(`//*[@name="username"]`);
      element = await page.$x(`//*[@name="username"]`)
      await element[0].type(data.master);

      element = await page.waitForXPath(`//*[@name="password"]`);
      element = await page.$x(`//*[@name="password"]`)
      await element[0].type(passM);
      await element[0].type('\n');

      console.log('login สำเร็จ');

      element = await page.waitForXPath(`/html/body/div[1]/div[3]/div/div/div[3]/button`)
      element = await page.$x(`/html/body/div[1]/div[3]/div/div/div[3]/button`)
      await element[0].click();

      await page.goto(agtest + `/downline`, {
        waitUntil: 'load'
      })

    }



    //วนลูปคลิก edit
    element = await page.waitForXPath(`//*[@id="table1"]/tbody[1]/tr[1]/td[8]//*[contains(text(),'Edit')]`);
    await page.evaluate(() => {
      const xpath = `//*[@id="table1"]/tbody[1]/tr[1]/td[8]//*[contains(text(),'Edit')]`;
      const result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
      result.iterateNext().click();
    });
    // ช่องเปลี่ยนรหัส
    element = await page.waitForXPath(`//div[@id='custom-content-below-detail-edit']/div[2]/input`)
    await page.evaluate(() => {
      const xpath = `//div[@id='custom-content-below-detail-edit']/div[2]/input`;
      const result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
      result.iterateNext().click();
    });
    element = await page.$x(`//div[@id='custom-content-below-detail-edit']/div[2]/input`)
    await element[0].type(passA);
    //ซัพมิตร
    element = await page.waitForXPath(`//form[@id='editdown_form']/div[3]/button`)
    await page.evaluate(() => {
      const xpath = `//form[@id='editdown_form']/div[3]/button`;
      const result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
      result.iterateNext().click();
    });
    // // //ยืนยัน
    
    element = await page.goto('https://bo.psg777.com/auth/bologout_p', { waitUntil: 'load' })

  }


})();
