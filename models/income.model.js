const mongoose = require('mongoose')
const Schema = mongoose.Schema

const IncomeSchema = new Schema(
  {
    usernameAG: String,
    mindsetID: String,
    onlineCustomer: String,
    commissionAgen: String,
    winAndLoseAgen: String,
    winAndLoseMaster: String,
    agStatus:String,
    
    positiveBalance: String,
    deductionWind: String,
    lastStatus:String,

    behindhand:String,
    statusFlag: { type: String, default: 'A' },
    action: String,
    createdBy: mongoose.Types.ObjectId,
    updatedBy: mongoose.Types.ObjectId,
    setZeroBy: mongoose.Types.ObjectId,
    upAgentBy: mongoose.Types.ObjectId
  },
  { timestamps: true, versionKey: false }
)

const IncomeModel = mongoose.model('Income', IncomeSchema)

module.exports = IncomeModel
// ------------ จาก AG
//3 onlineCustomer 5 ออนไลน์
//4 commissionAgen 9 ค่าคอม
//5 winAndLoseAgen 10 ลูกได้เสียของเอเย่น
//6 winAndLoseMaster 14 ลูกได้เสียของมาสเตอร์
//------------- จาก ยอดจากอาทิตย์ที่แล้ว
//8 positiveBalance ยอดค้างบวกได้จาก 9 summaryLoss จาก คำนวนแสดงเอง
//12 transferBalance ยอดค้างบวกได้จาก 13 transferAmount จาก คำนวนแสดงเอง
//------------- จาก คำนวนแสดงเอง
//6 customerEarn ลูกค้าได้
//7 customerLose ลูกค้าเสีย
//9 summaryLoss สรุปยอดได้เสีย
//11 deductionWind หักยูสลม
//13 transferAmount ยอดโอน
//---- ยูสลม ---
//10 userWind ยูสลม


//2 usernameAG รหัสพันธมิตร ตำแหน่ง 0
//3 onlineCustomer 6 ออนไลน์ ตำแหน่ง 5
//4 commissionAgen 10 ค่าคอม ตำแหน่ง 9
//5 winAndLoseAgen 11 ลูกได้เสียของเอเย่น ตำแหน่ง 10
//9 winAndLoseMaster 11 ลูกได้เสียของเอเย่น ตำแหน่ง 14

//6 customerEarn ลูกค้าได้
//7 customerLose ลูกค้าเสีย
//8 positiveBalance ยอดค้างบวกได้จาก 9 summaryLoss จาก คำนวนแสดงเอง
//10 userWind ยูสลม
//9 summaryLoss สรุปยอดได้เสีย
//12 transferBalance ยอดค้างบวกได้จาก 13 transferAmount จาก คำนวนแสดงเอง
//13 transferAmount ยอดโอน