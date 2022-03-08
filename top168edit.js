const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userA = "ufrcbvip"
const passA = "Pp123456++"
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
	await delay(5000);




	// for (let index = 195; index < 210; index++) {
	// 	let number = index.toString().padStart(3, '0').toString()
	// 	console.log(`/_SubAg1/MemberSet.aspx?userName=ufrcbxb8` + number + `&set=1`);
		await page.goto(agtest + `/_Part_Sub/SubAccsWinLose2.aspx?role=sa&userName=` + agen + `&from=02/28/2022&to=03/06/2022&userID=` + master + `&checkAll=True`, {
			waitUntil: 'networkidle2'
		})
	// 	await delay(5000);
	// 	// SA GAMING
	// 	// element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[10]/td/table/tbody/tr[4]/td/table/tbody/tr[1]/td/table`);
	// 	element = await page.$x(`//table[@onclick="toggleSetting2('trRAR',this,'btnUpdRAR')"]`);
	// 	await element[0].click();
	// 	console.log('เปิด SA GAMING สำเร็จ');
	// 	//ปรับเซอเซน 0
	// 	element = await page.select("select#lstCommissionRAR", "0")
	// 	//ปิด เปิด
	// 	element = await page.$x(`//*[@id="btnUpdRAR"]`)
	// 	await element[0].click()
	// 	await delay(5000);
	// }
	// OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRAR',this,'btnUpdRAR')"]`);
	// await element[0].click();



})();
