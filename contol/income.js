const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userM = "ufrcb38"
const passA = "66Pplsix168<>+"
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
    await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

    element = await page.$x(`//*[@id="txtUserName"]`)
    await element[0].type(userM);
    element = await page.$x(`//*[@id="txtPassword"]`)
    await element[0].type(passA);
    element = await page.$x(`//*[@id="btnSignIn"]`)
    await element[0].click()
    console.log('login สำเร็จ');
    await delay(1000);
    await page.goto(agtest + `/_Age/SubAccsWinLose2.aspx?role=ag&userName=` + userM + `&catId=&gId=-1`, {
        waitUntil: 'networkidle2'
    })
    await delay(1000);
    element = await page.$x(`//*[@id="SubAccsWinLose_cm1_chkAll"]`);
    await element[0].click();
    // let birthday = new Date();
    // birthday.setDate(birthday.getDate() - 1);
    // let firstDay = ((birthday.getMonth() > 8) ? (birthday.getMonth() + 1) : ('0' + (birthday.getMonth() + 1))) + '/' + ((birthday.getDate() > 9) ? birthday.getDate() : ('0' + birthday.getDate())) + '/' + birthday.getFullYear();
    // birthday.setDate(birthday.getDate() - 6);
    // let lasttDay = ((birthday.getMonth() > 8) ? (birthday.getMonth() + 1) : ('0' + (birthday.getMonth() + 1))) + '/' + ((birthday.getDate() > 9) ? birthday.getDate() : ('0' + birthday.getDate())) + '/' + birthday.getFullYear();
    // console.log(firstDay);
    // console.log(lasttDay);
    // // await delay(1000);
    // element = await page.$x(`//*[@id="fdate"]`);
    // await element[0].type(firstDay)
    // await page.type('#fdate', '02/04/2022');
    // await page.type('#fdate_trigger', '02/04/2022');
    // // เลือกวัน

    await delay(5000);
    element = await page.$x(`//*[@id="SubAccsWinLose_cm1_btnSubmit"]`);
    await element[0].click();

    // //คัดลอกข้อมูล
    // //
    await delay(5000);

    resultTable = await page.evaluate(() => {
        const rows = document.querySelectorAll('#SubAccsWinLose_cm1_g tbody tr');
        console.log("rows 92 : ", rows);
        return Array.from(rows, row => {
            const columns = row.querySelectorAll('td');
            console.log("columns : ", columns);
            return Array.from(columns, column => column.innerText);
        });
    });
    console.log('--- 89 --- : ', resultTable);
    await delay(1000);

    // resultTable.shift();
    // resultTable.pop();
    // console.log('--- 92 --- : ', resultTable);
    // //เอาช่อง 4 ยูสเซอร์ ช่อง 9 Balance	 ช่อง 10 Balance แสดงสำหรับ เติมไม่ได้
    // //ตัดข้อมูลทิ้ง
    // console.log('--- ตัดข้อมูลทิ้ง ---');
    for (var i = 0; i < resultTable.length; i++) {
        if (resultTable[i][2] !== 'THB') {
            resultTable.splice(i, 1);
        }
    }
    await delay(1000);
    console.log("resultTable : ", resultTable);



})();