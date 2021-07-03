const puppeteer = require('puppeteer')
const delay = require('delay')

const { createWorker } = require('tesseract.js')

const worker = createWorker()
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
]

;(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1920, height: 1080 },
    args
  })
  const url = 'https://ag.ufabet.com/' // Set website you want to screenshot
  const page = await browser.newPage() // Open new page
  await page.goto(url, { waitUntil: 'networkidle2' }) // Go website
  await page.waitForSelector('#divImgCode > img') // Method to ensure that the element is loaded
  const captcha = await page.$('#divImgCode > img') // captcha is the element you want to capture
  await captcha.screenshot({
    path: './assets/captcha/captcha.png'
  })

  element = await page.$x(`//*[@id="txtUserName"]`)
  await element[0].type(`ufh27ss`)
  element = await page.$x(`//*[@id="txtPassword"]`)
  await element[0].type(`Est168168++`)

  await tesseractGet('captcha.png')
    .then(async result => {
      console.log(result)
      element = await page.$x(`//*[@id="txtCode"]`)
      await element[0].type(result)
    })
    .catch(function(err) {
      console.log(chalk.red(err))
    })
  await delay(5000)

  const title = await page.title()
  const urls = await page.url()

  console.log('Page Title : ' + title)
  console.log('Page URL : ' + urls)

  await page.waitFor(5000)
  await page.goto(urls + '&userName=ufh27ss00000015', {
    waitUntil: 'networkidle2'
  }) // Go website
  await page.close() // Close the website
  await browser.close()
})()

async function tesseractGet(imagePath) {
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })
  const {
    data: { text }
  } = await worker.recognize(imagePath)
  await worker.terminate()
  return text
}
