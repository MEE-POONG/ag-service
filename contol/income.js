require('dotenv').config()
var mongoose = require('mongoose')
var moment = require('moment')
const chalk = require('chalk');

const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})

const Alliance = require('../models/alliance.model')
const Income = require('../models/income.model')
const FailedLogin = require('../models/failedLogin.model')

const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userM = "ufrcb38"
const passA = "66Pplsix168<>+"
const agtest = "http://ocean.isme99.com"
const headless = false;
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

  console.log(chalk.green('START CALCULATING INCOME'));

  const alliances = await Alliance.find({ status: 'master', webname: 'UFA66' }, { usernameAG: 1, _id: 0 })
  console.log(alliances)


  for (const [idx, data] of alliances.entries()) {
    const browser = await puppeteer.launch({ headless, defaultViewport: { width: 1920, height: 5000 }, args });
    await insertInCome(data.usernameAG, browser)
  }

})();


const insertInCome = async (masterUser, browser) => {

  let resultTable;
  try {


    const page = await browser.newPage();
    let element, formElement, tabs;

    await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

    console.log(chalk.green('LOGIN'));
    element = await page.$x(`//*[@id="txtUserName"]`)
    await element[0].type(masterUser);
    element = await page.$x(`//*[@id="txtPassword"]`)
    await element[0].type(passA);
    element = await page.$x(`//*[@id="btnSignIn"]`)
    await element[0].click()
    console.log(chalk.green('LOGIN สำเร็จ'));

    await delay(1000);

    const title = await page.title()
    if (title === ':: Management ::') {
      browser.close();
      const failedLogin = new FailedLogin({
        usernameAG: masterUser
      });
      await failedLogin.save();
      return;
    }
    await page.goto(agtest + `/_Age/SubAccsWinLose2.aspx?role=ag&userName=` + masterUser + `&catId=&gId=-1&checkAll=True`, {
      waitUntil: 'networkidle2'
    })

    console.log('SubAccsWinLose_cm1_chkAll');
    await page.waitForXPath(`//*[@id="SubAccsWinLose_cm1_chkAll"]`, { visible: true });
    element = await page.$x(`//*[@id="SubAccsWinLose_cm1_chkAll"]`);
    await element[0].click();

    await delay(500);
    console.log('SubAccsWinLose_cm1_btnLastWeek');
    await page.waitForXPath(`//*[@id="SubAccsWinLose_cm1_btnLastWeek"]`, { visible: true });
    element = await page.$x(`//*[@id="SubAccsWinLose_cm1_btnLastWeek"]`);
    await element[0].click();

    await delay(500);
    console.log('datBegin');
    await page.waitForXPath(`//*[@name="datBegin"]`, { visible: true });
    [element] = await page.$x(`//*[@name="datBegin"]`);
    let incomeStartDate = await page.evaluate(element => element.value, element);

    await delay(500);
    console.log('datEnd');
    await page.waitForXPath(`//*[@name="datEnd"]`, { visible: true });
    [element] = await page.$x(`//*[@name="datEnd"]`);
    let incomeEndDate = await page.evaluate(element => element.value, element);

    console.log('incomeStartDate', incomeStartDate, 'incomeEndDate', incomeEndDate);

    await delay(500);
    console.log('SubAccsWinLose_cm1_btnSubmit');
    await page.waitForXPath(`//*[@id="SubAccsWinLose_cm1_btnSubmit"]`, { visible: true });
    element = await page.$x(`//*[@id="SubAccsWinLose_cm1_btnSubmit"]`);
    await element[0].click();

    // //คัดลอกข้อมูล
    // //



    await delay(2000);

    console.log('SubAccsWinLose_cm1_g tbody tr');
    await page.waitForXPath(`//*[@id="SubAccsWinLose_cm1_g"]`, { visible: true });
    resultTable = await page.evaluate(async () => {
      const rows = document.querySelectorAll('#SubAccsWinLose_cm1_g tbody tr');
      console.log("rows 92 : ", rows);
      return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        console.log("columns : ", columns);
        return Array.from(columns, column => column.innerText);
      });
    });

    await delay(1000);

    // resultTable.shift();
    // resultTable.pop();
    // console.log('--- 92 --- : ', resultTable);
    // //เอาช่อง 4 ยูสเซอร์ ช่อง 9 Balance	 ช่อง 10 Balance แสดงสำหรับ เติมไม่ได้
    // //ตัดข้อมูลทิ้ง
    console.log('--- ตัดข้อมูลทิ้ง ---');
    for (var i = 0; i < resultTable.length; i++) {
      if (resultTable[i][2] !== 'THB') {
        resultTable.splice(i, 1);
      }
    }
    await delay(1000);
    console.log("resultTable.shift");
    await resultTable.shift()

    for (const iterator of resultTable) {

      console.log(chalk.yellow(iterator[0], iterator[5], iterator[9], iterator[10], iterator[14]));
      const income = new Income({
        usernameAG: iterator[0],
        onlineCustomer: iterator[5],
        commissionAgen: iterator[9],
        winAndLoseAgen: iterator[10],
        winAndLoseMaster: iterator[14],
        incomeStartDate: moment(incomeStartDate + ' 12:00', 'MM-DD-YYYY HH:mm').format(),
        incomeEndDate: moment(incomeEndDate + ' 12:00', 'MM-DD-YYYY HH:mm').format(),
        "agStatus": "",
        "statusFlag": "A",
        "action": "",
        "createdBy": mongoose.Types.ObjectId("61ff9d0049b196b7ba3476d6"),
        "updatedBy": mongoose.Types.ObjectId("61ff9d0049b196b7ba3476d6"),
      });
      await income.save();
    }
    console.log("income.save");
    console.log(chalk.green('SAVE สำเร็จ'));

    page.close();
    console.log(chalk.green('page.close'));
    browser.close();
  } catch (error) {
    console.log(error)
    await browser.close();
    browser = await puppeteer.launch({ headless, defaultViewport: { width: 1920, height: 5000 }, args });
    insertInCome(masterUser, browser)
    return;
  }
  // console.log(resultTable[0], resultTable[5], resultTable[10], resultTable[14]);
  //ตำแหน่ง 0 , 5, 9 , 10, 14
  return
}
