
const UpCreditAgent = async (page, link, data) => {
  try {

    console.log(chalk.green('START CREATE CREDIT'));
    await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'WORKING', jobServe: 'START JOB' } })

    console.log('--- ------------------------เติมเครดิต------------------------ ---');
    const money = data.credit
    const moneyAdd = money * 4
    console.log(moneyAdd);

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'OPEN LINK' } })
    await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'TYPE USER NAME' } })
    element = await page.$x(`//*[@id="txtUserName"]`)
    await element[0].type(userM);
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'TYPE PASSWORD' } })
    element = await page.$x(`//*[@id="txtPassword"]`)
    await element[0].type(passM);
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'SUBMIT LOGIN' } })
    element = await page.$x(`//*[@id="btnSignIn"]`)
    await element[0].click()
    console.log('login สำเร็จ');
    await delay(1000);

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'โอนยอด' + userM } })
    /////////////////////////////////////โอนยอด////////////////////////////////////////////////////
    await page.goto(agtest + `/_Age/AccBal.aspx?role=ag&userName=` + userM, {
      waitUntil: 'networkidle2'
    })
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'AccBal_cm1_txtSearch' } })
    await page.waitForXPath(`//*[@id="AccBal_cm1_txtSearch"]`, { timeout: 60000 });
    element = await page.$x(`//*[@id="AccBal_cm1_txtSearch"]`)
    await element[0].type(userA);
    console.log('--- txtSearch ---');
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'AccBal_cm1_btnSubmit' } })
    await page.waitForXPath(`//*[@id="AccBal_cm1_btnSubmit"]`, { timeout: 60000 });
    element = await page.$x(`//*[@id="AccBal_cm1_btnSubmit"]`)
    await element[0].click()
    console.log('--- 139 ---');
    await delay(1000);
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'AccBal_cm1_g' } })
    resultTransfer = await page.evaluate(() => {
      const rows = document.querySelectorAll('#AccBal_cm1_g tr');
      return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        console.log("columns : ", columns);
        return Array.from(columns, column => column.innerText);
      });
    });
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'SHIFT DATA 1' } })
    console.log('--- 150 ---');
    resultTransfer.shift();
    console.log(resultTransfer);
    //ตัดข้อมูลทิ้ง i+2 จะได้คลาสที่ถูกต้อง
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- ตัดข้อมูลทิ้ง i+2 จะได้คลาสที่ถูกต้อง ---' } })
    console.log('--- ตัดข้อมูลทิ้ง i+2 จะได้คลาสที่ถูกต้อง ---');
    for (var i = 0; i < resultTransfer.length; i++) {
      console.log(resultTransfer[i][1] == userA);
      if (resultTransfer[i][1] == userA) {
        console.log(i);
        console.log(resultTransfer[i][1]);
        console.log(resultTransfer[i][4]);
        console.log(resultTransfer[i][5]);
        listNum = i + 2
      }
    }
    await delay(1000);
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'selectList' } })
    selectList = ` #AccBal_cm1_g_ctl0` + listNum + `_chkPay`
    console.log("165 : ", selectList);
    await page.click(selectList);

    // ยืนยัน Transfer
    console.log('--- ยืนยัน Transfer ---');
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- ยืนยัน Transfer ---' } })
    await page.waitForXPath(`//*[@id="AccBal_cm1_btnPayAll"]`, { timeout: 60000 });
    element = await page.$x(`//*[@id="AccBal_cm1_btnPayAll"]`)
    await element[0].click()
    await delay(3000);

    // หลังโอนยอดเสร็จ จะดึงบานล้านยอดที่ได้จากหน้าโอนยอดมา
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- หลังโอนยอดเสร็จ จะดึงบานล้านยอดที่ได้จากหน้าโอนยอดมา ---' } })
    resultTransfer = await page.evaluate(() => {
      const rows = document.querySelectorAll('#AccBal_cm1_g tr');
      return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        console.log("columns : ", columns);
        return Array.from(columns, column => column.innerText);
      });
    });
    console.log('--- 150 ---');
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'SHIFT DATA 2' } })
    resultTransfer.shift();
    console.log(resultTransfer);

    console.log('--- หลังโอนยอดเสร็จ จะดึงบานล้านยอดที่ได้จากหน้าโอนยอดมา ---');
    console.log('resultTransfer[0][5] === 0', +resultTransfer[0][5] !== 0);

    // ////////// จบโอนยอด
    const isUpMaster = +resultTransfer[0][5] === 0
    // // resultTransfer[i][5] ไม่เป็น 0 ให้แจ้งโอนยอดไม่สำเร็จเติมเครดิตมาสเตอร์
    // // ซีเนี่ยร์เติมเข้ามาสเตอร์


    if (isUpMaster) {
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'เช็คบาลาน' } })

      /////////////////// เช็คบาลาน /////////////////
      await page.goto(agtest + `/_Age/AgentList.aspx?type=agent&role=ag&userName=` + userM, {
        waitUntil: 'networkidle2'
      })
      await delay(1000);
      //บรรทัด 113 เข้าเช็คบาล้านยูสเอเย่น
      console.log('--- บรรทัด 113 เข้าเช็คบาล้านยูสเอเย่น ---');
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- บรรทัด 113 เข้าเช็คบาล้านยูสเอเย่น ---' } })
      element = await page.$x(`//*[@id="txtSearch"]`)
      await element[0].type(userA);
      console.log('--- txtSearch ---');
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- btnSubmit เข้าเช็คบาล้านยูสเอเย่น ---' } })
      element = await page.$x(`//*[@id="btnSubmit"]`)
      await element[0].click()
      console.log('--- btnSubmit ---');
      await delay(1000);
      console.log('--- 101 ---');
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'MemberList_cm1_g' } })
      resultTable = await page.evaluate(() => {
        const rows = document.querySelectorAll('#MemberList_cm1_g tr');
        return Array.from(rows, row => {
          const columns = row.querySelectorAll('td');
          console.log("columns : ", columns);
          return Array.from(columns, column => column.innerText);
        });
      });
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'SHIFT 3' } })
      console.log('--- 89 --- : ', resultTable);
      resultTable.shift();
      resultTable.pop();
      console.log('--- 92 --- : ', resultTable);
      //เอาช่อง 4 ยูสเซอร์ ช่อง 9 Balance	 ช่อง 10 Balance แสดงสำหรับ เติมไม่ได้
      //ตัดข้อมูลทิ้ง
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- ตัดข้อมูลทิ้ง ---' } })
      console.log('--- ตัดข้อมูลทิ้ง ---');
      for (var i = 0; i < resultTable.length; i++) {
        if (resultTable[i][1] == 'Copy') {
          resultTable.splice(i, 1);
        }
      }
      // console.log(resultTable);
      //วนหายูสที่ตรงกัน returnd กลับ หากช่อง 8 เยอะว่าช่อง 9 ให้โอนยอด
      console.log('--- วนหายูสที่ตรงกัน returnd กลับ หากช่อง 8 เยอะว่าช่อง 9 ให้โอนยอด ---');
      console.log('--- 101 --- : ', resultTable);
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- วนหายูสที่ตรงกัน returnd กลับ หากช่อง 8 เยอะว่าช่อง 9 ให้โอนยอด ---' } })
      for (var i = 0; i < resultTable.length; i++) {
        if (resultTable[i][3] == userA) {
          console.log(i);
          console.log(resultTable[i][3]);
          console.log(resultTable[i][8]);
          console.log(resultTable[i][9]);
        }
      }

      //บรรทัด 111 สิ้นสุดจาการค้นหายูสเอเย่นแล้วเอาบาล้าน Credit Limit ออกมา
      // ข้างหน้ามากกว่าข้างหลัง แจ้งพนักงาน
      console.log('--- บรรทัด 111 สิ้นสุดจาการค้นหายูสเอเย่นแล้วเอาบาล้าน Credit Limit ออกมา ---');

      // ////////////////////////////////////เติมเครดิต///////////////////////////////////////////
      console.log('--- ------------------------เติมเครดิต------------------------ ---');
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- เติมเครดิต ---' } })
      await page.goto(agtest + `/_Age1/AgentSet.aspx?userName=` + userA + `&set=1`, {
        waitUntil: 'networkidle2'
      })
      await delay(1000);

      await page.waitForXPath(`//*[@id="txtTotalLimit"]`);
      [elements] = await page.$x(`//*[@id="txtTotalLimit"]`);
      let result = await page.evaluate(element => element.value, elements);
      moneyOld = Number(result.toString().replace(/,/g, ''));
      console.log("moneyOld 2 : ", moneyOld);
      moneyOld += +moneyAdd
      console.log("moneyOld 3 : ", moneyOld);
      let sumAdd = moneyOld.toString()
      await delay(100);
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- txtTotalLimit ---' } })
      element = await page.$x(`//*[@id="txtTotalLimit"]`);
      await element[0].click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await element[0].type(sumAdd);
      // moneyOld ยอดเครดิตจำกัดปัจจุบัน ต้องน้อยกว่า ยอด Max
      // ถ้าไม่ ให้แจ้งว่าเครดิตใหญ่หมด

      //ยืนยัน
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- ยืนยัน  btnUpdateC ---' } })
      console.log('--- ------------------------ ยืนยัน ------------------------ ---');
      element = await page.$x(`//*[@id="btnUpdateC"]`)
      await element[0].click()


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

    } else {
      await browser.close();
      await UpCreditMaster(userS, money * 100)
    }
  } catch (error) {
    await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'FAILED', statusAG: 'เติมไม่สำเร็จ' } })
    console.log(chalk.red('ERROR CREATE CREDIT', error));
    return;
  }


}

