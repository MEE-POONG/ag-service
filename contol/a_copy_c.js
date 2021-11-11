const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userA = "ufrcb18a1"
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
	await element[0].type(userA);
	element = await page.$x(`//*[@id="txtPassword"]`)
	await element[0].type(passA);
	element = await page.$x(`//*[@id="btnSignIn"]`)
	await element[0].click()
	console.log('login สำเร็จ');
	await delay(1000);

	await page.goto(agtest + `/_SubAg1/MemberSet.aspx?cName=ufrcb18a10&set=1`, {
		waitUntil: 'networkidle2'
	})
	await delay(1000);

	element = await page.$x(`//*[@id="txtUserName"]`)
	await element[0].type(`0`);
	element = await page.$x(`//*[@id="txtPassword"]`)
	await element[0].type(`Aa123456+`);
	element = await page.$x(`//*[@id="txtTotalLimit"]`)
	await element[0].type(`0`);

	// ยืนยัน
	// element = await page.$x(`//*[@id="btnSave"]`)
	// await element[0].click()



})();
