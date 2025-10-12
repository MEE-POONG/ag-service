// Mock Data สำหรับการพัฒนาและทดสอบ

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  AdminPositionDB: AdminPositionDB[];
}

export interface AdminPositionDB {
  id: string;
  name: string;
  description?: string;
  priority: number;
  departmentId?: string;
  department?: Department;
  isActive: boolean;
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
  name: string;
  email: string;
  tel?: string;
  AdminPositionDBId?: string;
  AdminPositionDB?: AdminPositionDB;
  webBaseId?: string;
  WebBaseDB?: WebBaseDB;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  nickname?: string;
  email: string;
  tel?: string;
  img?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WebBaseDB {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface AGUser {
  id: string;
  userAg: string;
  userLogin: string;
  adviser?: string;
  webBaseId: string;
  WebBaseDB: WebBaseDB;
  isActive: boolean;
  createdAt: string;
}

// Mock Departments Data
export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'แผนกเทคโนโลยีสารสนเทศ',
    description: 'รับผิดชอบระบบเทคโนโลยีสารสนเทศและการพัฒนาระบบ',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    AdminPositionDB: [
      {
        id: '1',
        name: 'หัวหน้าแผนก IT',
        description: 'ควบคุมดูแลแผนกเทคโนโลยีสารสนเทศ',
        priority: 1,
        departmentId: '1',
        isActive: true,
        createdAt: '2024-01-15T08:00:00Z'
      },
      {
        id: '2',
        name: 'นักพัฒนาระบบ',
        description: 'พัฒนาและดูแลระบบซอฟต์แวร์',
        priority: 2,
        departmentId: '1',
        isActive: true,
        createdAt: '2024-01-15T08:30:00Z'
      },
      {
        id: '3',
        name: 'ผู้ดูแลระบบ',
        description: 'ดูแลระบบเครือข่ายและฐานข้อมูล',
        priority: 3,
        departmentId: '1',
        isActive: false,
        createdAt: '2024-01-15T09:00:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'แผนกทรัพยากรบุคคล',
    description: 'จัดการทรัพยากรบุคคลและสวัสดิการพนักงาน',
    isActive: true,
    createdAt: '2024-01-16T08:00:00Z',
    AdminPositionDB: [
      {
        id: '4',
        name: 'หัวหน้าแผนก HR',
        description: 'บริหารจัดการแผนกทรัพยากรบุคคล',
        priority: 1,
        departmentId: '2',
        isActive: true,
        createdAt: '2024-01-16T08:00:00Z'
      },
      {
        id: '5',
        name: 'เจ้าหน้าที่ HR',
        description: 'ดูแลการสรรหาและจัดการพนักงาน',
        priority: 2,
        departmentId: '2',
        isActive: true,
        createdAt: '2024-01-16T08:30:00Z'
      }
    ]
  },
  {
    id: '3',
    name: 'แผนกการเงิน',
    description: 'จัดการด้านการเงินและบัญชี',
    isActive: true,
    createdAt: '2024-01-17T08:00:00Z',
    AdminPositionDB: [
      {
        id: '6',
        name: 'หัวหน้าแผนกการเงิน',
        description: 'ควบคุมดูแลด้านการเงินและบัญชี',
        priority: 1,
        departmentId: '3',
        isActive: true,
        createdAt: '2024-01-17T08:00:00Z'
      },
      {
        id: '7',
        name: 'นักบัญชี',
        description: 'จัดทำบัญชีและรายงานทางการเงิน',
        priority: 2,
        departmentId: '3',
        isActive: true,
        createdAt: '2024-01-17T08:30:00Z'
      }
    ]
  }
];

// Mock WebBases Data
export const mockWebBases: WebBaseDB[] = [
  {
    id: '1',
    name: 'เว็บไซต์หลัก',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'เว็บไซต์สำรอง',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'เว็บไซต์ทดสอบ',
    isActive: false,
    createdAt: '2024-01-03T00:00:00Z'
  }
];

// Mock Admins Data
export const mockAdmins: Admin[] = [
  {
    id: '1',
    username: 'admin001',
    name: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    tel: '081-234-5678',
    AdminPositionDBId: '1',
    webBaseId: '1',
    isActive: true,
    createdAt: '2024-01-20T08:00:00Z'
  },
  {
    id: '2',
    username: 'dev001',
    name: 'สมหญิง รักงาน',
    email: 'somying@example.com',
    tel: '082-345-6789',
    AdminPositionDBId: '2',
    webBaseId: '1',
    isActive: true,
    createdAt: '2024-01-21T08:00:00Z'
  },
  {
    id: '3',
    username: 'hr001',
    name: 'วิไล สุขใจ',
    email: 'wilai@example.com',
    tel: '083-456-7890',
    AdminPositionDBId: '4',
    webBaseId: '1',
    isActive: true,
    createdAt: '2024-01-22T08:00:00Z'
  }
];

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'user001',
    firstname: 'นพดล',
    lastname: 'สมบูรณ์',
    nickname: 'ดล',
    email: 'noppodol@example.com',
    tel: '084-567-8901',
    isActive: true,
    createdAt: '2024-02-01T08:00:00Z'
  },
  {
    id: '2',
    username: 'user002',
    firstname: 'มาลี',
    lastname: 'งามดี',
    nickname: 'มาลี',
    email: 'malee@example.com',
    tel: '085-678-9012',
    isActive: true,
    createdAt: '2024-02-02T08:00:00Z'
  },
  {
    id: '3',
    username: 'user003',
    firstname: 'สมศักดิ์',
    lastname: 'รุ่งเรือง',
    nickname: 'ศักดิ์',
    email: 'somsak@example.com',
    tel: '086-789-0123',
    isActive: false,
    createdAt: '2024-02-03T08:00:00Z'
  }
];

// Mock AG Users Data
export const mockAGUsers: AGUser[] = [
  {
    id: '1',
    userAg: 'AG001',
    userLogin: 'aguser001',
    adviser: 'สมชาย ใจดี',
    webBaseId: '1',
    WebBaseDB: mockWebBases[0],
    isActive: true,
    createdAt: '2024-02-10T08:00:00Z'
  },
  {
    id: '2',
    userAg: 'AG002',
    userLogin: 'aguser002',
    adviser: 'สมหญิง รักงาน',
    webBaseId: '1',
    WebBaseDB: mockWebBases[0],
    isActive: true,
    createdAt: '2024-02-11T08:00:00Z'
  },
  {
    id: '3',
    userAg: 'AG003',
    userLogin: 'aguser003',
    webBaseId: '2',
    WebBaseDB: mockWebBases[1],
    isActive: false,
    createdAt: '2024-02-12T08:00:00Z'
  }
];

// User Permissions Data
export const mockUserPermissions = {
  admin: [
    'dashboard',
    'users',
    'admins',
    'departments',
    'positions',
    'permissions',
    'ag_websites',
    'ag_users',
    'reports',
    'documents',
    'system_settings',
    'backup',
    'activity_log'
  ],
  user: [
    'dashboard',
    'ag_websites',
    'ag_users',
    'reports',
    'documents'
  ],
  aguser: [
    'dashboard',
    'documents'
  ]
};

// Dashboard Statistics
export const mockDashboardStats = {
  totalUsers: 1250,
  totalAdmins: 15,
  totalDepartments: 8,
  totalAGUsers: 450,
  activeWebsites: 12,
  todayLogins: 89,
  monthlyReports: 25,
  systemUptime: '99.9%'
}; 
