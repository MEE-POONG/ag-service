const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userS = "ufrcb"
const userM = "ufrcb38"
const userA = "ufrcb38a2"
const passS = "168Ufavip168++"
const passM = "66Pplsix168<>+"
const passA = "Vip66ufa~168++"
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
(async() => {

    const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 5000 }, args });
    const page = await browser.newPage();
    let element, formElement, tabs, resultTable, resultTransfer, listNum, selectList;
    await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

    element = await page.$x(`//*[@id="txtUserName"]`)
    await element[0].type(userM);
    element = await page.$x(`//*[@id="txtPassword"]`)
    await element[0].type(passM);
    element = await page.$x(`//*[@id="btnSignIn"]`)
    await element[0].click()
    console.log('login สำเร็จ');
    await delay(1000);
    await page.goto(agtest + `/_Age/AgentList.aspx?type=agent&role=ag&userName=` + userM, {
        waitUntil: 'networkidle2'
    })
    await delay(1000);
    
    // ////////////////////////////////////เติมเครดิต///////////////////////////////////////////
    console.log('--- ------------------------เติมเครดิต------------------------ ---');
    await page.goto(agtest + `/_Age1/AgentSet.aspx?userName=` + userA + `&set=1`, {
        waitUntil: 'networkidle2'
    })
    await delay(1000);
    let moneyAdd = 5000

    await page.waitForXPath(`//*[@id="txtTotalLimit"]`);
    [elements] = await page.$x(`//*[@id="txtTotalLimit"]`);
    let result = await page.evaluate(element => element.value, elements);
    moneyOld = Number(result.toString().replace(/,/g, ''));
    console.log("moneyOld 2 : ", moneyOld);
    moneyOld += +moneyAdd
    console.log("moneyOld 3 : ", moneyOld);
    let sumAdd = moneyOld.toString()
    await delay(100);
    element = await page.$x(`//*[@id="txtTotalLimit"]`);
    await element[0].click({ clickCount: 3 })
    await page.keyboard.press('Backspace')
    await element[0].type(sumAdd);

    //ยืนยัน
    console.log('--- ------------------------ ยืนยัน ------------------------ ---');
    // element = await page.$x(`//*[@id="btnUpdateC"]`)
    // await element[0].click()


})();
