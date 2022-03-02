const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userA = "ufrcb38a2"
const passA = "Vip66ufa~168++"
const passPsd = "Vip66ufa~168++"
const passTop = "Vip66ufa~168++"
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
	await element[0].type(userA);
	element = await page.$x(`//*[@id="txtPassword"]`)
	await element[0].type(passA);
	element = await page.$x(`//*[@id="btnSignIn"]`)
	await element[0].click()
	console.log('login สำเร็จ');
	await delay(1000);
	// ufrcb38a2&from=02/01/2022&to=02/28/2022&catId=&gId=-1&checkAll=True
	await page.goto(agtest + `/_SubAg/SubAccsWinLose2.aspx?role=sa&userName=` + userA + `&from=02/01/2022&to=02/28/2022&catId=&gId=-1&checkAll=True`, {
		waitUntil: 'networkidle2'
	})

	await delay(1000);
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

	resultTable.shift();
	resultTable.pop();
	// //เอาช่อง 4 ยูสเซอร์ ช่อง 9 Balance	 ช่อง 10 Balance แสดงสำหรับ เติมไม่ได้
	// //ตัดข้อมูลทิ้ง
	console.log('--- ตัดข้อมูลทิ้ง ---');
	for (var i = 0; i < resultTable.length; i++) {
		if (resultTable[i][2] !== 'THB') {
			resultTable.splice(i, 1);
		}
	}
	await delay(1000);
	for (var i = 0; i < resultTable.length; i++) {
		console.log(i + 1, resultTable[i][0], " : ", resultTable[i][10], ": คืน :", resultTable[i][10] * 0.05);
	}

})();
