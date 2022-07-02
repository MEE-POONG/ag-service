const delay = require("delay");
const puppeteer = require('puppeteer');
require('dotenv').config()
const userA = "ufrcbvip"
const passA = "Pp123456++"
const agtest = "http://ocean.isme99.com"
const start = "06/06/2022"
const end = "06/12/2022"
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
	const master_loop = [
		{ senior: 'ufruu', master: 'ufruu01', share: '0.4', negative: 'Y', commission: 'Y', pay: 'N', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		{ senior: 'ufruu', master: 'ufruu02', share: '0.4', negative: 'Y', commission: 'Y', pay: 'N', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		{ senior: 'ufruu', master: 'ufruu03', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		{ senior: 'ufruu', master: 'ufruu04', share: '0.5', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		{ senior: 'ufruu', master: 'ufruu05', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu06', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu07', share: '0', negative: 'Y', commission: 'Y', pay: 'N', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu08', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu09', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0a', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0b', share: '0.25', negative: 'N', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0c', share: '0.25', negative: 'N', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0d', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0e', share: '0', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0f', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0g', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0h', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0i', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0j', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0k', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0l', share: '0.25', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0m', share: '0.45', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0n', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0o', share: '0', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0p', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0q', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0r', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0s', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0t', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0u', share: '0.5', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0v', share: '0', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0w', share: '0', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0x', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0y', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu0z', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu10', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu11', share: '0', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu12', share: '0', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu13', share: '0.45', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu14', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu15', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu16', share: '0.5', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu168', share: '0', negative: 'Y', commission: 'Y', pay: 'N', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu17', share: '0.5', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu18', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu19', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1a', share: '0.5', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1b', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1c', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1d', share: '0.45', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1e', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1f', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1g', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1h', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1i', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1j', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1k', share: '0.25', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1l', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1m', share: '0.5', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1n', share: '0.25', negative: 'N', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1o', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1s', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1t', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1u', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1v', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1w', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu1y', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu20', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu21', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu22', share: '0.5', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu23', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu23', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu26', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu28', share: '0.35', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu29', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2a', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2b', share: '0.35', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2c', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2d', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2e', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2f', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2h', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2i', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2j', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2k', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2l', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2m', share: '0.35', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2n', share: '0.6', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2p', share: '0.35', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2r', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2s', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2t', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2w', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2x', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2y', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu2z', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu30', share: '0.35', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu31', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu32', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu33', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu34', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu35', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu38', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu39', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu40', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu41', share: '0.35', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu43', share: '0.3', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu44', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu47', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu48', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu50', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu51', share: '0.5', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu52', share: '0.2', negative: 'N', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu55', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu58', share: '0.2', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu66', share: '0', negative: 'Y', commission: 'Y', pay: 'N', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu88', share: '0.4', negative: 'Y', commission: 'Y', pay: 'N', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu99', share: '0.5', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu9f', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu9j', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruup1', share: '0', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu53', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu54', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
		// { senior: 'ufruu', master: 'ufruu56', share: '0.4', negative: 'Y', commission: 'Y', pay: 'Y', adjustPercentage: '1', calculateIncome: '1', userCheck: 'ufruuvip' },
	];
	const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 5000 }, args });
	const page = await browser.newPage();
	let element, formElement, tabs, checkMaster;
	await page.goto(agtest + `/Public/Default11.aspx`, { waitUntil: 'load' })

	element = await page.$x(`//*[@id="txtUserName"]`)
	await element[0].type(`ufruuvip`)
	element = await page.$x(`//*[@id="txtPassword"]`)
	await element[0].type(`Pp123456++`)
	element = await page.$x(`//*[@id="btnSignIn"]`)
	await Promise.all([
		element[0].click(),
		page.waitForNavigation({ waitUntil: 'load' })
	])
	for (const [idx, data] of master_loop.entries()) {
		await page.goto(agtest + `/_Part_Sub/SubAccsWinLose2.aspx?role=ag&userName=` + data.master + `&from=` + start + `&to=` + end + `&userID=ufruu&checkAll=True`, {
			waitUntil: 'networkidle2'
		})
		await delay(2000);
		await page.waitForXPath(`//*[@id="SubAccsWinLose_cm1_g"]`, { visible: true })
		resultTable = await page.evaluate(async () => {
			const rows = document.querySelectorAll('#SubAccsWinLose_cm1_g tbody tr')
			return Array.from(rows, row => {
				const columns = row.querySelectorAll('td')
				return Array.from(columns, column => column.innerText)
			})
		})
		for (var i = 0; i < resultTable.length; i++) {
			if (resultTable[i][2] !== 'THB') {
				resultTable.splice(i, 1)
			}
		}
		await resultTable.shift()
		console.log(idx, " : ", data.master, " : resultTable : ", resultTable);
	}


})();
