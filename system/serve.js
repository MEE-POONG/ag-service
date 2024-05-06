
require('dotenv').config()
const mongoose = require('mongoose')
console.log('START ag-service');
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, reconnectTries: 5000 })
mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})

const chalk = require('chalk');
console.log(chalk.green(MONGODB_URI));
console.log(chalk.green('START AG SETVICE VERSION 1.0.0'));


const io = require("socket.io-client");

var socket = io.connect("https://ag-bot-io.meetanggroup.com");
socket.on("connect", function () {
  socket.emit("join", "Hello world from client");
});

const fs = require('fs');

const Customer = require('../models/customer.model')
const Alliance = require('../models/alliance.model')
const Credit = require('../models/credit.model')


const delay = require("delay");
const puppeteer = require('puppeteer');


const tesseract = require("node-tesseract-ocr")

const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
}

const { args } = require('./configs/args');
const { readImg } = require('./utils/tesseractGet');
const { createCustomer } = require("./createCustomer");
const { setAllianceZero } = require('./setAllianceZero')
const { setUpAgent } = require('./setUpAgent')
const { createCredit } = require('./createCredit')

const headless = true
const link = headless ? 'https://ag.777whisky.com/' : 'https://ag.777whisky.com/'
const { topAgenPass, sixAgenPass, topMasterPass, sixMasterPass, adminUser, adminPass } = process.env

var cmd = require('node-cmd');

let statusFlags = 'R';
async function login(data, index, db) {
  index += 1
  let password = sixAgenPass
  try {
    if (data.status === 'master') {
      password = sixMasterPass
    }
    console.log('statusFlags = P');
    statusFlags = 'P'
    const browser = await puppeteer.launch({
      args,
      headless,
      defaultViewport: null
    })
    console.log('puppeteer.launch');

    const page = await browser.newPage()
    const birthday = new Date();
    const date1 = birthday.getTime();
    let element

    await page.goto(
      link,
      { waitUntil: 'networkidle2' }
    )
    await page.screenshot({
      path: 'screenshot_full.jpg',
      fullPage: true
    })

    console.log(await page.title());
    console.log(page.url());
    await page.screenshot({
      path: 'screenshot_full.jpg',
      fullPage: true
    })
    // console.log(data);
    console.log('71');
    console.log(date1);
    if (headless) {
      const linkll = __dirname + '/img/captcha' + date1 + '.png'
      console.log(linkll);
      const pathPhoto = linkll
      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: pathPhoto
      })
      await delay(2000)
      console.log('usernameAG', data.usernameAG);
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(db === 'Credit' ? data.adviser : data.usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      console.log('password', password);
      await element[0].type(password)
      const img = fs.readFileSync(pathPhoto)

      await tesseract.recognize(img, config)
        .then(async text => {
          console.log("Result:", text)

          console.log('IMG TXT', text)
          element = await page.$x(`//*[@id="txtCode"]`)
          await element[0].type(text)
          await element[0].press('Enter');
          fs.unlink(pathPhoto, (err => { return; }));
        })
        .catch(error => {
          console.log(error.message)

          console.log(chalk.red(error))
          fs.unlink(pathPhoto, (err => { return; }));
          // cmd.runSync('npm run serve:restart');
        })


    } else {
      console.log('usernameAG', db === 'Credit' ? data.adviser : data.usernameAG);
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(db === 'Credit' ? data.adviser : data.usernameAG)
      console.log('password', password);
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(password)


      await page.screenshot({
        path: 'screenshot_full.jpg',
        fullPage: true
      })

      element = await page.$x(`//*[@id="btnSignIn"]`)
      await element[0].click()
    }

    await delay(2000)
    const title = await page.title()
    const urls = page.url()

    await page.screenshot({
      path: 'screenshot_full.jpg',
      fullPage: true
    })

    if (title === ':: Management ::') {
      // browser.close();
      if (index >= 1) {
        console.log(db);
        if (db === 'Customer') {
          await Customer.updateOne({ _id: data._id }, { $set: { statusServe: 'FAIL_TO_LOGIN' } })
          console.log(`_id: ${data._id}, Customer: statusServe: FAIL_TO_LOGIN`);
          statusFlags = 'R'
          console.log('FAIL_TO_LOGIN');
          cmd.runSync('npm run serve:restart');
          return
        }
        if (db === 'Alliance') {
          await Alliance.updateOne({ _id: data._id }, { $set: { statusServe: 'FAIL_TO_LOGIN' } })
          console.log(`_id: ${data._id}, Alliance: statusServe: FAIL_TO_LOGIN`);
          statusFlags = 'R'
          console.log('FAIL_TO_LOGIN');
          cmd.runSync('npm run serve:restart');
          return
        }
      } else {
        login(data, index, db)
      }
      return;
    }

    console.log('Page Title :' + title)
    console.log('Page URL : ' + urls)

    return { browser, page }
  } catch (error) {
    console.log("error", error);

    if (db === 'Credit') {
      await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'FAIL_TO_LOGIN' } })
      console.log(`_id: ${data._id}, Credit: statusServe: FAIL_TO_LOGIN`);
      cmd.runSync('npm run serve:restart');
      return
    }
    if (db === 'Customer') {
      await Customer.updateOne({ _id: data._id }, { $set: { statusServe: 'FAIL_TO_LOGIN' } })
      console.log(`_id: ${data._id}, Customer: statusServe: FAIL_TO_LOGIN`);
      cmd.runSync('npm run serve:restart');
      return
    }
    
    if (db === 'Alliance') {
      await Alliance.updateOne({ _id: data._id }, { $set: { statusServe: 'FAIL_TO_LOGIN' } })
      console.log(`_id: ${data._id}, Alliance: statusServe: FAIL_TO_LOGIN`);
      cmd.runSync('npm run serve:restart');
      return
    }
    console.error(db, error)
    cmd.runSync('npm run serve:restart');
  }
}