UpCreditAgent()

const UpCreditMaster = async (userS, moneyAdd) => {

  try {


    console.log(moneyAdd)
    if (moneyAdd > 1e6) {
      moneyAdd = 1e6
    }

    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 5000 }, args });
    const page = await browser.newPage();
    let element, formElement, tabs, resultTable, resultTransfer, listNum, selectList;
    await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

    element = await page.$x(`//*[@id="txtUserName"]`)
    await element[0].type(userS);
    element = await page.$x(`//*[@id="txtPassword"]`)
    await element[0].type(passS);
    element = await page.$x(`//*[@id="btnSignIn"]`)
    await element[0].click()
    console.log('login สำเร็จ');
    await delay(1000);

    await page.goto(agtest + `/_Part/MasterList.aspx?type=master&role=pa&userName=` + userS, {
      waitUntil: 'networkidle2'
    })
    await delay(1000);
    ////////////////////////////////////////ค้นหายอดบาล้าน/////////////////////////////////////////////////

    element = await page.$x(`//*[@id="txtSearch"]`)
    await element[0].type(userM);
    console.log('--- txtSearch ---');
    element = await page.$x(`//*[@id="btnSubmit"]`)
    await element[0].click()
    console.log('--- btnSubmit ---');
    await delay(1000);
    console.log('--- 80 ---');
    await delay(1000);

    resultTable = await page.evaluate(() => {
      const rows = document.querySelectorAll('#MemberList_cm1_g tr');
      return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        console.log("columns : ", columns);
        return Array.from(columns, column => column.innerText);
      });
    });
    console.log('--- 90 ---');
    resultTable.shift();
    resultTable.pop();
    //ตัดข้อมูลทิ้ง
    for (var i = 0; i < resultTable.length; i++) {
      if (resultTable[i][1] == 'Copy') {
        resultTable.splice(i, 1);
      }
    }
    console.log("97 : ", resultTable);
    // console.log(resultTable);
    //วนหายูสที่ตรงกัน returnd กลับ หากช่อง 8 เยอะว่าช่อง 9 ให้โอนยอด
    for (var i = 0; i < resultTable.length; i++) {
      if (resultTable[i][3] == userM) {
        console.log(i);
        console.log(resultTable[i][3]);
        console.log(resultTable[i][8]);
        console.log(resultTable[i][9]);
      }
    }
    /////////////////////////////////////โอนยอด////////////////////////////////////////////////////
    await page.goto(agtest + `/_Part/AccBal.aspx?role=pa&userName=` + userS, {
      waitUntil: 'networkidle2'
    })
    element = await page.$x(`//*[@id="AccBal_cm1_txtSearch"]`)
    await element[0].type(userM);
    console.log('--- txtSearch ---');
    element = await page.$x(`//*[@id="AccBal_cm1_btnSubmit"]`)
    await element[0].click()
    console.log('--- 119 ---');
    await delay(1000);
    resultTransfer = await page.evaluate(() => {
      const rows = document.querySelectorAll('#AccBal_cm1_g tr');
      return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        console.log("columns : ", columns);
        return Array.from(columns, column => column.innerText);
      });
    });
    console.log(resultTransfer);
    console.log('--- 130 ---');
    resultTransfer.shift();
    //ตัดข้อมูลทิ้ง i+2 จะได้คลาสที่ถูกต้อง
    for (var i = 0; i < resultTransfer.length; i++) {
      if (resultTransfer[i][1] == userM) {
        console.log(i);
        console.log(resultTransfer[i][1]);
        console.log(resultTransfer[i][4]);
        console.log(resultTransfer[i][5]);
        listNum = i + 2

      }
    }
    selectList = ` #AccBal_cm1_g_ctl0` + listNum + `_chkPay`
    await page.click(selectList);

    //ยืนยัน Transfer
    //   element = await page.$x(`//*[@id="AccBal_cm1_btnPayAll"]`)
    //   await element[0].click()
    await delay(1000);
    ////////////////////////////////////เติมเครดิต///////////////////////////////////////////
    await page.goto(agtest + `/_Part1/MasterSet.aspx?userName=` + userM + `&set=1`, {
      waitUntil: 'networkidle2'
    })
    await delay(1000);

    await page.waitForXPath(`//*[@id="txtTotalLimit"]`);
    [elements] = await page.$x(`//*[@id="txtTotalLimit"]`);
    let result = await page.evaluate(element => element.value, elements);
    moneyOld = Number(result.toString().replace(/,/g, ''));
    moneyOld += +moneyAdd
    console.log("moneyOld 3 : ", moneyOld);
    let sumAdd = moneyOld.toString()
    await delay(100);
    element = await page.$x(`//*[@id="txtTotalLimit"]`);
    await element[0].click({ clickCount: 3 })
    await page.keyboard.press('Backspace')
    await element[0].type(sumAdd);
    //ยืนยัน
    element = await page.$x(`//*[@id="btnUpdateC"]`)
    await element[0].click()

    await delay(3000);

    element = await page.waitForXPath(`//*[@id="lblStatus"]`, { visible: true });
    [element] = await page.$x(`//*[@id="lblStatus"]`);
    result = await page.evaluate(element => element.textContent, element);


    await browser.close();
    await UpCreditAgentLast()
    return;

  } catch (error) {
    await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'FAILED', statusAG: 'เติมไม่สำเร็จ' } })
    console.log(chalk.red('ERROR CREATE CREDIT', error));
    return;

  }
}


