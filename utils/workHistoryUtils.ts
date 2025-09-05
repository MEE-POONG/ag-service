import { Prisma } from '@prisma/client';

// บันทึกประวัติการทำงาน
export async function recordWorkHistory(
  tx: Prisma.TransactionClient,
  tableName: string,
  recordId: string | null,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  oldData: any = null,
  newData: any = null,
  userId: string = 'system',
  userType: string = 'admin',
  isSuccess: boolean = true,
  errorMsg: string | null = null,
  ipAddress?: string | null,
  userAgent?: string | null
) {
  try {
    await tx.workHistoryDB.create({
      data: {
        tableName,
        recordId,
        action,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
        isSuccess,
        errorMsg,
        userId,
        userType,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error(`Failed to record work history for ${tableName}:`, error);
    // ไม่ throw error เพื่อไม่ให้ operation หลักล้มเหลว
  }
}

// ฟังก์ชันช่วยสำหรับแปลง Express Request เป็นข้อมูล User
export function extractUserInfo(req: any) {
  return {
    ipAddress: req?.ip || req?.connection?.remoteAddress || null,
    userAgent: req?.headers?.['user-agent'] || null,
  };
}

// Interface สำหรับ Work History Options
export interface WorkHistoryOptions {
  userId?: string;
  userType?: string;
  ipAddress?: string;
  userAgent?: string;
}