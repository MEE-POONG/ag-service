import delay from 'delay';

export async function checkSecurityCode(page, pinCode) {
    console.log(`🔍 ตรวจสอบหน้า SecurityCode.aspx`);

    const currentUrl = page.url();
    if (currentUrl.includes("/Public/SecurityCode.aspx")) {
        console.log(`✅ อยู่ที่หน้า SecurityCode.aspx - ตั้งค่า PIN`);

        // ✅ กรอก PIN ลงใน txtNewSC และ txtConfirmSC
        await page.type('#txtNewSC', pinCode);
        await page.type('#txtConfirmSC', pinCode);
        console.log(`✅ ตั้งค่า PIN: ${pinCode}`);

        // ✅ กดปุ่มบันทึก
        await page.click('#btnSave');
        console.log(`🔄 กดปุ่มบันทึก`);
        await delay(2000);

        console.log(`✅ ตั้งค่า PIN สำเร็จ!`);
        return true;
    }

    console.log(`❌ ไม่ได้อยู่ที่หน้า SecurityCode.aspx`);
    return false;
}
