import dotenv from 'dotenv';
dotenv.config();
import { createWorker } from 'tesseract.js';
import puppeteer from 'puppeteer';

import { LoginLoop } from './LoginLoop';
import { agentData } from './data/Agentloop';
const delay = require("delay");
//http://localhost:6001/api/bot/ufa66/SetZeroC
const agtest = "https://ag.ufabet.com"

export default async function handler(req, res) {
    const { method } = req;
    const pinA = process.env.pinA ? String(process.env.pinA).padStart(6, '0') : "010540";
    console.log("Start : pinA : ", pinA);
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 5000 },
        headless: false, args: [
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
        ]
    });
    const page = await browser.newPage();

    switch (method) {
        case 'GET':
            try {
                let element;
                let CheckAgent = '';
                let loginResult = false;
                const worker = await createWorker('eng');
                await worker.setParameters({
                    tessedit_char_whitelist: '0123456789'
                })
                for (let i = 0; i < agentData.length; i++) {
                    if (CheckAgent !== agentData[i].agent) {
                        CheckAgent = agentData[i].agent;
                        loginResult = false;
                        loginResult = await LoginLoop(
                            page,
                            agtest,
                            worker,
                            agentData[i].agent,
                            process.env.passA,
                            pinA,
                            `${process.env.linkPinA}${agentData[i].agent}`
                        );
                    }

                    if (loginResult) {
                        console.log(agentData[i].agent, " : ", agentData[i].customer);
                        await page.goto(`${agtest}/_SubAg1/MemberSet.aspx?userName=${agentData[i].customer}&set=1`, {
                            waitUntil: 'networkidle2'
                        })
                        //SPORTSBOOK มาสเตอร์ไม่ใช่บอล
                        console.log("ปรับ SPORTSBOOK");
                        // ON
                        element = await page.$x(`//table[@id='tbSports']/tbody/tr/td`);
                        await element[0].click();
                        console.log('SPORTSBOOK สำเร็จ');
                        await delay(1000);
                        element = await page.select("select#lstCommission", "0")
                        element = await page.select("select#lstCommissionX12", "0")
                        element = await page.select("select#lstCommissionPar", "0")
                        element = await page.select("select#lstCommissionOther", "0")

                        element = await page.$x(`//*[@id="txtTransLimit"]`);
                        await element[0].click({ clickCount: 2 });
                        await element[0].type(`10000`);

                        element = await page.$x(`//*[@id="txtBeforeRun"]`);
                        await element[0].click({ clickCount: 2 });
                        await element[0].type(`15000`);

                        element = await page.$x(`//*[@id="txtMaxX12"]`);
                        await element[0].click({ clickCount: 2 });
                        await element[0].type(`10000`);

                        element = await page.$x(`//*[@id="txtMatchLimitX12"]`);
                        await element[0].click({ clickCount: 2 });
                        await element[0].type(`15000`);

                        element = await page.$x(`//*[@id="txtMaxPar"]`);
                        await element[0].click({ clickCount: 2 });
                        await element[0].type(`10000`);

                        element = await page.$x(`//*[@id="txtPar"]`);
                        await element[0].click({ clickCount: 2 });
                        await element[0].type(`15000`);

                        element = await page.$x(`//*[@id="txtMaxOther"]`);
                        await element[0].click({ clickCount: 2 });
                        await element[0].type(`10000`);

                        element = await page.$x(`//*[@id="txtMatchLimitOther"]`);
                        await element[0].click({ clickCount: 2 });
                        await element[0].type(`15000`);

                        element = await page.$x(`//*[@id="txtMaxOS"]`);
                        await element[0].click({ clickCount: 2 });
                        await element[0].type(`500`);
                        // 
                        element = await page.$x(`//*[@id="txtMatchLimitOS"]`);
                        await element[0].click({ clickCount: 2 });
                        await element[0].type(`500`);
                        // btnUpdSB OK
                        element = await page.$x(`//*[@id="btnUpdSB"]`);
                        await element[0].click();
                        await page.waitForNavigation({ waitUntil: 'load' })
                        // SPORTSBOOK succeed
                        await delay(2000);

                        // บาคาร่า
                        element = await page.$x(`//table[@onclick="toggleSetting('trLC',this)"]`);
                        await element[0].click();
                        // บาคาร่า sexy
                        element = await page.$x(`//*[@id="optRBFProfile1"]`)
                        // element = await page.$x(`//*[@id="optRBFProfile2"]`)
                        // element = await page.$x(`//*[@id="optRBFProfile3"]`)
                        // element = await page.$x(`//*[@id="optRBFProfile4"]`)
                        // element = await page.$x(`//*[@id="optRBFProfile5"]`)
                        await element[0].click();
                        element = await page.$x(`//*[@id="btnUpdRBF"]`);
                        await element[0].click();
                        await page.waitForNavigation({ waitUntil: 'load' })
                        await delay(2000);
                        // บาคาร่า sa
                        element = await page.$x(`//table[@onclick="toggleSetting('trLC',this)"]`);
                        await element[0].click();
                        element = await page.select("select#lstCommissionRAR", "0")
                        element = await page.$x(`//*[@id="optRARProfile1"]`)
                        await element[0].click();
                        element = await page.$x(`//*[@id="btnUpdRAR"]`);
                        await element[0].click();
                        await page.waitForNavigation({ waitUntil: 'load' })
                        await delay(2000);

                        console.log('ปรับบาร์เสร็จสิ้น');

                        // OTHERS
                        element = await page.$x(`//table[@onclick="toggleSetting2('trOthers',this)"]`);
                        await element[0].click();
                        element = await page.$x(`//*[@id="optRBGProfile1"]`)
                        await element[0].click()
                        element = await page.$x(`//*[@id="btnUpdRBG"]`);
                        await element[0].click();
                        await page.waitForNavigation({ waitUntil: 'load' })
                        await delay(2000);
                        element = await page.$x(`//table[@onclick="toggleSetting2('trOthers',this)"]`);
                        await element[0].click();
                        element = await page.$x(`//*[@id="optRBMProfile1"]`)
                        await element[0].click()
                        element = await page.$x(`//*[@id="btnUpdRBM"]`);
                        await element[0].click();
                        await page.waitForNavigation({ waitUntil: 'load' })
                        await delay(2000);
                        element = await page.$x(`//table[@onclick="toggleSetting2('trOthers',this)"]`);
                        await element[0].click();
                        element = await page.$x(`//*[@id="optRBOProfile1"]`)
                        await element[0].click()
                        element = await page.$x(`//*[@id="btnUpdRBO"]`);
                        await element[0].click();
                        await page.waitForNavigation({ waitUntil: 'load' })
                        await delay(2000);

                    }
                }
            } catch (error) {
                console.error(error);
                res.status(400).json({ success: false, error });
            }
            break;

        default:
            browser.close();
            res.status(400).json({ success: false });
            break;
    }
}
