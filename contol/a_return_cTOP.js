require('dotenv').config()
const delay = require("delay");


const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI

console.log(MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })

mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})



const FailedLogin = require('../models/failedLogin.model')
const ReturnCustomerPSD = require('../models/returnCustomerPSD')
const ReturnCustomerUFA66 = require('../models/returnCustomerUFA66')
const ReturnCustomerTOP = require('../models/returnCustomerTOP')
// psd	T99Ppvip999.
// 66	Vip66ufa~168++
// top	Tpufa168wptop++
const puppeteer = require('puppeteer');
require('dotenv').config()
const userA = "ufrcb38a2"
const passA = "Vip66ufa~168++"
const passPsd = "T99Ppvip999."
const passTop = "Tpufa168wptop++"
const agtest = "http://ocean.isme99.com"
const { Poseidon99, UFA66, TOP168 } = require('../dataWeb');
// const web = "poseidon99";
// const web = "UFA66";
// const web = "TOP168";
// const web = "UFA66";
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


const handleWithdraw = async (username, web, browser) => {

  const page = await browser.newPage();
  let element, formElement, tabs;
  await Promise.all([
    page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' }),
    page.waitForNavigation({ waitUntil: 'load' })
  ]);
  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type(username);
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(web === "poseidon99" ? passPsd : web === "UFA66" ? passA : passTop);
  console.log(web === "poseidon99" ? passPsd : web === "UFA66" ? passA : passTop)
  element = await page.$x(`//*[@id="btnSignIn"]`)
  await Promise.all([
    element[0].click(),
    page.waitForNavigation({ waitUntil: 'load' })
  ]);

  const title = await page.title()
  const urls = page.url()

  if (title === ':: Management ::') {
    element = await page.$x(`//*[@id="txtUserName"]`)
    await element[0].type(username);
    element = await page.$x(`//*[@id="txtPassword"]`)
    await element[0].type(web === "poseidon99" ? passPsd : web === "UFA66" ? passA : passTop);
    console.log(web === "poseidon99" ? passPsd : web === "UFA66" ? passA : passTop)
    element = await page.$x(`//*[@id="btnSignIn"]`)

    await Promise.all([
      element[0].click(),
      page.waitForNavigation({ waitUntil: 'load' })
    ]);

  }

  console.log('Page Title :' + title)
  console.log('Page URL : ' + urls)
  console.log('login สำเร็จ');

  await Promise.all([
    page.goto(agtest + `/_SubAg/SubAccsWinLose2.aspx?role=sa&userName=` + username + `&from=02/01/2022&to=02/28/2022&catId=&gId=-1&checkAll=True`, {
      waitUntil: 'load'
    }),
    page.waitForNavigation({ waitUntil: 'load' })
  ]);


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

  await resultTable.shift();
  await resultTable.pop();
  // //เอาช่อง 4 ยูสเซอร์ ช่อง 9 Balance	 ช่อง 10 Balance แสดงสำหรับ เติมไม่ได้
  // //ตัดข้อมูลทิ้ง
  console.log('--- ตัดข้อมูลทิ้ง ---');

  let i = 0
  for (const iterator of resultTable) {
    if (await iterator[2] !== 'THB') {
      await resultTable.splice(i, 1);
    }
    i += await 1
  }

  let index = 0
  for (const iterator of resultTable) {
    const money = await Number(iterator[10].toString().replace(/,/g, ''));
    const user = await iterator[0]
    withdraw = 0
    if (web === "poseidon99") {
      withdraw = await money < -2000 ? 0 - (money) * 0.05 : 0
      withdraw = await withdraw > 3000 ? 3000 : withdraw
      const customerPSD = new ReturnCustomerPSD({
        "usernameAG": user,
        "winLose": money,
        "returnCredit": withdraw,
        "statusFlag": "A",
        "createdBy": "60dc8d9e9762420ab43ba7b1",
        "updatedBy": "60dc8d9e9762420ab43ba7b1",
      })
      // SAVE CUSTOMER
      console.log(web, index += 1, user, " : ", money, ": คืน :", withdraw);
      await customerPSD.save()
    } else if (web === "UFA66") {
      withdraw = await money < 0 ? 0 - (money) * 0.05 : 0
      withdraw = await withdraw > 1000 ? 1000 : withdraw
      const customerUFA66 = new ReturnCustomerUFA66({
        "usernameAG": user,
        "winLose": money,
        "returnCredit": withdraw,
        "statusFlag": "A",
        "createdBy": "60dc8d9e9762420ab43ba7b1",
        "updatedBy": "60dc8d9e9762420ab43ba7b1",
      })
      // SAVE CUSTOMER
      console.log(web, index += 1, user, " : ", money, ": คืน :", withdraw);
      await customerUFA66.save()
    } else if (web === "TOP168") {
      withdraw = await money < -3000 ? 0 - (money) * 0.05 : 0
      withdraw = await withdraw > 1000 ? 1000 : withdraw
      const customerTOP = new ReturnCustomerTOP({
        "usernameAG": user,
        "winLose": money,
        "returnCredit": withdraw,
        "statusFlag": "A",
        "createdBy": "60dc8d9e9762420ab43ba7b1",
        "updatedBy": "60dc8d9e9762420ab43ba7b1",
      })
      // SAVE CUSTOMER
      console.log(web, index += 1, user, " : ", money, ": คืน :", withdraw);
      await customerTOP.save()
    }

  }

  page.close();
}




const webPoseidon99 = async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 5000 }, args });
  for (const iterator of Poseidon99) {
    await handleWithdraw(iterator.username, iterator.web, browser)
  }
}

const webUFA66 = async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 5000 }, args });
  for (const iterator of UFA66) {
    await handleWithdraw(iterator.username, iterator.web, browser)
  }
}

const webTOP168 = async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 5000 }, args });
  for (const iterator of TOP168) {
    await handleWithdraw(iterator.username, iterator.web, browser)
  }
}

// webPoseidon99()
// webTOP168()
// webUFA66()

const allWEB = async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 5000 }, args });
  // for (const iterator of Poseidon99) {
  //   try {
  //     await handleWithdraw(iterator.username, iterator.web, browser)
  //   } catch (error) {
  //     const failedLogin = new FailedLogin({
  //       usernameAG: iterator.username,
  //       detail: '0.5'
  //     });
  //     await failedLogin.save();
  //   }
  // }
  // for (const iterator of UFA66) {
  //   try {
  //     await handleWithdraw(iterator.username, iterator.web, browser)
  //   } catch (error) {
  //     const failedLogin = new FailedLogin({
  //       usernameAG: iterator.username,
  //       detail: '0.5'
  //     });
  //     await failedLogin.save();
  //   }
  // }
  for (const iterator of TOP168) {
    try {
      await handleWithdraw(iterator.username, iterator.web, browser)
    } catch (error) {
      const failedLogin = new FailedLogin({
        usernameAG: iterator.username,
        detail: '0.5'
      });
      await failedLogin.save();
    }
  }
}

allWEB()
