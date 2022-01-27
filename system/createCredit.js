

require('dotenv').config()
const Credit = require('../models/credit.model')
const delay = require("delay");
const chalk = require('chalk');


exports.createCredit = async (page, link, data) => {
  try {
    console.log(chalk.green('START CREATE CREDIT'));
    await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'WORKING', jobServe: 'START JOB' } })

    console.log('--- ------------------------เติมเครดิต------------------------ ---');
    await page.goto(link + `/_Age1/AgentSet.aspx?userName=` + data.usernameAG + `&set=1`, {
      waitUntil: 'networkidle2'
    })

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'OPEN LINK' } })

    await delay(1000);

    await page.waitForXPath(`//*[@id="txtTotalLimit"]`);
    [elements] = await page.$x(`//*[@id="txtTotalLimit"]`);

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'GET TOTAL LIMIT' } });

    let result = await page.evaluate(element => element.value, elements);
    moneyOld = Number(result.toString().replace(/,/g, ''));

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'GET OLD LIMIT' } })

    console.log("moneyOld : ", moneyOld);
    moneyOld += +data.credit

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'NEW LIMIT' } })

    console.log("moneyNew 3 : ", moneyOld);
    let sumAdd = moneyOld.toString()
    await delay(100);
    element = await page.$x(`//*[@id="txtTotalLimit"]`);
    await element[0].click({ clickCount: 3 })
    await page.keyboard.press('Backspace')
    await element[0].type(sumAdd);

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'TYPE LIMIT' } })


    //ยืนยัน
    console.log('--- ------------------------ ยืนยัน ------------------------ ---');
    element = await page.$x(`//*[@id="btnUpdateC"]`)
    await element[0].click()

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'ยืนยัน' } })

    await delay(1000)

    element = await page.waitForXPath(`//*[@id="lblStatus"]`);
    [element] = await page.$x(`//*[@id="lblStatus"]`);
    result = await page.evaluate(element => element.textContent, element);

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'GET RESULT' } })

    console.log(chalk.yellow(result));
    
    if (result === "Profile updated successfully." || result === "อัพเดตข้อมูลเรียบร้อย") {
      console.log(chalk.green('--- สร้างสำเร็จ ---'));
      await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'DONE', statusAG: result } })
    } else {
      console.log(chalk.red('--- สร้างไม่สำเร็จ ---'));
      await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'FAILED', statusAG: result } })
    }
    console.log(chalk.green('CLOSE CREATE CREDIT', data.usernameAG));
    return;
  } catch (error) {
    await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'FAILED', statusAG: 'เติมไม่สำเร็จ' } })
    console.log(chalk.red('ERROR CREATE CREDIT', error));
    return;
  }
}
