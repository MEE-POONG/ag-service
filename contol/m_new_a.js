const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userS = "ufrcb"
const userM = "ufrcb1"
const userA = "ufrcb18a1"
const passS = "168Ufa<>168++"
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
	await element[0].type(userM);
	element = await page.$x(`//*[@id="txtPassword"]`)
	await element[0].type(passM);
	element = await page.$x(`//*[@id="btnSignIn"]`)
	await element[0].click()
	console.log('login สำเร็จ');
	await delay(1000);

	await page.goto(agtest + `/_Age1/AgentSet.aspx`, {
		waitUntil: 'networkidle2'
	})
	await delay(1000);

	element = await page.$x(`//*[@id="txtUserName"]`)
	await element[0].type(`a0`);
	element = await page.$x(`//*[@id="txtPassword"]`)
	await element[0].type(`Aa123456+`);
	element = await page.$x(`//*[@id="txtTotalLimit"]`)
	await element[0].type(`5000`);

	// //SPORTSBOOK มาสเตอร์ไม่ใช่บอล
	// // ON
	// element = await page.$x(`//table[@onclick="toggleSetting2('trSports',this,'btnUpdSB')"]`);
	// await element[0].click();
	// console.log('SPORTSBOOK สำเร็จ');
	// await delay(1000);
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trSports',this,'btnUpdSB')"]`);
	// await element[0].click();

	// await delay(1000);
	// // SA GAMING
	// // element = await page.$x(`/html/body/form/div[3]/table/tbody/tr[10]/td/table/tbody/tr[4]/td/table/tbody/tr[1]/td/table`);
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRAR',this,'btnUpdRAR')"]`);
	// await element[0].click();
	// console.log('เปิด SA GAMING สำเร็จ');
	// //ปิด เปิด
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRARDisable');
	// 	radio.click();
	// });
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRAREnable');
	// 	radio.click();
	// });
	// //ปรับเซอเซน 0
	// element = await page.select("select#lstCommissionRAR", "0")
	// // //ปรับไม้ 6 ระดับ 
	// // Limit A	Min = 20 Max = 1000	 
	// // Limit B	Min = 50 Max = 5000	 
	// // Limit C	Min = 100 Max = 10000	 
	// // Limit D	Min = 300 Max = 30000	 
	// // Limit E	Min = 500 Max = 50000	 
	// // Limit F	Min = 10000 Max = 200000	 
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#optRARProfile1');
	// 	radio.click();
	// });
	// // OFF
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRAR',this,'btnUpdRAR')"]`);
	// await element[0].click();

	// await delay(1000);
	// // ITP (CQ9, PNG, BNG, GF, PTS, AUG, NS, HB, MPoker, MTPoker)
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRAS',this,'btnUpdRAS')"]`);
	// await element[0].click();
	// console.log('ITP สำเร็จ');
	// // //ปิด เปิด
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRASDisable');
	// 	radio.click();
	// });
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRASEnable');
	// 	radio.click();
	// });
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRAS',this,'btnUpdRAS')"]`);
	// await element[0].click();

	// await delay(1000);
	// //  ITP (UPG/MG)
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRCV',this,'btnUpdRCV')"]`);
	// await element[0].click();
	// console.log(' ITP (UPG/MG) สำเร็จ');
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRCV',this,'btnUpdRCV')"]`);
	// await element[0].click();

	// await delay(1000);
	// //  JOKER
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRAU',this,'btnUpdRAU')"]`);
	// await element[0].click();
	// console.log(' JOKER สำเร็จ');
	// //ปิด เปิด
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRAUDisable');
	// 	radio.click();
	// });
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRAUEnable');
	// 	radio.click();
	// });
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRAU',this,'btnUpdRAU')"]`);
	// await element[0].click();

	// await delay(1000);
	// //GH CASINO / EB CASINO / BG
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBF',this,'btnUpdRBF')"]`);
	// await element[0].click();
	// console.log('GH CASINO / EB CASINO / BG สำเร็จ');
	// //ปิด เปิด
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRBFDisable');
	// 	radio.click();
	// });
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRBFEnable');
	// 	radio.click();
	// });
	// //ปรับเซอเซน 0
	// element = await page.select("select#lstCommissionRBF", "0")
	// //ปรับไม้ 6 ระดับ 
	// // Limit A	Min = 20 Max = 5000	 
	// // Limit B	Min = 100 Max = 10000	 
	// // Limit C	Min = 200 Max = 25000	 
	// // Limit D	Min = 500 Max = 50000	 
	// // Limit E	Min = 5000 Max = 200000	 	 
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#optRBFProfile1');
	// 	radio.click();
	// });
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBF',this,'btnUpdRBF')"]`);
	// await element[0].click();

	// await delay(1000);
	// //  AE7
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRCZ',this,'btnUpdRCZ')"]`);
	// await element[0].click();
	// console.log('AE7 สำเร็จ');
	// //ปิด เปิด
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRCZDisable');
	// 	radio.click();
	// });
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRCZEnable');
	// 	radio.click();
	// });
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRCZ',this,'btnUpdRCZ')"]`);
	// await element[0].click();

	// await delay(1000);
	// // GH COCKFT / HORSE RACING
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBG',this,'btnUpdRBG')"]`);
	// await element[0].click();
	// console.log('GH COCKFT / HORSE RACING สำเร็จ');
	// //ปรับเซอเซน 0
	// element = await page.select("select#lstCommissionRBG", "0")
	// //ปรับไม้ 6 ระดับ
	// // Limit A	Min = 20 Max = 2500	 
	// // Limit B	Min = 100 Max = 5000	 
	// // Limit C	Min = 200 Max = 10000	 
	// // Limit D	Min = 300 Max = 15000	 
	// // Limit E	Min = 500 Max = 25000	 
	// element = await page.$x(`//*[@id="optRBGProfile1"]`)
	// await element[0].click()
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBG',this,'btnUpdRBG')"]`);
	// await element[0].click();

	// await delay(1000);
	// //  GH SLOT / ESPORT / SABASPORT
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBH',this,'btnUpdRBH')"]`);
	// await element[0].click();
	// console.log('GH SLOT / ESPORT / SABASPORT สำเร็จ');
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBH',this,'btnUpdRBH')"]`);
	// await element[0].click();

	// await delay(1000);
	// //  SIAM LOTTO
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBI',this,'btnUpdRBI')"]`);
	// await element[0].click();
	// console.log('SIAM LOTTO สำเร็จ');
	// //ปิด เปิด
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRBIDisable');
	// 	radio.click();
	// });
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRBIEnable');
	// 	radio.click();
	// });
	// //ปรับไม้ 6 ระดับ
	// // Limit A	Min = 1 Max = 10000	 
	// // Limit B	Min = 30 Max = 20000	 
	// // Limit C	Min = 50 Max = 30000	 
	// // Limit D	Min = 100 Max = 40000	 
	// element = await page.$x(`//*[@id="optRBIProfile1"]`)
	// await element[0].click()
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBI',this,'btnUpdRBI')"]`);
	// await element[0].click();

	// await delay(1000);
	// //  UFA SLOT / UFA FISHING
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBL',this,'btnUpdRBL')"]`);
	// await element[0].click();
	// console.log('UFA SLOT สำเร็จ');
	// //ปิด เปิด
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRBLDisable');
	// 	radio.click();
	// });
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRBLEnable');
	// 	radio.click();
	// });
	// //  OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBL',this,'btnUpdRBL')"]`);
	// await element[0].click();

	// await delay(1000);
	// //  MUAY STEP
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBM',this,'btnUpdRBM')"]`);
	// await element[0].click();
	// console.log('MUAY STEP สำเร็จ');
	// //ปิด เปิด
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRBMDisable');
	// 	radio.click();
	// });
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRBMEnable');
	// 	radio.click();
	// });
	// //ปรับเซอเซน 0
	// element = await page.select("select#lstCommissionRBM", "0")
	// //ปรับไม้ 6 ระดับ
	// //   Limit A	Min = 10 Max = 5000	 
	// //   Limit B	Min = 20 Max = 10000	 
	// //   Limit C	Min = 30 Max = 15000	 
	// //   Limit D	Min = 40 Max = 20000	 
	// //   Limit E	Min = 50 Max = 30000	 
	// element = await page.$x(`//*[@id="optRBMProfile1"]`)
	// await element[0].click()
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBM',this,'btnUpdRBM')"]`);
	// await element[0].click();

	// await delay(1000);
	// //  VIRTUAL SPORTS
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBO',this,'btnUpdRBO')"]`);
	// await element[0].click();
	// console.log('VIRTUAL SPORTS สำเร็จ');
	// //ปิด เปิด
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRBODisable');
	// 	radio.click();
	// });
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRBOEnable');
	// 	radio.click();
	// });
	// //ปรับเซอเซน 0
	// element = await page.select("select#lstCommissionRBO", "0")
	// //ปรับไม้ 6 ระดับ
	// // Limit A	Min = 10 Max = 5000	 
	// // Limit B	Min = 20 Max = 10000	 
	// element = await page.$x(`//*[@id="optRBOProfile1"]`)
	// await element[0].click()
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRBO',this,'btnUpdRBO')"]`);
	// await element[0].click();

	// await delay(1000);
	// //  UFA LOTTO - YEEKEE
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRCW',this,'btnUpdRCW')"]`);
	// await element[0].click();
	// console.log('UFA LOTTO - YEEKEE สำเร็จ');
	// //ปิด เปิด
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRCWDisable');
	// 	radio.click();
	// });
	// element = await page.evaluate(() => {
	// 	let radio = document.querySelector('#btnRCWEnable');
	// 	radio.click();
	// });
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRCW',this,'btnUpdRCW')"]`);
	// await element[0].click();

	// await delay(1000);
	// //  UFA THAI LOTTO / ASEAN LOTTO
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRCX',this,'btnUpdRCX')"]`);
	// await element[0].click();
	// // OFF
	// element = await page.$x(`//table[@onclick="toggleSetting2('trRCX',this,'btnUpdRCX')"]`);
	// await element[0].click();

	// ยืนยัน
	// element = await page.$x(`//*[@id="btnSave"]`)
	// await element[0].click()



})();
