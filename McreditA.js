import _ from 'lodash'
import puppeteer from 'puppeteer'
import 'moment/locale/th'
import delay from 'delay'
import { createWorker } from 'tesseract.js';
import { LoginLoop } from './LoginLoop';
import { agentData } from './data/Agentloop';

const Pass = 'Ufr168pppt99~+'
const agtest = "http://ag.ufabet.com"

const args = [
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
];

export default async function handler(req, res) {
    const { method } = req
    const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 5000 }, args });
    const page = await browser.newPage();

    switch (method) {
        case 'GET':
            try {
                let element;
                let creditAdd = 5000; // Example credit add value
                let totalCreditAdd = creditAdd * 4; // Adding creditAdd 4 times
                let maxLimit = 0;
                let CheckMaster = '';
                const worker = await createWorker('eng');
                await worker.setParameters({
                    tessedit_char_whitelist: '0123456789'
                });

                const loginResult = await LoginLoop(page, agtest, worker, agentData[0].master, process.env.SixPassM);
                await delay(2000);

                // Check login result
                if (loginResult === 'Login successful') {
                    await page.goto(agtest + `/_Age1/AgentSet.aspx?userName=${agentData[0].agent}&set=1`, {
                        waitUntil: 'networkidle2'
                    });
                    await delay(2000);

                    // Get maxLimit value
                    maxLimit = await page.evaluate(() => {
                        const element = document.querySelector('#lblTotalLimit .Positive');
                        return element ? parseInt(element.innerText.replace(/,/g, '')) : 0;
                    });
                    console.log(`Max limit: ${maxLimit}`); // Output maxLimit

                    // Check if maxLimit is less than totalCreditAdd
                    if (maxLimit < totalCreditAdd) {
                        console.log(`เครดิตเหลือแค่ ${maxLimit}, ไม่เพียงพอสำหรับการเพิ่มเครดิต ${totalCreditAdd}`);
                    } else {
                        // Retrieve the value in the txtTotalLimit field
                        let txtTotalLimitValue = await page.evaluate(() => {
                            const inputElement = document.querySelector('#txtTotalLimit');
                            return inputElement ? parseInt(inputElement.value.replace(/,/g, '')) : 0;
                        });

                        // Add totalCreditAdd to the current value of txtTotalLimit
                        const updatedLimit = txtTotalLimitValue + totalCreditAdd;
                        console.log(`Updated Limit: ${updatedLimit}`);

                        // Set the new value in the txtTotalLimit field
                        await page.evaluate((newLimit) => {
                            const inputElement = document.querySelector('#txtTotalLimit');
                            if (inputElement) {
                                inputElement.value = newLimit.toLocaleString(); // Format with commas
                            }
                        }, updatedLimit);

                        // Click the update button
                        element = await page.$x(`//*[@id="btnUpdateC"]`);
                        await element[0].click();
                        await delay(2000);

                        // Check for the status message
                        const statusMessage = await page.evaluate(() => {
                            const statusElement = document.querySelector('#lblStatus .ENG');
                            return statusElement ? statusElement.innerText : null;
                        });

                        // Check if the status message is different from "Profile updated successfully."
                        if (statusMessage !== 'Profile updated successfully.') {
                            console.log('Update failed: ', statusMessage);
                        } else {
                            console.log('Profile updated successfully.');
                        }
                    }
                } else {
                    console.log('Login ไม่สำเร็จ');
                }
            } catch (error) {
                console.log(error);
                res.status(400).json({ success: false, error });
            }
            break;
        default:
            res.status(400).json({ success: false });
            break;
    }
}
