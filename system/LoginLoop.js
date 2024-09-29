// loginLoop.js
import fs from 'fs';
import delay from 'delay';
import { readImg } from './tesseractGet'; // ปรับ path ให้ถูกต้องตามโครงสร้างของโปรเจค

export async function LoginLoop(page, agtest, worker, username, password, retryCount = 0) {
    const maxRetries = 3; // กำหนดจำนวนครั้งสูงสุดในการลอง login ใหม่
    if (retryCount >= maxRetries) {
        console.log("Maximum login attempts reached. Aborting.");
        return "Max retries reached";
    }

    const date1 = new Date().getTime();
    const pathPhoto = `./img/captcha${date1}.png`;

    await page.goto(`${agtest}/Public/Default11.aspx`, { waitUntil: 'load' });
    let element = await page.$x(`//*[@id="txtUserName"]`);
    await element[0].type(username);
    element = await page.$x(`//*[@id="txtPassword"]`);
    await element[0].type(password);

    await page.waitForSelector('#divImgCode > img');
    const captcha = await page.$('#divImgCode > img');
    await captcha.screenshot({ path: pathPhoto });
    await delay(2000);

    await readImg(worker, pathPhoto)
        .then(async result => {
            element = await page.$x(`//*[@id="txtCode"]`);
            await element[0].type(result);
            fs.unlink(pathPhoto, (err) => { if (err) console.error(err); });
        })
        .catch((err) => {
            console.log('Error:', err);
            fs.unlink(pathPhoto, (err) => { if (err) console.error(err); });
            throw err;
        });

    await delay(2000);

    const messageElement = await page.$('#lblMessage');
    if (messageElement) {
        const message = await page.evaluate(el => el.textContent, messageElement);
        if (message === "Invalid code!") {
            return await LoginLoop(page, agtest, worker, username, password, retryCount + 1);
        } else {
            return await LoginLoop(page, agtest, worker, username, password, retryCount = 0);
        }
    } else {
        return "Login successful";
    }
}
