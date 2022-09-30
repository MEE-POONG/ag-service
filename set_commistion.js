const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const { Psd_Customer } = require('./psd_ufruu1m18')
const passA_PSD = "Maxufapsd168-++"
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
    let element, formElement, checkPosition, checkPass;

    for (const [idx, data] of Psd_Customer.entries()) {
        if (checkPosition !== data.agent) {
            checkPosition = data.agent
            await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })
            await delay(1000);
            element = await page.$x(`//*[@id="txtUserName"]`)
            await element[0].type(data.agent);
            element = await page.$x(`//*[@id="txtPassword"]`)
            await element[0].type(passA_PSD);
            element = await page.$x(`//*[@id="btnSignIn"]`)
            await element[0].click()
            console.log('login สำเร็จ');
            await delay(5000);
        }


        console.log(idx, " data.username : ", data.username);
        await page.goto(agtest + `/_SubAg1/MemberSet.aspx?userName=` + data.username + `&set=1`, {
            waitUntil: 'networkidle2'
        })
        //SPORTSBOOK มาสเตอร์ไม่ใช่บอล
        // ON
        element = await page.$x(`//table[@onclick="toggleSetting2('trSports',this,'btnUpdSB')"]`);
        await element[0].click();
        // console.log('SPORTSBOOK สำเร็จ');
        await delay(1000);
        element = await page.select("select#lstCommission", "0.5")
        element = await page.select("select#lstCommissionX12", "0.3")
        element = await page.select("select#lstCommissionPar", "1")
        element = await page.select("select#lstCommissionOther", "1")
        // OFF
        // element = await page.$x(`//table[@onclick="toggleSetting2('trSports',this,'btnUpdSB')"]`);
        element = await page.$x(`//*[@id="btnUpdSB"]`)
        await element[0].click();
        await page.waitForNavigation({ waitUntil: 'load' })
        await delay(1000);
        // SA GAMING
        // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[10]/td/table/tbody/tr[4]/td/table/tbody/tr[1]/td/table`);
        element = await page.$x(`//table[@onclick="toggleSetting2('trRAR',this,'btnUpdRAR')"]`);
        await element[0].click();
        // console.log('เปิด SA GAMING สำเร็จ');
        //ปิด เปิด
        element = await page.evaluate(() => {
            let radio = document.querySelector('#btnRARDisable');
            radio.click();
        });
        element = await page.evaluate(() => {
            let radio = document.querySelector('#btnRAREnable');
            radio.click();
        });
        //ปรับเซอเซน 0
        element = await page.select("select#lstCommissionRAR", "0.7")
        // OFF
        // element = await page.$x(`//table[@onclick="toggleSetting2('trRAR',this,'btnUpdRAR')"]`);
        element = await page.$x(`//*[@id="btnUpdRAR"]`)
        await element[0].click();
        await page.waitForNavigation({ waitUntil: 'load' })
        await delay(1000);

        // GH COCKFT / HORSE RACING
        element = await page.$x(`//table[@onclick="toggleSetting2('trRBG',this,'btnUpdRBG')"]`);
        await element[0].click();
        // console.log('GH COCKFT / HORSE RACING สำเร็จ');
        //ปรับเซอเซน 0
        element = await page.select("select#lstCommissionRBG", "0.25")
        //ปรับไม้ 6 ระดับ
        // Limit A	Min = 20 Max = 2500	 
        // Limit B	Min = 100 Max = 5000	 
        // Limit C	Min = 200 Max = 10000	 
        // Limit D	Min = 300 Max = 15000	 
        // Limit E	Min = 500 Max = 25000	 
        element = await page.$x(`//*[@id="optRBGProfile1"]`)
        await element[0].click()
        // OFF
        // element = await page.$x(`//table[@onclick="toggleSetting2('trRBG',this,'btnUpdRBG')"]`);
        element = await page.$x(`//*[@id="btnUpdRBG"]`)
        await element[0].click();
        await page.waitForNavigation({ waitUntil: 'load' })
        await delay(1000);


    }


})();
