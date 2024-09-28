// login.js
import fs from 'fs';
import delay from 'delay';
import { readImg } from '../unit/tesseractGet';

export async function LoginLoop(page, agtest, worker, username, password, retryCount = 0) {
    const maxRetries = 3; // Set a maximum number of retries
    if (retryCount >= maxRetries) {
        console.log("Maximum login attempts reached. Aborting.");
        return "Max retries reached";
    }

    const date1 = new Date().getTime();
    const pathPhoto = __dirname.replace('.next\\server\\', '') + '\\img\\captcha' + date1 + '.png';

    await page.goto(`${agtest}/Public/Default11.aspx`, { waitUntil: 'load' });
    let element = await page.$x(`//*[@id="txtUserName"]`);
    await element[0].type(username);
    element = await page.$x(`//*[@id="txtPassword"]`);
    await element[0].type(password);

    await page.waitForSelector('#divImgCode > img');
    const captcha = await page.$('#divImgCode > img');
    // console.log("pathPhoto : ", pathPhoto);
    await captcha.screenshot({ path: pathPhoto });
    await delay(2000);

    await readImg(worker, pathPhoto)
        .then(async result => {
            // console.log('IMG TXT', result);
            element = await page.$x(`//*[@id="txtCode"]`);
            await element[0].type(result);
            fs.unlink(pathPhoto, (err => { if (err) console.error(err); }));
        })
        .catch(function (err) {
            console.log('Error:', err);
            fs.unlink(pathPhoto, (err => { if (err) console.error(err); }));
            throw err;
        });
    await delay(2000);
    // Add any other actions required post login

    const messageElement = await page.$('#lblMessage');
    if (messageElement) {
        const message = await page.evaluate(el => el.textContent, messageElement);
        if (message === "Invalid code!") {
            // console.log("Invalid code! Logging in again...");
            return await LoginLoop(page, agtest, worker, username, password, retryCount + 1);
        } else {
            // console.log("Login Error: ", message);
            return await LoginLoop(page, agtest, worker, username, password, retryCount = 0);
            // return message; // Returning the error message
        }
    } else {
        return "Login successful";
    }
}
