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
	const agen_loop = [
		{ username: 'ufh270a3', master: 'ufh270' },
		{ username: 'ufh273a2', master: 'ufh273' },
		{ username: 'ufh273a3', master: 'ufh273' },
		{ username: 'ufh273a8', master: 'ufh273' },
		{ username: 'ufh273b1', master: 'ufh273' },
		{ username: 'ufh273b3', master: 'ufh273' },
		{ username: 'ufh273b6', master: 'ufh273' },
		{ username: 'ufh273b7', master: 'ufh273' },
		{ username: 'ufh273b8', master: 'ufh273' },
		{ username: 'ufh273c1', master: 'ufh273' },
		{ username: 'ufh273c2', master: 'ufh273' },
		{ username: 'ufh273c3', master: 'ufh273' },
		{ username: 'ufh273c4', master: 'ufh273' },
		{ username: 'ufh273c5', master: 'ufh273' },
	];
	const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 5000 }, args });
	const page = await browser.newPage();
	let element, formElement, tabs, checkMaster;
	await delay(2000);
	await page.goto(`http://ufa66.office168.work/?action=login`, {
		waitUntil: 'networkidle2'
	})
	await delay(3000);
	element = await page.$x(`//*[@name="username"]`);
	await element[0].type(`est`);
	element = await page.$x(`//*[@name="password"]`);
	await element[0].type(`15460607`);
	element = await page.$x(`//*[@name="login"]`);
	await element[0].click();
	await delay(3000);
	element = await page.$x(`//a[contains(text(),'ตามลูกค้า')]`);
	await element[0].click();
	await delay(1000);
	await page.bringToFront();
	await delay(1000);

	await page.goto(`http://ufa66.play168.xyz/__admin/?action=agent-list&game_id=1`, { waitUntil: 'networkidle0' });
	await delay(1000);

	for (const [idx, data] of agen_loop.entries()) {

		if (checkMaster !== data.master) {
			console.log(data.username == checkMaster);
			checkMaster = data.master
			await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' })
			await delay(1000);
			element = await page.$x(`//*[@id="txtUserName"]`)
			await element[0].type(data.master);
			element = await page.$x(`//*[@id="txtPassword"]`)
			await element[0].type('66Pplsix168<>+');
			element = await page.$x(`//*[@id="btnSignIn"]`)
			await element[0].click()
			console.log('login สำเร็จ');
			await delay(2000);

		}
		await page.goto(agtest + `/_Age1/AgentSet.aspx?userName=` + data.username + `&set=1`, {
			waitUntil: 'networkidle2'
		})
		await delay(2000);
		element = await page.$x(`//*[@id="txtPassword"]`)
		await element[0].type('Vip66ufa~168++');

		element = await page.$x(`//*[@id="btnUpdateG"]`);
		await element[0].click();
		await delay(2000);

		await page.goto(`http://ufa66.play168.xyz/__admin/?action=agent-list&game_id=1`, { waitUntil: 'networkidle0' });
		await delay(2000);

		element = await page.$x(`/html/body/div/div/div[2]/table/tbody/tr[` + (idx + 1) + `]/td[10]/a[1]`);
		await element[0].click();
		await delay(2000);
		element = await page.$x(`/html/body/div[1]/div/div[2]/div[3]/div/div/div[2]/form/div[5]/div/input`);
		await element[0].click({ clickCount: 3 });
		await element[0].type(`Vip66ufa~168++`);
		element = await page.$x(`/html/body/div[1]/div/div[2]/div[3]/div/div/div[2]/form/div[9]/div/input`);
		await element[0].click({ clickCount: 3 });
		await element[0].type(`Vip66ufa~168++`);
		element = await page.$x(`//button[@type='submit']`);
		await element[0].click();
		await delay(2000);


	}

	// OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRAR',this,'btnUpdRAR')"]`);
	// await element[0].click();



})();
