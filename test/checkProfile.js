import delay from 'delay';

export async function checkProfile(page, username) {
    console.log(`🔍 ตรวจสอบหน้าโปรไฟล์สำหรับ: ${username}`);

    const currentUrl = page.url();
    if (currentUrl.includes("/Public/ChgProfile2.aspx")) {
        console.log(`✅ อยู่ที่หน้า ChgProfile2.aspx - อัปเดต NickName`);

        // ✅ กรอกค่า username+ufa66 ลงในช่อง txtNickName
        await page.type('#txtNickName', `${username}ufa66`);
        console.log(`✅ กรอกค่า NickName: ${username}ufa66`);

        // ✅ กดปุ่มอัปเดต
        await page.click('#btnUpdate');
        console.log(`🔄 กดปุ่มอัปเดต`);
        await delay(2000);

        console.log(`✅ อัปเดต NickName สำเร็จ!`);
        return true;
    }

    console.log(`❌ ไม่ได้อยู่ที่หน้า ChgProfile2.aspx`);
    return false;
}
