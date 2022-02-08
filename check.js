// Script Name: {katalon}

const puppeteer = require('puppeteer');
const delay = require("delay");
const e = require('cors');
(async () => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args: ['--start-maximized'] });
    const page = await browser.newPage();
    let element, formElement, tabs;
    let dayna = new Date();
    let date1 = dayna.getTime();
    let date2 = dayna.getTime();
    let saka = '';
    console.log(dayna.getTime());
    await delay(3000)
    console.log("16 : ", dayna = new Date());
    console.log("17 : ", dayna = new Date());
    console.log(date1.toString().substr(-1, 1));
    await page.goto(`https://docs.google.com/forms/d/e/1FAIpQLScDJBndRNpINC0CMoSWNIxcBj4oZY_Ar9EACXiwLO97D-Z6ZA/viewform`, { waitUntil: 'networkidle0' });
    await delay(1000)
    console.log("ถัดไป");
    for (let i = 274; i < 300; i++) {
        console.log("ลำดับที่ : ",i);
        element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[3]/div/div/div/span`);
        await element[0].click();
        await delay(1000)
        if (date1.toString().substr(-1, 1) > 4) {
            element = await page.$x(`//div[@id='i5']/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//div[@id='i8']/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }
        element = await page.$x(`//input[@type='text']`);
        await element[0].click();
        await delay(1000)
        console.log(date1.toString(), " : ", date1.toString().substr(-1, 1));
        console.log(date1.toString(), " : ", Number(date1.toString().substr(-1, 1)));
        date1 = Number(date1.toString().substr(-1, 1));
        date2 = Number(date2.toString().substr(-2, 2));
        console.log("date2 : ", date2);
        element = await page.$x(`//input[@type='text']`);
        if (date1 < 2) {
            await element[0].type('18');
            await delay(1000)
            element = await page.$x(`//div[@id='i22']/div[3]/div`);
            await element[0].click();
            await delay(1000)
            element = await page.$x(`//div[@id='i41']/div[3]/div`);
            await element[0].click();
        } else if (date1 < 4) {
            await element[0].type('19');
            await delay(1000)
            element = await page.$x(`//div[@id='i22']/div[3]/div`);
            await element[0].click();
            await delay(1000)
            element = await page.$x(`//div[@id='i44']/div[3]/div`);
            await element[0].click();
        } else if (date1 < 6) {
            await element[0].type('20');
            await delay(1000)
            element = await page.$x(`//div[@id='i25']/div[3]/div`);
            await element[0].click();
            await delay(1000)
            element = await page.$x(`//div[@id='i44']/div[3]/div`);
            await element[0].click();
        } else if (date1 < 8) {
            await element[0].type('21');
            await delay(1000)
            element = await page.$x(`//div[@id='i28']/div[3]/div`);
            await element[0].click();
            await delay(1000)
            element = await page.$x(`//div[@id='i47']/div[3]/div`);
            await element[0].click();
        } else {
            await element[0].type('22');
            await delay(1000)
            element = await page.$x(`//div[@id='i31']/div[3]/div`);
            await element[0].click();
            await delay(1000)
            element = await page.$x(`//div[@id='i50']/div[3]/div`);
            await element[0].click();
        }
        await delay(1000)
        // เลือกที่คณะสาขา
        console.log("80 : ", i);
        if (i < 100) {
            element = await page.$x(`//div[@id='i60']/div[3]/div`);
            if (i > 80) {
                saka = 'การเงิน'
            } else if (i > 60) {
                saka = 'การจัดการ'
            } else if (i > 40) {
                saka = 'การบัญชี'
            } else if (i > 20) {
                saka = 'การตลาด'
            } else {
                saka = 'ระบบสารสนเทศ'
            }
        } else if (i < 200) {
            element = await page.$x(`//div[@id='i63']/div[3]/div`);
            if (i > 100) {
                saka = 'เคมี'
            } else if (i > 91) {
                saka = 'ฟิสิกส์'
            } else if (i > 82) {
                saka = 'วิศวกรรมเกษตร'
            } else if (i > 73) {
                saka = 'วิศวกรรมคอมพิวเตอร์'
            } else if (i > 64) {
                saka = 'วิศวกรรมเครื่องกล'
            } else if (i > 55) {
                saka = 'วิศวกรรมไฟฟ้า'
            } else if (i > 46) {
                saka = 'วิศวกรรมเมคคาทรอนิกส์'
            } else if (i > 37) {
                saka = 'วิศวกรรมโยธา'
            } else if (i > 28) {
                saka = 'วิศวกรรมวัสดุ'
            } else if (i > 19) {
                saka = 'วิศวกรรมอิเล็กทรอนิกส์'
            } else if (i > 10) {
                saka = 'วิศวกรรมอุตสาหการ'
            } else {
                saka = 'วิศวกรรมอุตสาหการ'
            }
        } else if (i < 300) {
            element = await page.$x(`//div[@id='i66']/div[3]/div`);
            // คณะวิทยาศาสตร์และศิลปศาสตร์
            if (i > 80) {
                saka = 'วิทยาศาสตร์การกีฬา'
            } else if (i > 60) {
                saka = 'โลจิสติกส์'
            } else if (i > 40) {
                saka = 'เคมี'
            } else if (i > 20) {
                saka = 'เทคโนโลยีชีวภาพ'
            } else if (i > 20) {
                saka = 'ฟิสิกส์'
            } else if (i > 20) {
                saka = 'วัสดุศาสตร์'
            } else if (i > 20) {
                saka = 'สถิติ'
            } else if (i > 20) {
                saka = 'วิทยาการคอมพิวเตอร์'
            } else if (i > 20) {
                saka = 'เทคโนโลยีการเกษตร'
            } else if (i > 20) {
                saka = 'การท่องเที่ยวและการโรงแรม'
            } else if (i > 20) {
                saka = 'สื่อสารมวลชนและเอกสาร'
            } else if (i > 20) {
                saka = 'อังกฤษ'
            } else {
                saka = 'อังกฤษ'
            }
        } else {
            element = await page.$x(`//div[@id='i60']/div[3]/div`);
            saka = 'ระบบสารสนเทศ'
        }

        element = await page.$x(`//div[@id='i60']/div[3]/div`);
        await element[0].click();
        await delay(1000)
        element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div/input`);
        await element[0].type(saka);
        await delay(1000)
        element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[3]/div/div/div[2]/span/span`);
        await element[0].click();
        await delay(1000)
        //ธนาคาร
        element = await page.$x(`//div[@id='i12']/div[2]`);
        await element[0].click();
        await delay(1000)
        if (date2 > 80) {
            element = await page.$x(`//div[@id='i6']/div[2]`);
            await element[0].click();
            await delay(1000)
        }
        if (date2 > 60) {
            element = await page.$x(`//*[@id="i9"]`);
            await element[0].click();
            await delay(1000)
        }
        if (date2 > 20) {
            element = await page.$x(`//div[@id='i15']/div[2]`);
            await element[0].click();
            await delay(1000)
        }
        if (date2 > 40) {
            element = await page.$x(`//div[@id='i18']/div[2]`);
            await element[0].click();
            await delay(1000)
        }

        // ด้านการฝาก-ถอน
        element = await page.$x(`//div[@id='i29']/div[2]`);
        await element[0].click();
        await delay(1000)
        if (date1 == 1 || date1 == 2 || date1 == 4 || date1 == 8 || date1 == 3 || date1 == 5 || date1 == 7 || date1 == 9) {
            // ด้านการโอนเงิน
            element = await page.$x(`//div[@id='i32']/div[2]`);
            await element[0].click();
            await delay(1000)
        }
        if (date1 == 0 || date1 == 2 || date1 == 4 || date1 == 8 || date1 == 3 || date1 == 5 || date1 == 9 || date1 == 6) {
            // การชำระค่าสินค้า/สาธารณูปโภค
            element = await page.$x(`//div[@id='i41']/div[2]`);
            await element[0].click();
            await delay(1000)
        }

        // เป็นสถาบันการเงินที่มีชื่อเสียง 123456789
        element = await page.$x(`//div[@id='i52']/div[2]`);
        await element[0].click();
        await delay(1000)
        // มีความน่าเชื่อถือและไว้ใจได้ 1245678
        if (date1 == 1 || date1 == 4 || date1 == 5 || date1 == 8 || date1 == 9) {
            element = await page.$x(`//div[@id='i55']/div[2]`);
            await element[0].click();
            await delay(1000)
        }
        // มีบริการที่ดี สะดวก รวดเร็ว 1459
        if (date1 == 1 || date1 == 4 || date1 == 5 || date1 == 8 || date1 == 9) {
            element = await page.$x(`//div[@id='i58']/div[2]`);
            await element[0].click();
            await delay(1000)
        }

        // ผลิตภัณฑ์และบริการมีความน่าสนใจ
        if (date1 == 1 || date1 == 2 || date1 == 3 || date1 == 4 || date1 == 7 || date1 == 9) {
            element = await page.$x(`//div[@id='i61']/div[2]`);
            await element[0].click();
            await delay(1000)
        }
        // มีพนักงานที่เชี่ยวชาญคอยให้คำแนะนำปรึกษา 12345
        if (date1 == 0 || date1 == 2 || date1 == 3 || date1 == 4 || date1 == 5) {
            element = await page.$x(`//div[@id='i64']/div[2]`);
            await element[0].click();
            await delay(1000)
        }
        // มีรูปแบบการให้บริการที่หลากหลาย เช่น สาขา,ตู้ATM และ Mobile Banking เป็นต้น 123456789
        element = await page.$x(`//div[@id='i67']/div[2]`);
        await element[0].click();
        await delay(1000)

        element = await page.$x(`//div[@id='i86']/div[3]/div`);
        await element[0].click();
        await delay(1000)
        //5
        if (date1 > 4) {
            element = await page.$x(`//div[@id='i96']/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//div[@id='i93']/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }
        //6
        if (date2 < 10) {
            console.log("360 :", date2);
            element = await page.$x(`//div[@id='i103']/div[3]/div`);
            await element[0].click();
        } else if (date2 < 30) {
            element = await page.$x(`//div[@id='i106']/div[3]/div`);
            await element[0].click();
        } else if (date2 < 85) {
            element = await page.$x(`//div[@id='i109']/div[3]/div`);
            await element[0].click();
        } else {
            console.log("360 :", date2);

            element = await page.$x(`//div[@id='i112']/div[3]/div`);
            await element[0].click();
        }
        await delay(1000)
        //7
        if (date2 == 0 || date2 == 3 || date2 == 4 || date2 == 5 || date2 == 0 || 6) {
            element = await page.$x(`//div[@id='i120']/div[2]`);
            await element[0].click();
            await delay(1000)
        }
        if (date2 == 0 || date2 == 1 || date2 == 8 || date2 == 0 || 7) {
            element = await page.$x(`//div[@id='i123']/div[2]`);
            await element[0].click();
            await delay(1000)
        }
        element = await page.$x(`//div[@id='i126']/div[2]`);
        await element[0].click();
        await delay(1000)
        //8
        element = await page.$x(`//div[@id='i139']/div[3]/div`);
        await element[0].click();
        await delay(1000)
        element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[3]/div/div/div[2]/span/span`);
        await element[0].click();
        await delay(1000)
        //หน้า 3
        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[2]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[2]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[2]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }

        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[4]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[4]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[4]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }

        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[6]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[6]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[6]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }

        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[8]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[8]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[8]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }

        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[10]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[10]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div/div/div[10]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div/div/div[2]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div/div/div[2]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div/div/div[2]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div/div/div[4]/span/div[2]/div/div/div[3]`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div/div/div[4]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div/div/div[4]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div/div/div[6]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div/div/div[6]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div/div/div[6]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[2]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[2]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[2]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }




        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[4]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[4]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[4]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }




        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[6]/span/div[2]/div/div/div[3]`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[6]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[6]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[8]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[8]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[8]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[10]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[10]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[10]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[12]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[12]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div/div/div[12]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[2]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[2]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[2]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }


        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[4]/span/div[2]/div/div/div[3]`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[4]/span/div[3]/div/div/div[3]`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[4]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[6]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[6]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[6]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[8]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[8]/span/div[3]/div/div/div[3]`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[5]/div/div/div[2]/div/div/div/div[8]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[2]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[2]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[2]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[4]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[4]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[4]/span/div[4]/div/div/div[3]`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[6]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[6]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[6]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }
        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[8]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[8]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[8]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }

        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[10]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[10]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[6]/div/div/div[2]/div/div/div/div[10]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[2]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[2]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[2]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }




        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[4]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[4]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[4]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }



        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[6]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[6]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[6]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }




        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[8]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[8]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[7]/div/div/div[2]/div/div/div/div[8]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }




        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[8]/div/div/div[2]/div/div/div/div[2]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[8]/div/div/div[2]/div/div/div/div[2]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[8]/div/div/div[2]/div/div/div/div[2]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }




        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[8]/div/div/div[2]/div/div/div/div[4]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[8]/div/div/div[2]/div/div/div/div[4]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[8]/div/div/div[2]/div/div/div/div[4]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }




        dayna = new Date().getTime();
        console.log(Number(dayna.toString().substr(-2, 2)));
        if (Number(dayna.toString().substr(-1, 1)) > 5) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[8]/div/div/div[2]/div/div/div/div[6]/span/div[2]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else if (Number(dayna.toString().substr(-1, 1)) > 1) {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[8]/div/div/div[2]/div/div/div/div[6]/span/div[3]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        } else {
            element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[2]/div[8]/div/div/div[2]/div/div/div/div[6]/span/div[4]/div/div/div[3]/div`);
            await element[0].click();
            await delay(1000)
        }

        element = await page.$x(`//form[@id='mG61Hd']/div[2]/div/div[3]/div/div/div[2]/span/span`);
        await element[0].click();
        await delay(5000)
        await page.goto(`https://docs.google.com/forms/d/e/1FAIpQLScDJBndRNpINC0CMoSWNIxcBj4oZY_Ar9EACXiwLO97D-Z6ZA/viewform`, { waitUntil: 'networkidle0' });
        await delay(1000)
    }

})();
        // คณะบริหารธุรกิจ
    // 1.การเงิน
    // 2.การจัดการ
    // 3.การบัญขี
    // 4.การตลาด
    // 5.ระบบสาระสนเทศทางคอมพิวเตอร์
    // คณะวิทยาศาสตร์และศิลปศาสตร์
    // 1. วิทยาศาสตร์การกีฬา
    // 2. โลจิสติกส์
    // 3. เคมี
    // 4. เทคโนโลยีชีวภาพ
    // 5. ฟิสิกส์
    // 6. วัสดุศาสตร์
    // 7. สถิติ
    // 8. วิทยาการคอมพิวเตอร์
    // 9. เทคโนโลยีการเกษตร
    // 10. การท่องเที่ยวและการโรงแรม
    // 11. อังกฤษ
    // 12. สื่อสารมวลชนและเอกสาร
    // คณะศิลปกรรมและออกแบบอุตสาหกรรม
    // 1. วิศวกรรมเกษตร
    // 2. วิศวกรรมคอมพิวเตอร์
    // 3. วิศวกรรมเครื่องกล
    // 4. วิศวกรรมพลังงาน
    // 5. วิศวกรรมไฟฟ้า
    // 6. วิศวกรรมไฟฟ้าสื่อสาร วิศวกรรมโทรคมนาคม
    // 7. วิศวกรรมเมคคาทรอนิกส์
    // 8. วิศวกรรมโยธา
    // 9. วิศวกรรมระบบราง
    // 10. วิศวกรรมโลจิสติกส์
    // 11. วิศวกรรมวัสดุ
    // 12. วิศวกรรมสำรวจ
    // 13. วิศวกรรมอากาศยาน
    // 14. วิศวกรรมอิเล็กทรอนิกส์
    // 15. วิศวกรรมอุตสาหการ
    // คณะเกษตรศาสตร์และเทคโนโลยี
    // 1. เคมี
    // 2. เทคโนโลยีสิ่งแวดล้อม
    // 3. วิทยาการคอมพิวเตอร์
    // 4. วิศวกรรมเกษตร
    // 5. วิศวกรรมเครื่องกล
    // 6. เกษตรศาสตร์
    // 7. ประมง
    // 8. อุตสาหกรรมเกษตร
    // 9. สัตวศาสตร์
    // 10. พืชศาสตร์
    // 11. คอมพิวเตอร์
    // 12. การออกแบบ
    // คณะเทคโนโลยีการจัดการ
    // 1. เทคโนโลยีสารสนเทศ
    // 2. การจัดการ
    // 3. การบัญชี
    // 4. การตลาด
    // 5. ระบบสารสนเทศ
    // 6. การท่องเที่ยวและการโรงแรม
    // 7. อังกฤษ
    // คณะครุศาสตร์อุตสาหกรรม
    // 1. คอมพิวเตอร์
    // 2. เครื่องกล
    // 3. ไฟฟ้า
    // 4. โยธา
    // 5. อิเล็กทรอนิกส์
    // 6. อุตสาหกรรม
    // 7. อุตสาหการ
    // 8. อังกฤษ
    // คณะวิศวกรรมศาสตร์
    // 1. เคมี
    // 2. ฟิสิกส์
    // 3. วิศวกรรมเกษตร
    // 4. วิศวกรรมคอมพิวเตอร์
    // 5. วิศวกรรมเครื่องกล
    // 6. วิศวกรรมไฟฟ้า
    // 7. วิศวกรรมเมคคาทรอนิกส์
    // 8. วิศวกรรมโยธา
    // 9. วิศวกรรมวัสดุ
    // 10. วิศวกรรมอิเล็กทรอนิกส์
    // 11. วิศวกรรมอุตสาหการ
    // คณะบริหารธุรกิจและเทคโนโลยีสารสนเทศ
    // 1. การจัดการ
    // 2. การบัญชี
    // 3. การตลาด
    // 4. ระบบสารสนเทศ
    // 5. โลจิสติกส์
    // 6. การท่องเที่ยวและการโรงแรม
    // คณะทรัพยากรธรรมชาติ
    // 1. การบริการ
    // 2. การแพทย์แผนไทย
    // 3. เครื่องสำอาง ความงาม
    // 4. สัตวแพทยศาสตร์
    // 5. เทคโนโลยีการอาหาร
    // 6. พฤกษศาสตร์
    // 7. วิทยาศาสตร์ทางทะเล
    // 8. สัตววิทยา
