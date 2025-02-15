import delay from "delay";

export async function EnterSecurityPin(page, workPath, pin) {

    await page.goto(workPath, {
        waitUntil: 'networkidle2'
    });

    if (page.url().includes("SecurityCode.aspx")) {
        console.log("🔑 กำลังกรอก PIN...");

        await page.type('#txtConfirmSC', pin);
        await page.click('#btnSave');
        await delay(2000);
    }

    // ถ้าลิงก์ตรงอยู่แล้ว ให้ return true
    if (page.url() === workPath) {
        console.log("page.url() : ", page.url());
        console.log("workPath : ", workPath);

        return true;
    }

    return false;
}