async function start() {
  console.log('status flag', statusFlags);
  setInterval(async () => {
    try {
      if (statusFlags === 'R') {

        const zeroPending = await Alliance.find({ statusServe: "PENDING", action: "SET_ZERO" }).limit(1);
        if (zeroPending.length > 0) {

          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          console.log(chalk.green('START JOB SET ALLIANCE ZERO ', new Date().toISOString()));
          for (let data of zeroPending) {
            await Alliance.updateOne({ _id: data._id }, { $set: { statusServe: 'WORKING' } })
            const { browser, page } = await login(data, 0, 'Alliance')
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
            console.log(chalk.green('START JOB SET ALLIANCE ZERO', data.usernameAG, new Date().toISOString()));
            await setAllianceZero(page, link, data)
            console.log(chalk.green('END JOB SET ALLIANCE ZERO ', data.usernameAG, new Date().toISOString()));
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          }
          statusFlags = 'R'
          // browser.close()
          console.log(chalk.green('END JOB SET ALLIANCE ZERO ', new Date().toISOString()));
          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          cmd.runSync('npm run serve:restart');
        }
        const upAgentPending = await Alliance.find({ statusServe: "PENDING", action: "SET_UP_AGENT" }).limit(1);
        if (upAgentPending.length > 0) {
          statusFlags = 'P'
          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          console.log(chalk.green('START JOB UP AGENT ', new Date().toISOString()));
          for (let data of upAgentPending) {
            await Alliance.updateOne({ _id: data._id }, { $set: { statusServe: 'WORKING' } })
            const { browser, page } = await login(data, 0, 'Alliance')
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
            console.log(chalk.green('START JOB UP AGENT', data.usernameAG, new Date().toISOString()));
            await setUpAgent(page, link, data)
            console.log(chalk.green('END JOB UP AGENT ', data.usernameAG, new Date().toISOString()));
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
            // browser.close()
          }
          statusFlags = 'R'
          console.log(chalk.green('END JOB UP AGENT ', new Date().toISOString()));
          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          cmd.runSync('npm run serve:restart');
        }

        const creditPending = await Credit.find({ statusServe: "PENDING" }).limit(1);
        console.log(creditPending);

        if (creditPending.length > 0) {
          statusFlags = 'P'
          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          console.log(chalk.green('START JOB CREATE CREDIT ', new Date().toISOString()));
          for (let data of creditPending) {
            await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'WORKING' } })
            const { browser, page } = await login(data, 0, 'Credit')
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
            console.log(chalk.green('START JOB CREATE CREDIT', data.usernameAG, new Date().toISOString()));
            await createCredit(page, link, data)
            console.log(chalk.green('END JOB CREATE CREDIT ', data.usernameAG, new Date().toISOString()));
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
            // browser.close()
          }
          statusFlags = 'R'
          console.log(chalk.green('END JOB CREATE CREDIT ', new Date().toISOString()));
          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          cmd.runSync('npm run serve:restart');
        }

        const customerPending = await Customer.find({ statusServe: "PENDING" }).limit(1);
        if (customerPending.length > 0) {
          const filterCustomerPending = await customerPending.filter(({ usernameAG }) => usernameAG === customerPending[0].usernameAG)
          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          console.log(chalk.green('START JOB CUSTOMER CREATE ', customerPending[0].usernameAG, new Date().toISOString()));
          const { browser, page } = await login(customerPending[0], 0, 'Customer')
          for (let data of filterCustomerPending) {
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
            console.log(chalk.green('START JOB CUSTOMER CREATE ', data.customerID, new Date().toISOString()));
            await createCustomer(page, link, data)
            await socket.emit("customer-history-updated", "update");
            console.log(chalk.green('END JOB CUSTOMER CREATE ', data.customerID, new Date().toISOString()));
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));

          }
          // browser.close()
          statusFlags = 'R'
          await socket.emit("customer-history-updated", "success");
          console.log(chalk.green('END JOB CUSTOMER CREATE ', customerPending[0].usernameAG, new Date().toISOString()));
          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          cmd.runSync('npm run serve:restart');
        }
      }
    } catch (error) {
      console.log(chalk.red(error));
      cmd.runSync('npm run serve:restart');
    }
  }, 2000);

}

start()
