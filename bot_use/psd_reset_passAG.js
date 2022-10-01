const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userA = 'ufruuvip'
const passA = 'Pp123456++'
const { topAgenPass, sixAgenPass, topMasterPass, sixMasterPass, adminUser, agtest } = process.env

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
	const agen_loop = [
		{ username: 'ufo8892', master: 'ufo88901' },
		{ username: 'ufo8895', master: 'ufo889' },
		{ username: 'ufo889b', master: 'ufo889' },
		{ username: 'ufo889c', master: 'ufo889' },
		{ username: 'ufo889d', master: 'ufo889' },
		{ username: 'ufo889e', master: 'ufo889' },
		{ username: 'ufo889f', master: 'ufo889' },
		{ username: 'ufo889h', master: 'ufo889' },
		{ username: 'ufo889i', master: 'ufo889' },
		{ username: 'ufo889j', master: 'ufo889' },
		{ username: 'ufo889k', master: 'ufo889' },
		{ username: 'ufo889l', master: 'ufo889' },
		{ username: 'ufo889n', master: 'ufo889' },
		{ username: 'ufo889r', master: 'ufo889' },
		{ username: 'ufo889t', master: 'ufo889' },
		{ username: 'ufo889u', master: 'ufo889' },
		{ username: 'ufo889v', master: 'ufo889' },
		{ username: 'ufo889w', master: 'ufo889' },
		{ username: 'ufo889x', master: 'ufo889' },
		{ username: 'ufo889y', master: 'ufo889' },
	];
	const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 5000 }, args });
	const page = await browser.newPage();
	let element, formElement, tabs, checkMaster;

	// for (const [idx, data] of agen_loop.entries()) {

		// if (checkMaster !== data.master) {
		// 	console.log(data.username == checkMaster);
		// 	checkMaster = data.master
		await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' })
		await delay(1000);
		// element = await page.$x(`//*[@id="txtUserName"]`)
		// await element[0].type(data.master);
		// element = await page.$x(`//*[@id="txtPassword"]`)
		// await element[0].type('Pop168168++');
		// element = await page.$x(`//*[@id="btnSignIn"]`)
		// await element[0].click()
		// console.log('login สำเร็จ');
		// await delay(2000);

		// }
		// await page.goto(agtest + `/_Age1/AgentSet.aspx?userName=` + data.username + `&set=1`, {
		// 	waitUntil: 'networkidle2'
		// })
		// await delay(2000);
		// element = await page.$x(`//*[@id="txtPassword"]`)
		// await element[0].type('Vip66ufa~168++');

		// element = await page.$x(`//*[@id="btnUpdateG"]`);
		// await element[0].click();
		// await delay(2000);

	// }


})();
