import dotenv from 'dotenv';
dotenv.config();
import { createWorker } from 'tesseract.js';
import puppeteer from 'puppeteer';
import { loginNew } from './loginNew'; // ✅ เปลี่ยนเป็น loginNew
import { masterData } from './data/Masterloop';
import { EnterSecurityPin } from './utils/EnterSecurityPin';
const delay = require("delay");

const agtest = "https://ag.ufabet.com";
//คลิกเพื่อใช้ http://localhost:6001/api/bot/ufa66/MCraditA


export default async function handler(req, res) {
    const { method } = req;
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 900 },
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
                let CheckUser = '';
                let passM = process.env.passM;
                let pinM = process.env.pinM;
                const worker = await createWorker('eng');
                await worker.setParameters({
                    tessedit_char_whitelist: '0123456789'
                });

                for (let i = 0; i < masterData.length; i++) {
                    if (CheckUser !== masterData[i].user) {
                        CheckUser = masterData[i].user;
                        let loginResult = await loginNew(page, agtest, worker, `${masterData[i].user}ufa66`, passM, pinM);
                        let PinTrue = await EnterSecurityPin(page, `${agtest}/_Age1/AgentSet.aspx?userName=${masterData[i].recipient}&set=1`, pinM);
                        if (PinTrue) {
                            console.log(76, PinTrue);

                            // ดึงค่าจาก lblTotalLimit
                            const limitText = await page.$eval("#lblTotalLimit .Positive", el => el.innerText);
                            const maxLimit = parseInt(limitText.replace(/,/g, ''), 10); // แปลงเป็นตัวเลข

                            // ดึงค่าปัจจุบันจาก txtTotalLimit
                            const currentTotalLimitText = await page.$eval("#txtTotalLimit", el => el.value);
                            const currentTotalLimit = parseInt(currentTotalLimitText.replace(/,/g, ''), 10);

                            // 🛠 **เพิ่มตัวแปร requestedCredit ที่ถูกต้อง**
                            let requestedCredit = masterData[i].cradit; // ดึงค่าจาก masterData

                            // คำนวณเครดิตที่ต้องใช้
                            let amountToTransfer = requestedCredit >= 10000 ? requestedCredit * 2 : requestedCredit * 4;

                            console.log(`💰 ขอเติมเครดิต: ${amountToTransfer}`);
                            console.log(`📏 เครดิตสูงสุดที่มีให้ใช้: ${maxLimit}`);

                            // เปรียบเทียบจำนวนเครดิต
                            if (amountToTransfer > maxLimit) {
                                console.log("❌ เครดิตใหญ่ไม่พอ!");
                                return false; // ถ้าเครดิตไม่พอให้ return false
                            }

                            // คำนวณยอดใหม่ที่จะต้องกรอกใน txtTotalLimit
                            const newTotalLimit = currentTotalLimit + amountToTransfer;
                            console.log(`🔄 อัปเดตยอดใหม่ใน txtTotalLimit: ${newTotalLimit}`);

                            // กรอกค่าใหม่ลงไปใน txtTotalLimit
                            await page.evaluate((newValue) => {
                                document.querySelector("#txtTotalLimit").value = newValue.toLocaleString(); // แปลงให้มี , คั่น
                            }, newTotalLimit);
                            
                            console.log(`✅ เติมเครดิตสำเร็จ! อัปเดต txtTotalLimit เป็น ${newTotalLimit.toLocaleString()}`);

                            // ✅ **กดปุ่มอัปเดตข้อมูล `btnUpdateG`**
                            await page.click("#btnUpdateC");
                            console.log("🔄 กดปุ่ม btnUpdateC เพื่ออัปเดตข้อมูล");
                        
                            // ✅ **รอให้ระบบอัปเดตข้อมูลเสร็จ**
                            await delay(2000); // รอ 2 วินาทีเผื่อหน้าเว็บมีการโหลด
                        
                            return true; // ถ้าเครดิตพอให้ return true
                        }

                    }
                    await delay(3000);
                }
            } catch (error) {
                console.error("❌ เกิดข้อผิดพลาด:", error);
                res.status(400).json({ success: false, error });
            }
            break;

        default:
            await browser.close();
            res.status(400).json({ success: false });
            break;
    }
}
