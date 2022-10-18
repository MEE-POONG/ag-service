require('dotenv').config()
const delay = require("delay");
const chalk = require('chalk');
const Alliance = require('../models/alliance.model')

const { sixAgenPass, adminUser, adminPass } = process.env

exports.setUpAgent = async (page, link, data) => {
  try {

    await Alliance.updateOne({ _id: data._id }, { $set: { statusServe: 'WORKING', jobServe: 'START JOB' } })
    console.log(chalk.green('START SET UP AGENT'));

    await page.goto(`http://ufa66.office168.work/?action=login`, { waitUntil: 'networkidle2' });

    await Alliance.updateOne({ _id: data._id }, { $set: { jobServe: 'OPEN LINK' } })

    console.log('http://ufa66.office168.work/?action=login');
    console.log('username', adminUser);
    element = await page.$x(`//*[@name="username"]`);
    await element[0].type(adminUser);
    element = await page.$x(`//*[@name="password"]`);
    await element[0].type(adminPass);
    element = await page.$x(`//*[@name="login"]`);
    await element[0].click();

    await Alliance.updateOne({ _id: data._id }, { $set: { jobServe: 'LOGIN ufa66.office168' } })

    console.log('--- 1 ---');
    await delay(1000);
    await page.waitForXPath(`//a[contains(text(),'ตามลูกค้า')]`);
    element = await page.$x(`//a[contains(text(),'ตามลูกค้า')]`);
    await element[0].click();

    await Alliance.updateOne({ _id: data._id }, { $set: { jobServe: 'ตามลูกค้า' } })

    console.log('--- 2 ---');
    await delay(1000);
    await page.bringToFront();
    await page.goto(`http://ufa66.play168.xyz/__admin/?action=agent-list&game_id=1`, { waitUntil: 'networkidle2' });

    await Alliance.updateOne({ _id: data._id }, { $set: { jobServe: 'OPEN ufa66.play168.xyz agent-list&game_id=1' } })

    const found_1 = (await page.content()).match(data.usernameAG)
    if (found_1 !== null) {
      await Alliance.updateOne({ _id: data._id }, { $set: { statusServe: 'DONE', upSystem: true } })
      console.log(chalk.red('--- มีอยู่แล้ว ---'));
      return
    }

    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[1]/div/input`);
    await element[0].type(data.usernameAG);
    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[4]/div/input`);
    await element[0].type(`0`);
    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[5]/div/input`);

    await element[0].type(data.usernameAG);
    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[7]/div/input`);
    await element[0].type(sixAgenPass);
    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[8]/div/textarea`);
    await element[0].type(`_SubAg`);

    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[9]/div/input`);
    await element[0].type(data.usernameAG);
    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[6]/div/input`);
    await element[0].type(sixAgenPass);
    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[12]/div/input`);
    await element[0].type(`_SubAg`);

    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[13]/div/input`);
    await element[0].type(data.usernameAG + '****');
    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[14]/div/input`);
    await element[0].type(`1`);
    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[15]/div/input`);
    await element[0].type(`9999`);

    element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[17]/div/button`);
    await element[0].click();

    await Alliance.updateOne({ _id: data._id }, { $set: { jobServe: 'ยืนยัน' } })


    await delay(1000)

    const found_2 = (await page.content()).match(data.usernameAG)

    if (found_2 !== null) {
      await Alliance.updateOne({ _id: data._id }, { $set: { statusServe: 'DONE', upSystem: true } })
      console.log(chalk.red('--- สร้างสำเร็จ ---'));
      return
    } else {
      await Alliance.updateOne({ _id: data._id }, { $set: { statusServe: 'FAILED', upSystem: false } })
      console.log(chalk.red('--- สร้างไม่สำเร็จ ---'));
      return
    }

    return;
  } catch (error) {
    await Alliance.updateOne({ _id: data._id }, { $set: { statusServe: 'FAILED' } })
    console.log(chalk.red('ERROR SET UP AGENT', error));
    return;
  }
}

