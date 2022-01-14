require('dotenv').config()
const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, reconnectTries: 5000 })
mongoose.connection.on('error', err => {
  console.error('MongoDB error', err)
})




const fs = require('fs');

const Customer = require('../models/customer.model')
const Alliance = require('../models/alliance.model')

const { createWorker } = require('tesseract.js')
const worker = createWorker()

const delay = require("delay");
const puppeteer = require('puppeteer');
const { args } = require('./configs/args');
const { readImg } = require('./utils/tesseractGet');
const chalk = require('chalk');
const { createCustomer } = require("./createCustomer");
const { setAllianceZero } = require('./setallianceZero')
const headless = true
const link = headless ? 'http://ag.ufa6666.com' : 'http://ocean.isme99.com'
const { topAgenPass, sixAgenPass, topMasterPass, sixMasterPass, adminUser, adminPass } = process.env
// var cmd = require('node-cmd');

let statusFlags = 'R';
async function login(usernameAG, worker) {
  try {
    statusFlags = 'P'
    const browser = await puppeteer.launch({
      args,
      headless,
      defaultViewport: null
    })

    const page = await browser.newPage()
    const birthday = new Date();
    const date1 = birthday.getTime();
    let element

    await page.goto(
      link,
      { waitUntil: 'networkidle2' }
    )
    console.log(await page.title());
    console.log(page.url());
    if (headless) {
      const pathPhoto = __dirname + '/img/captcha' + date1 + '.png'
      await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
      const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
      await captcha.screenshot({
        path: pathPhoto
      })
      await delay(2000)
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(sixAgenPass)
      await readImg(worker, pathPhoto)
        .then(async result => {
          console.log('IMG TXT', result)
          element = await page.$x(`//*[@id="txtCode"]`)
          await element[0].type(result)
          fs.unlink(pathPhoto, (err => { return; }));
        })
        .catch(function (err) {
          console.log(chalk.red(err))
          fs.unlink(pathPhoto, (err => { return; }));
          // cmd.runSync('npm run serve:restart');
        })

    } else {
      element = await page.$x(`//*[@id="txtUserName"]`)
      await element[0].type(usernameAG)
      element = await page.$x(`//*[@id="txtPassword"]`)
      await element[0].type(sixAgenPass)
      element = await page.$x(`//*[@id="btnSignIn"]`)
      await element[0].click()
    }

    await delay(2000)
    const title = await page.title()
    const urls = page.url()

    if (title === ':: Management ::') {
      browser.close();
      login(usernameAG, worker)
      return;
    }

    console.log('Page Title :' + title)
    console.log('Page URL : ' + urls)

    return { browser, page }
  } catch (error) {
    console.error(error)
    // cmd.runSync('npm run serve:restart');
  }
}

async function start() {
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })

  setInterval(async () => {
    try {
      if (statusFlags === 'R') {
        const customerPending = await Customer.find({ statusServe: "PENDING" });
        const alliancePending = await Alliance.find({ statusServe: "PENDING" });

        if (customerPending.length > 0) {
          const filterCustomerPending = await customerPending.filter(({ usernameAG }) => usernameAG === customerPending[0].usernameAG)
          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          console.log(chalk.green('START JOB CUSTOMER CREATE ', customerPending[0].usernameAG, new Date().toISOString()));
          const { browser, page } = await login(customerPending[0].usernameAG, worker)
          for (let data of filterCustomerPending) {
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
            console.log(chalk.green('START JOB CUSTOMER CREATE ', data.customerID, new Date().toISOString()));
            await createCustomer(page, link, data)
            console.log(chalk.green('END JOB CUSTOMER CREATE ', data.customerID, new Date().toISOString()));
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));

          }
          browser.close()
          statusFlags = 'R'
          console.log(chalk.green('END JOB CUSTOMER CREATE ', customerPending[0].usernameAG, new Date().toISOString()));
          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          // cmd.runSync('npm run serve:restart');
        } else if (alliancePending.length > 0) {

          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          console.log(chalk.green('START JOB SET ALLIANCE ZERO ', new Date().toISOString()));
          for (let data of alliancePending) {
            const { browser, page } = await login(data.usernameAG, worker)
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
            console.log(chalk.green('START JOB SET ALLIANCE ZERO', data.usernameAG, new Date().toISOString()));
            await setAllianceZero(page, link, data)
            console.log(chalk.green('END JOB SET ALLIANCE ZERO ', data.usernameAG, new Date().toISOString()));
            console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
          }
          statusFlags = 'R'
          browser.close()
          console.log(chalk.green('END JOB SET ALLIANCE ZERO ', new Date().toISOString()));
          console.log(chalk.cyan('\n----------------------------------------------------------------\n'));
        }
      }
    } catch (error) {
      console.log(chalk.red(error));
      // cmd.runSync('npm run serve:restart');
    }
  }, 2000);

}

start()
