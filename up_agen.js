const delay = require("delay");
const puppeteer = require('puppeteer'); +
	require('dotenv').config()
const { topMasterPass, topAgenPass, sixMasterPass, sixAgenPass, adminuser, adminpass } = process.env
const usernameAG = "ufrcb0"
const webname = "UFA-66"
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

	const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args });
	const page = await browser.newPage();
	let element, formElement, tabs;

	await page.goto(`http://ufa66.office168.work/?action=login`, { waitUntil: 'networkidle2' });
	element = await page.$x(`//*[@name="username"]`);
	await element[0].type(adminuser);
	element = await page.$x(`//*[@name="password"]`);
	await element[0].type(adminpass);
	element = await page.$x(`//*[@name="login"]`);
	await element[0].click();
	console.log('--- 1 ---');
	await delay(1000);
	await page.waitForXPath(`//a[contains(text(),'ตามลูกค้า')]`);
	element = await page.$x(`//a[contains(text(),'ตามลูกค้า')]`);
	await element[0].click();
	console.log('--- 2 ---');
	await delay(1000);
	await page.bringToFront();
	await page.goto(`http://ufa66.play168.xyz/__admin/?action=agent-list&game_id=1`, { waitUntil: 'networkidle2' });
	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[1]/div/input`);
	await element[0].type(usernameAG);
	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[2]/div/input`);
	await element[0].type(`0`);
	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[4]/div/input`);
	await element[0].type(usernameAG);
	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[5]/div/input`);
	await element[0].type(webname === "UFA-66" ? sixAgenPass : webname === "TOP-168" ? topAgenPass : "");
	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[7]/div/textarea`);
	await element[0].type(`_SubAg`);

	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[8]/div/input`);
	await element[0].type(usernameAG);
	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[9]/div/input`);
	await element[0].type(webname === "UFA-66" ? sixAgenPass : webname === "TOP-168" ? topAgenPass : "");
	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[11]/div/input`);
	await element[0].type(`_SubAg`);

	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[12]/div/input`);
	await element[0].type(usernameAG);
	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[13]/div/input`);
	await element[0].type(`1`);
	element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[14]/div/input`);
	await element[0].type(`9999`);

	// element = await page.$x(`/html/body/div/div/div[2]/div[2]/div[2]/form/div[16]/div/button`);
	// await element[0].click();
})();
