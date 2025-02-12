import fs from 'fs';
import delay from 'delay';
import { checkProfile } from './checkProfile';
import { checkSecurityCode } from './checkSecurityCode';

export async function loginNew(page, agtest, worker, username, password, pinCode) {

    const loginUrl = `${agtest}/Public/Default11.aspx?lang=EN-GB`;
    await page.goto(loginUrl, { waitUntil: 'load' });
    await delay(2000);

    // ✅ กรอก `username` และ `password`
    await page.type('#txtUserName', username);
    await page.type('#txtPassword', password);

    // ✅ ถ่ายภาพ Captcha และอ่านค่า 3 รอบ
    const captchaElement = await page.$('#divImgCode img');
    const captchaPath = `captcha_${Date.now()}.png`;

    await captchaElement.screenshot({ path: captchaPath });

    let captchaResults = [];
    for (let i = 0; i < 3; i++) {
        let captchaText = await readImg(worker, captchaPath);
        captchaResults.push(captchaText.trim());
    }

    // ✅ ตรวจสอบค่า Captcha ที่ได้
    let finalCaptcha = captchaResults[0];
    if (captchaResults.every(val => val === captchaResults[0])) {
    } else {
        finalCaptcha = captchaResults[0];
    }

    // ✅ ลบรูปที่แคปมาออก
    try {
        fs.unlinkSync(captchaPath);
    } catch (error) {
        console.error(`⚠️ ไม่สามารถลบไฟล์: ${captchaPath}`, error);
    }

    // ✅ กรอกค่า Captcha
    await page.type('#txtCode', finalCaptcha);

    // ✅ กดปุ่มล็อกอิน
    await page.click('#btnSignIn');
    await delay(2000);

    // ✅ ตรวจสอบว่าล็อกอินสำเร็จหรือไม่
    const currentUrl = page.url();
    if (currentUrl === loginUrl) {
        return "Login Failed";
    }

    // ✅ ตรวจสอบหน้าโปรไฟล์และตั้งค่า Security Code
    await checkProfile(page, username);
    await delay(3000);

    await checkSecurityCode(page, pinCode);
    await delay(3000);

    return "Login Successful";
}

// 📌 ฟังก์ชันอ่านค่า Captcha
export async function readImg(worker, imagePath) {
    const { data: { text } } = await worker.recognize(imagePath);
    return text;
}
