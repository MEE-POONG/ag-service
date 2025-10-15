import axios from '@/lib/axios';

export interface PositionOrderIssue {
  type: 'duplicate' | 'gap' | 'invalid';
  description: string;
  positions?: Array<{ id: string; name: string; priority: number }>;
}

export interface PositionOrderValidation {
  isValid: boolean;
  issues: PositionOrderIssue[];
  message: string;
}

/**
 * ตรวจสอบและแก้ไขลำดับตำแหน่งในแผนก
 */
export const validatePositionOrder = async (departmentId: string): Promise<PositionOrderValidation> => {
  try {
    const response = await axios.patch('/api/admin-positions', {
      action: 'validate',
      departmentId
    });

    if (response.data?.success) {
      return {
        isValid: !response.data.data?.hasIssues,
        issues: [],
        message: response.data.message
      };
    } else {
      throw new Error(response.data?.error || 'เกิดข้อผิดพลาดในการตรวจสอบ');
    }
  } catch (error: any) {
    console.error('Error validating position order:', error);
    return {
      isValid: false,
      issues: [{
        type: 'invalid',
        description: error?.response?.data?.error || error?.message || 'เกิดข้อผิดพลาดในการตรวจสอบ'
      }],
      message: 'เกิดข้อผิดพลาดในการตรวจสอบลำดับตำแหน่ง'
    };
  }
};

/**
 * จัดลำดับตำแหน่งใหม่ในแผนก
 */
export const resequencePositions = async (departmentId: string): Promise<boolean> => {
  try {
    const response = await axios.patch('/api/admin-positions', {
      action: 'resequence',
      departmentId
    });

    if (response.data?.success) {
     // console.log('✅ Positions resequenced successfully:', response.data.message);
      return true;
    } else {
      throw new Error(response.data?.error || 'เกิดข้อผิดพลาดในการจัดลำดับ');
    }
  } catch (error: any) {
    console.error('Error resequencing positions:', error);
    throw new Error(error?.response?.data?.error || error?.message || 'เกิดข้อผิดพลาดในการจัดลำดับ');
  }
};

/**
 * ตรวจสอบลำดับตำแหน่งในแผนก
 */
export const checkPositionOrder = async (departmentId: string): Promise<PositionOrderValidation> => {
  try {
    // ดึงข้อมูลตำแหน่งในแผนก
    const response = await axios.get('/api/admin-positions', {
      params: { departmentId, pageSize: 1000 }
    });

    if (!response.data?.success) {
      throw new Error('ไม่สามารถดึงข้อมูลตำแหน่งได้');
    }

    const positions = response.data.data || [];
    const issues: PositionOrderIssue[] = [];

    // ตรวจสอบลำดับที่ซ้ำกัน
    const priorityCounts = new Map<number, number>();
    positions.forEach((pos: any) => {
      const count = priorityCounts.get(pos.priority) || 0;
      priorityCounts.set(pos.priority, count + 1);
    });

    const duplicates = Array.from(priorityCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([priority]) => priority);

    if (duplicates.length > 0) {
      issues.push({
        type: 'duplicate',
        description: `พบลำดับที่ซ้ำกัน: ${duplicates.join(', ')}`,
        positions: positions.filter((pos: any) => duplicates.includes(pos.priority))
      });
    }

    // ตรวจสอบลำดับที่ขาดหายไป
    if (positions.length > 0) {
      const sortedPositions = positions.sort((a: any, b: any) => a.priority - b.priority);
      const expectedPriorities = Array.from({ length: sortedPositions.length }, (_, i) => i + 1);
      const actualPriorities = sortedPositions.map((pos: any) => pos.priority);
      
      const gaps = expectedPriorities.filter((expected, index) => expected !== actualPriorities[index]);
      
      if (gaps.length > 0) {
        issues.push({
          type: 'gap',
          description: `พบลำดับที่ขาดหายไป: ${gaps.join(', ')}`,
          positions: sortedPositions
        });
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      message: issues.length === 0 ? 'ลำดับตำแหน่งถูกต้องแล้ว' : `พบปัญหา ${issues.length} รายการ`
    };
  } catch (error: any) {
    console.error('Error checking position order:', error);
    return {
      isValid: false,
      issues: [{
        type: 'invalid',
        description: error?.response?.data?.error || error?.message || 'เกิดข้อผิดพลาดในการตรวจสอบ'
      }],
      message: 'เกิดข้อผิดพลาดในการตรวจสอบลำดับตำแหน่ง'
    };
  }
};

/**
 * แสดงข้อความแจ้งเตือนเกี่ยวกับลำดับตำแหน่ง
 */
export const getPositionOrderAlert = (validation: PositionOrderValidation) => {
  if (validation.isValid) {
    return {
      type: 'success' as const,
      title: '✅ ลำดับตำแหน่งถูกต้อง',
      message: validation.message
    };
  }

  const issueDescriptions = validation.issues.map(issue => issue.description).join('; ');
  
  return {
    type: 'warning' as const,
    title: '⚠️ พบปัญหาลำดับตำแหน่ง',
    message: `${validation.message}: ${issueDescriptions}`,
    action: 'แนะนำให้ใช้ปุ่ม "จัดลำดับใหม่" เพื่อแก้ไขปัญหา'
  };
};
