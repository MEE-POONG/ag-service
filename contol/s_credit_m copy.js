const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userS = "ufrcb"
const userM = "ufrcb1"
const userA = "ufrcb18a0"
const passS = "168Ufavip168++"
const passM = "66Pplsix168<>+"
const passA = "Vip66ufa~168++"
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
	element = await page.$x(`//*[@id="txtSearch"]`)
	await element[0].type(userM); +
		console.log('--- txtSearch ---');
	element = await page.$x(`//*[@id="btnSubmit"]`)
	await element[0].click()
	console.log('--- btnSubmit ---');
	await delay(1000);
	// await page.waitForXPath(`//*[@id="MemberList_cm1_g_ctl0` + 2 + `_btnAcc"]`);
	// [element] = await page.$x(`//*[@id="MemberList_cm1_g_ctl0` + 2 + `_btnAcc"]`);
	// result = await page.evaluate(element => element.textContent, element);
	// console.log('--- 552 ---', result);
	// [element] = await page.$x(`//*[@id="MemberList_cm1_g"]/tbody/tr[` + 2 + `]/td[3]/table/tbody/tr/td[1]/a`);
	// result = await page.evaluate(element => element.textContent, element);
	// console.log('--- 85 ---', result);
	// [element] = await page.$x(`//*[@id="MemberList_cm1_g"]/tbody/tr[` + 2 + `]/td[8]/span`);
	// result = await page.evaluate(element => element.textContent, element);
	// console.log('--- 86 ---', result);

	// await page.waitForXPath(`//*[@id="MemberList_cm1_g_ctl0` + 3 + `_btnAcc"]`);
	// [element] = await page.$x(`//*[@id="MemberList_cm1_g_ctl0` + 3 + `_btnAcc"]`);
	// result = await page.evaluate(element => element.textContent, element);
	// console.log('--- 552 ---', result);
	// [element] = await page.$x(`//*[@id="MemberList_cm1_g"]/tbody/tr[` + 3 + `]/td[3]/table/tbody/tr/td[1]/a`);
	// result = await page.evaluate(element => element.textContent, element);
	// console.log('--- 85 ---', result);
	// [element] = await page.$x(`//*[@id="MemberList_cm1_g"]/tbody/tr[` + 3 + `]/td[8]/span`);
	// result = await page.evaluate(element => element.textContent, element);
	// console.log('--- 86 ---', result);
	// 
	console.log('--- 101 ---');

	let resultTable = await page.evaluate(() => {
		const rows = document.querySelectorAll('#MemberList_cm1_g tr');
		return Array.from(rows, row => {
			const columns = row.querySelectorAll('td');
			console.log("columns : ", columns);
			return Array.from(columns, column => column.innerText);
		});
	});
	console.log('--- 111 ---');
	resultTable.shift();
	resultTable.pop();
	console.log("120 resultTable[2];", resultTable.length);
	for (var i = 0; i < resultTable.length; i++) {
		console.log("นอก IF : ", i, resultTable[i][1]);
		if (resultTable[i][1] === 'Copy') {
			console.log(i, " : ", resultTable[i]);
			resultTable.splice(i, 1);
		}
	}
	console.log("คงเหลือ : ", resultTable);
	//*[@id="MemberList_cm1_g"]/tbody/tr[2]/td[3]/table/tbody/tr/td[1]/a
	// /html/body/form/div[3]/table/tbody/tr[4]/td/table/tbody/tr/td/table/tbody/tr[1]/td/table/tbody/tr[2]/td[7]/span
	// MemberList_cm1_g_ctl02_btnAcc
	// if (userM === result) {
	// 	await page.waitForXPath(`// *[@id="MemberList_cm1_g"]/tbody/tr[2]/td[3]/table/tbody/tr/td[1]/a`);
	// 	[element] = await page.$x(`// *[@id="MemberList_cm1_g"]/tbody/tr[2]/td[3]/table/tbody/tr/td[1]/a`);
	// 	result = await page.evaluate(element => element.textContent, element);
	// 	console.log('--- 88 ---', result);
	// }

	//*[@id="MemberList_cm1_g"]/tbody/tr[3]/td[3]/table/tbody/tr/td[1]/a
	//*[@id="MemberList_cm1_g"]/tbody/tr[3]/td[7]/span
	//*[@id="MemberList_cm1_g"]/tbody/tr[3]/td[8]/span

	//ยืนยัน
	//   element = await page.$x(`//*[@id="btnSave"]`)
	//   await element[0].click()


})();
