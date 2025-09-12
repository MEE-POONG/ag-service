// types.ts
export type BotTile = {
    key: string
    href: string
    icon: string          // ใช้กับ ReactIconComponent
    title: string
    desc: string
    enabled: boolean
    badge?: 'new' | 'beta' | 'soon'
    requireRole?: Array<'STAFF' | 'AGENT' | 'MASTER' | 'ADMIN'>
  }
  
  export type BotSection = {
    key: 'customer' | 'agent' | 'master' | 'reports'
    title: string
    subtitle: string
    cols?: number
    items: BotTile[]
  }
  
  // bot-config.ts

export const botSections: BotSection[] = [
  /* 1) จัดการลูกค้า */
  {
    key: 'customer',
    title: 'จัดการลูกค้า',
    subtitle: 'จัดการข้อมูลลูกค้าและการเข้าถึงระบบด้วยบอท',
    cols: 4,
    items: [
      {
        key: 'AdjustBet',
        href: '/bot-ag/adjust-bet',
        icon: 'FaAdjust',
        title: 'Adjust Bet',
        desc: 'ปรับคอมฯ/ลิมิต ลูกค้าแบบอัตโนมัติ',
        enabled: true,
        badge: 'beta',
        requireRole: ['STAFF', 'ADMIN'],
      },
      {
        key: 'SetZero',
        href: '/bot-ag/set-zero',
        icon: 'FaCheck',
        title: 'Set Zero',
        desc: 'ตั้งค่าคอมฯเป็น 0% ชั่วคราว',
        enabled: false, // ยังไม่เปิด
        badge: 'soon',
        requireRole: ['STAFF', 'ADMIN'],
      },
      {
        key: 'BulkImportCustomers',
        href: '/bot-ag/customers/bulk-import',
        icon: 'FaFileUpload',
        title: 'นำเข้าลูกค้าจำนวนมาก',
        desc: 'อัปโหลดไฟล์ .csv เพื่อลงทะเบียนทีเดียว',
        enabled: false,
        badge: 'new',
        requireRole: ['ADMIN'],
      },
      {
        key: 'ResetPinGa',
        href: '/bot-ag/customers/reset-ga',
        icon: 'FaKey',
        title: 'รีเซ็ต GA/PIN',
        desc: 'รีเซ็ตความปลอดภัยเข้าระบบ',
        enabled: false,
        badge: 'soon',
        requireRole: ['ADMIN'],
      },
    ],
  },

  /* 2) จัดการเอเย่น */
  {
    key: 'agent',
    title: 'จัดการเอเย่น',
    subtitle: 'ระบบจัดการข้อมูลเอเย่นทั้งหมด',
    cols: 4,
    items: [
      {
        key: 'AgUsers',
        href: '/partner/ag-user',
        icon: 'FaUsersCog',
        title: 'AG User',
        desc: 'ดู/เพิ่ม/ปรับสิทธิ์ AG Users',
        enabled: false,
        requireRole: ['MASTER', 'ADMIN'],
      },
      {
        key: 'SyncAgUsers',
        href: '/bot-ag/agents/sync',
        icon: 'FaSync',
        title: 'ซิงค์เอเย่น',
        desc: 'ดึงข้อมูลเอเย่นจากต้นทาง',
        enabled: false,
        badge: 'beta',
        requireRole: ['MASTER', 'ADMIN'],
      },
      {
        key: 'RotateOfficeLinks',
        href: '/bot-ag/agents/rotate-links',
        icon: 'FaExchangeAlt',
        title: 'สลับลิงก์ Office',
        desc: 'ตรวจสอบ/แก้ไขลิงก์ที่ล่มโดยอัตโนมัติ',
        enabled: false,
        badge: 'soon',
        requireRole: ['ADMIN'],
      },
      {
        key: 'ExportAuth',
        href: '/bot-ag/agents/export-auth',
        icon: 'FaLock',
        title: 'Export Auth',
        desc: 'ส่งออกโทเคน/สิทธิ์เข้าใช้งาน (เข้ารหัส)',
        enabled: false,
        requireRole: ['ADMIN'],
      },
    ],
  },

  /* 3) จัดการมาเตอร์ */
  {
    key: 'master',
    title: 'จัดการมาเตอร์',
    subtitle: 'ตั้งค่าแม่ข่าย คอมมิชชัน/ลิมิต/ความเสี่ยง',
    cols: 4,
    items: [
      {
        key: 'CommissionTemplates',
        href: '/bot-ag/master/commission-templates',
        icon: 'FaCoins',
        title: 'แม่แบบคอมมิชชั่น',
        desc: 'สร้าง/แก้ไขเทมเพลตคอมฯ แล้วนำไปใช้เป็นชุด',
        enabled: false,
        requireRole: ['MASTER', 'ADMIN'],
      },
      {
        key: 'MasterLimits',
        href: '/bot-ag/master/limits',
        icon: 'FaSlidersH',
        title: 'ลิมิตกลาง',
        desc: 'กำหนดเพดานเดิมพัน/แมตช์/สเต็ป',
        enabled: false,
        requireRole: ['MASTER', 'ADMIN'],
      },
      {
        key: 'RiskControl',
        href: '/bot-ag/master/risk-control',
        icon: 'FaShieldAlt',
        title: 'ควบคุมความเสี่ยง',
        desc: 'ตั้งค่า rule ป้องกันความเสี่ยง',
        enabled: false,
        badge: 'soon',
        requireRole: ['ADMIN'],
      },
      {
        key: 'AuditLog',
        href: '/bot-ag/master/audit-log',
        icon: 'FaClipboardList',
        title: 'บันทึกการเปลี่ยนแปลง',
        desc: 'ตรวจสอบการแก้ไขทุกระบบ',
        enabled: false,
        requireRole: ['ADMIN'],
      },
    ],
  },

  /* 4) รายงานการเดิมพัน */
  {
    key: 'reports',
    title: 'รายงานการเดิมพัน',
    subtitle: 'ภาพรวมผลประกอบการและกิจกรรมสำคัญ',
    cols: 4,
    items: [
      {
        key: 'PnL',
        href: '/reports/pnl',
        icon: 'FaChartLine',
        title: 'ยอดได้เสีย',
        desc: 'รายงาน P/L รายวัน รายสัปดาห์ รายเดือน',
        enabled: false,
        badge: 'beta',
        requireRole: ['STAFF', 'MASTER', 'ADMIN'],
      },
      {
        key: 'TopUp',
        href: '/reports/topup',
        icon: 'FaWallet',
        title: 'ยอดเติม',
        desc: 'สรุปยอดเติมเงินตามช่วงเวลา/ช่องทาง',
        enabled: false,
        requireRole: ['STAFF', 'MASTER', 'ADMIN'],
      },
      {
        key: 'Withdraw',
        href: '/reports/withdraw',
        icon: 'FaMoneyCheckAlt',
        title: 'ยอดถอน',
        desc: 'รายงานยอดถอนและสถานะคำขอ',
        enabled: false,
        requireRole: ['MASTER', 'ADMIN'],
      },
      {
        key: 'BetActivities',
        href: '/reports/bet-activities',
        icon: 'FaListOl',
        title: 'กิจกรรมเดิมพัน',
        desc: 'ติดตามพฤติกรรมที่เสี่ยง/ผิดปกติ',
        enabled: false,
        badge: 'soon',
        requireRole: ['ADMIN'],
      },
    ],
  },
]
