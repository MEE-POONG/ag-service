const delay = require("delay");
const puppeteer = require('puppeteer'); const { text } = require("stream/consumers");
+
	require('dotenv').config()
const userS = "ufh27"
const userM = "ufh27a5"
const userA = "ufh27oa0"
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

	const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args });
	const page = await browser.newPage();
	let element, formElement, tabs, userCoppy;
	userCoppy = "a6";
	await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })

	element = await page.$x(`//*[@id="txtUserName"]`)
	await element[0].type(userS);
	element = await page.$x(`//*[@id="txtPassword"]`)
	await element[0].type(passS);
	element = await page.$x(`//*[@id="btnSignIn"]`)
	await element[0].click()
	console.log('login สำเร็จ');
	await delay(1000);

	await page.goto(agtest + `/_Part1/MasterSet.aspx?cName=` + userS + `0&set=1`, {
		waitUntil: 'networkidle2'
	})
	
	element = await page.$x(`//*[@id="txtUserName"]`)
	await element[0].type(userCoppy);
	element = await page.$x(`//*[@id="txtPassword"]`)
	await element[0].type("Aa123456+");
	element = await page.$x(`//*[@id="txtTotalLimit"]`)
	await element[0].type("0");
	await delay(1000);
	element = await page.$x(`//*[@id="btnSave"]`)
	await element[0].click()
	await delay(1000);
	console.log('สร้างยูส 1/3');

	element = await page.$x(`//*[@id="confirmBtn"]`)
	await element[0].click()
	element = await page.$x(`//*[@id="inputConfirm"]`)
	await element[0].type("CONFIRM");
	element = await page.$x(`//*[@id="okBtn"]`)
	await element[0].click()
	await delay(1000);
	console.log('สร้างยูส 2/3');

	await page.waitForXPath(`//*[@id="lblStatus"]`);
	[element] = await page.$x(`//*[@id="lblStatus"]`);
	result = await page.evaluate(element => element.textContent, element);
	if (result === "Profile updated successfully.") {
		await page.waitForXPath(`//*[@id="txtUserName"]`);
		[element] = await page.$x(`//*[@id="txtUserName"]`);
		userNew = await page.evaluate(x => x.value, element);
		console.log('สร้างยูสใหม่ ' + userNew + ' 3/3 สำเร็จ');
	} else if (result === "User Name already exists.") {
		console.log('สร้างยูสใหม่ 3/3 ไม่สำเร็จ');
		userNew = "ufh27a0";
	}
	await delay(1000);
	//เข้าตั้งรหัส
	await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'networkidle2' })
	element = await page.$x(`//*[@id="txtUserName"]`)
	await element[0].type(userNew);
	element = await page.$x(`//*[@id="txtPassword"]`)
	await element[0].type("Aa123456+");
	element = await page.$x(`//*[@id="btnSignIn"]`)
	await element[0].click()
	console.log('login สำเร็จ');
	await delay(3000);
	// เปลี่ยนรหัส
	element = await page.$x(`//*[@id="txtOldPassword"]`)
	await element[0].type("Aa123456+");
	console.log(passM);
	element = await page.$x(`//*[@id="txtNewPassword"]`)
	await element[0].type(passM)
	element = await page.$x(`//*[@id="txtConfirmPassword"]`)
	await element[0].type(passM)
	element = await page.$x(`//*[@id="btnSave"]`)
	await element[0].click()
	
})();
