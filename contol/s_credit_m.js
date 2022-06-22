const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userS = "ufrcb"
const userM = "ufrcb18"
const userA = "ufrcb18a1"
const passS = "168Ufa<>168++"
const passM = "66Pplsix168<>+"
const passA = "Win+168ufa66pp+"
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
	let moneyAdd = 5000

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
	// element = await page.$x(`//*[@id="btnUpdateC"]`)
	// await element[0].click()


})();