const UpCreditAgentLast = async () => {
  try {

    console.log(chalk.green('START CREATE CREDIT'));
    await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'WORKING', jobServe: 'START JOB' } })

    console.log('--- ------------------------เติมเครดิต------------------------ ---');
    const money = data.credit
    const moneyAdd = money * 4
    console.log(moneyAdd);

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'OPEN LINK' } })
    await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'TYPE USER NAME' } })
    element = await page.$x(`//*[@id="txtUserName"]`)
    await element[0].type(userM);
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'TYPE PASSWORD' } })
    element = await page.$x(`//*[@id="txtPassword"]`)
    await element[0].type(passM);
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'SUBMIT LOGIN' } })
    element = await page.$x(`//*[@id="btnSignIn"]`)
    await element[0].click()
    console.log('login สำเร็จ');
    await delay(1000);

    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'โอนยอด' + userM } })
    /////////////////////////////////////โอนยอด////////////////////////////////////////////////////
    await page.goto(agtest + `/_Age/AccBal.aspx?role=ag&userName=` + userM, {
      waitUntil: 'networkidle2'
    })
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'AccBal_cm1_txtSearch' } })
    await page.waitForXPath(`//*[@id="AccBal_cm1_txtSearch"]`, { timeout: 60000 });
    element = await page.$x(`//*[@id="AccBal_cm1_txtSearch"]`)
    await element[0].type(userA);
    console.log('--- txtSearch ---');
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'AccBal_cm1_btnSubmit' } })
    await page.waitForXPath(`//*[@id="AccBal_cm1_btnSubmit"]`, { timeout: 60000 });
    element = await page.$x(`//*[@id="AccBal_cm1_btnSubmit"]`)
    await element[0].click()
    console.log('--- 139 ---');
    await delay(1000);
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'AccBal_cm1_g' } })
    resultTransfer = await page.evaluate(() => {
      const rows = document.querySelectorAll('#AccBal_cm1_g tr');
      return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        console.log("columns : ", columns);
        return Array.from(columns, column => column.innerText);
      });
    });
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'SHIFT DATA 1' } })
    console.log('--- 150 ---');
    resultTransfer.shift();
    console.log(resultTransfer);
    //ตัดข้อมูลทิ้ง i+2 จะได้คลาสที่ถูกต้อง
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- ตัดข้อมูลทิ้ง i+2 จะได้คลาสที่ถูกต้อง ---' } })
    console.log('--- ตัดข้อมูลทิ้ง i+2 จะได้คลาสที่ถูกต้อง ---');
    for (var i = 0; i < resultTransfer.length; i++) {
      console.log(resultTransfer[i][1] == userA);
      if (resultTransfer[i][1] == userA) {
        console.log(i);
        console.log(resultTransfer[i][1]);
        console.log(resultTransfer[i][4]);
        console.log(resultTransfer[i][5]);
        listNum = i + 2
      }
    }
    await delay(1000);
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'selectList' } })
    selectList = ` #AccBal_cm1_g_ctl0` + listNum + `_chkPay`
    console.log("165 : ", selectList);
    await page.click(selectList);

    // ยืนยัน Transfer
    console.log('--- ยืนยัน Transfer ---');
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- ยืนยัน Transfer ---' } })
    await page.waitForXPath(`//*[@id="AccBal_cm1_btnPayAll"]`, { timeout: 60000 });
    element = await page.$x(`//*[@id="AccBal_cm1_btnPayAll"]`)
    await element[0].click()
    await delay(3000);

    // หลังโอนยอดเสร็จ จะดึงบานล้านยอดที่ได้จากหน้าโอนยอดมา
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- หลังโอนยอดเสร็จ จะดึงบานล้านยอดที่ได้จากหน้าโอนยอดมา ---' } })
    resultTransfer = await page.evaluate(() => {
      const rows = document.querySelectorAll('#AccBal_cm1_g tr');
      return Array.from(rows, row => {
        const columns = row.querySelectorAll('td');
        console.log("columns : ", columns);
        return Array.from(columns, column => column.innerText);
      });
    });
    console.log('--- 150 ---');
    await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'SHIFT DATA 2' } })
    resultTransfer.shift();
    console.log(resultTransfer);

    console.log('--- หลังโอนยอดเสร็จ จะดึงบานล้านยอดที่ได้จากหน้าโอนยอดมา ---');
    console.log('resultTransfer[0][5] === 0', +resultTransfer[0][5] !== 0);

    // ////////// จบโอนยอด
    const isUpMaster = +resultTransfer[0][5] === 0
    // // resultTransfer[i][5] ไม่เป็น 0 ให้แจ้งโอนยอดไม่สำเร็จเติมเครดิตมาสเตอร์
    // // ซีเนี่ยร์เติมเข้ามาสเตอร์


    if (isUpMaster) {
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'เช็คบาลาน' } })

      /////////////////// เช็คบาลาน /////////////////
      await page.goto(agtest + `/_Age/AgentList.aspx?type=agent&role=ag&userName=` + userM, {
        waitUntil: 'networkidle2'
      })
      await delay(1000);
      //บรรทัด 113 เข้าเช็คบาล้านยูสเอเย่น
      console.log('--- บรรทัด 113 เข้าเช็คบาล้านยูสเอเย่น ---');
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- บรรทัด 113 เข้าเช็คบาล้านยูสเอเย่น ---' } })
      element = await page.$x(`//*[@id="txtSearch"]`)
      await element[0].type(userA);
      console.log('--- txtSearch ---');
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- btnSubmit เข้าเช็คบาล้านยูสเอเย่น ---' } })
      element = await page.$x(`//*[@id="btnSubmit"]`)
      await element[0].click()
      console.log('--- btnSubmit ---');
      await delay(1000);
      console.log('--- 101 ---');
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'MemberList_cm1_g' } })
      resultTable = await page.evaluate(() => {
        const rows = document.querySelectorAll('#MemberList_cm1_g tr');
        return Array.from(rows, row => {
          const columns = row.querySelectorAll('td');
          console.log("columns : ", columns);
          return Array.from(columns, column => column.innerText);
        });
      });
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: 'SHIFT 3' } })
      console.log('--- 89 --- : ', resultTable);
      resultTable.shift();
      resultTable.pop();
      console.log('--- 92 --- : ', resultTable);
      //เอาช่อง 4 ยูสเซอร์ ช่อง 9 Balance	 ช่อง 10 Balance แสดงสำหรับ เติมไม่ได้
      //ตัดข้อมูลทิ้ง
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- ตัดข้อมูลทิ้ง ---' } })
      console.log('--- ตัดข้อมูลทิ้ง ---');
      for (var i = 0; i < resultTable.length; i++) {
        if (resultTable[i][1] == 'Copy') {
          resultTable.splice(i, 1);
        }
      }
      // console.log(resultTable);
      //วนหายูสที่ตรงกัน returnd กลับ หากช่อง 8 เยอะว่าช่อง 9 ให้โอนยอด
      console.log('--- วนหายูสที่ตรงกัน returnd กลับ หากช่อง 8 เยอะว่าช่อง 9 ให้โอนยอด ---');
      console.log('--- 101 --- : ', resultTable);
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- วนหายูสที่ตรงกัน returnd กลับ หากช่อง 8 เยอะว่าช่อง 9 ให้โอนยอด ---' } })
      for (var i = 0; i < resultTable.length; i++) {
        if (resultTable[i][3] == userA) {
          console.log(i);
          console.log(resultTable[i][3]);
          console.log(resultTable[i][8]);
          console.log(resultTable[i][9]);
        }
      }

      //บรรทัด 111 สิ้นสุดจาการค้นหายูสเอเย่นแล้วเอาบาล้าน Credit Limit ออกมา
      // ข้างหน้ามากกว่าข้างหลัง แจ้งพนักงาน
      console.log('--- บรรทัด 111 สิ้นสุดจาการค้นหายูสเอเย่นแล้วเอาบาล้าน Credit Limit ออกมา ---');

      // ////////////////////////////////////เติมเครดิต///////////////////////////////////////////
      console.log('--- ------------------------เติมเครดิต------------------------ ---');
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- เติมเครดิต ---' } })
      await page.goto(agtest + `/_Age1/AgentSet.aspx?userName=` + userA + `&set=1`, {
        waitUntil: 'networkidle2'
      })
      await delay(1000);

      await page.waitForXPath(`//*[@id="txtTotalLimit"]`);
      [elements] = await page.$x(`//*[@id="txtTotalLimit"]`);
      let result = await page.evaluate(element => element.value, elements);
      moneyOld = Number(result.toString().replace(/,/g, ''));
      console.log("moneyOld 2 : ", moneyOld);
      moneyOld += +moneyAdd
      console.log("moneyOld 3 : ", moneyOld);
      let sumAdd = moneyOld.toString()
      await delay(100);
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- txtTotalLimit ---' } })
      element = await page.$x(`//*[@id="txtTotalLimit"]`);
      await element[0].click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await element[0].type(sumAdd);
      // moneyOld ยอดเครดิตจำกัดปัจจุบัน ต้องน้อยกว่า ยอด Max
      // ถ้าไม่ ให้แจ้งว่าเครดิตใหญ่หมด

      //ยืนยัน
      await Credit.updateOne({ _id: data._id }, { $set: { jobServe: '--- ยืนยัน  btnUpdateC ---' } })
      console.log('--- ------------------------ ยืนยัน ------------------------ ---');
      element = await page.$x(`//*[@id="btnUpdateC"]`)
      await element[0].click()


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

    } else {
      await browser.close();
      await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'FAILED', statusAG: 'เติมไม่สำเร็จ' } })
      console.log(chalk.red('ERROR CREATE CREDIT', error));
    }
  } catch (error) {
    await browser.close();
    await Credit.updateOne({ _id: data._id }, { $set: { statusServe: 'FAILED', statusAG: 'เติมไม่สำเร็จ' } })
    console.log(chalk.red('ERROR CREATE CREDIT', error));
    return;
  }


}
