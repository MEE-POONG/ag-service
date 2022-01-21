require('dotenv').config()
const Customer = require('../models/customer.model')
const delay = require("delay");
const chalk = require('chalk');


exports.createCustomer = async (page, link, data) => {
  try {
    console.log(chalk.green('START CREAT CUSTOMER'));
    await Customer.updateOne({ _id: data._id }, { $set: { statusServe: 'WORKING' } })
    if (!data.setZero) {
      await Customer.updateOne({ _id: data._id }, { $set: { statusServe: 'FAILED', statusAG: 'ไม่มี USER ZERO' } })
      console.log(chalk.red('ERROR CREATE CUSTOMER', 'ไม่มี USER ZERO'));
      return;
    }
    await page.goto(link + `/_SubAg1/MemberSet.aspx?cName=` + data.setZero + `&set=1`, {
      waitUntil: 'networkidle2'
    })
    element = await page.$x(`//*[@id="txtUserName"]`)
    await element[0].type(data.customerTAG)
    element = await page.$x(`//*[@id="txtPassword"]`)
    await element[0].type(`Aa123456+`)
    element = await page.$x(`//*[@id="txtTotalLimit"]`)
    await element[0].type(`0`)
    element = await page.$x(`//*[@id="btnSave"]`)
    await element[0].click()
    await delay(1000)

    element = await page.waitForXPath(`//*[@id="lblStatus"]`);
    [element] = await page.$x(`//*[@id="lblStatus"]`);
    result = await page.evaluate(element => element.textContent, element);

    console.log(chalk.yellow(result));

    if (result === "Profile updated successfully." || result === "อัพเดตข้อมูลเรียบร้อย") {
      console.log(chalk.green('--- สร้างสำเร็จ ---'));
      await Customer.updateOne({ _id: data._id }, { $set: { statusServe: 'DONE', statusAG: result } })
    } else {
      console.log(chalk.red('--- สร้างไม่สำเร็จ ---'));

      await Customer.updateOne({ _id: data._id }, { $set: { statusServe: 'FAILED', statusAG: result } })
    }

    console.log(chalk.green('CLOSE CREATE CUSTOMER', data.customerTAG));
    return;
  } catch (error) {
    console.log(chalk.red('ERROR CREATE CUSTOMER', error));
    return;
  }
}
