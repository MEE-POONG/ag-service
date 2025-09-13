// Types สำหรับ SetZero System

export interface SetZeroData {
  customerId: string;
  agentId: string;
  createdBy: string;
}

export interface SetZero {
  id: string;
  customerId: string;
  agentId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  agent?: {
    username: string;
    userLogin: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface SetZeroFormData {
  customerId: string;
  agentId: string;
}

export interface SetZeroResponse {
  success: boolean;
  data?: SetZero;
  message?: string;
  error?: string;
}

export interface SetZeroListResponse {
  success: boolean;
  data?: SetZero[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

// API request types
export interface CreateSetZeroRequest {
  customerId: string;
  agentId: string;
  createdBy?: string;
}

export interface GetSetZeroRequest {
  id: string;
}

export interface ListSetZeroRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateSetZeroStatusRequest {
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  updatedBy?: string;
}

// Agent selection interface
export interface AgentOption {
  id: string;
  username: string;
  userLogin: string;
}

const a = [
  `ufh27oa10116`,
  `ufh27oa10115`,
  `ufh27oa10114`,
  `ufh27oa10113`,
  `ufh27oa10112`,
  `ufh27oa10111`,
  `ufh27oa10110`,
  `ufh27oa10109`,
  `ufh27oa10108`,
  `ufh27oa10107`,
  `ufh27oa10106`,
  `ufh27oa10105`,
  `ufh27oa10104`,
  `ufh27oa10103`,
  `ufh27oa10102`,
  `ufh27oa10101`,
  `ufh27oa10100`,
  `ufh27oa10090`,
  `ufh27oa10089`,
  `ufh27oa10088`,
  `ufh27oa10087`,
  `ufh27oa10086`,
  `ufh27oa10085`,
  `ufh27oa10084`,
  `ufh27oa10083`,
  `ufh27oa10082`,
  `ufh27oa10081`,
  `ufh27oa10080`,
  `ufh27oa10079`,
  `ufh27oa10078`,
  `ufh27oa10077`,
  `ufh27oa10076`,
  `ufh27oa10075`,
  `ufh27oa10074`,
  `ufh27oa10073`,
  `ufh27oa10072`,
  `ufh27oa10071`,
  `ufh27oa10070`,
  `ufh27oa10069`,
  `ufh27oa10068`,
  `ufh27oa10067`,
  `ufh27oa10066`,
  `ufh27oa10065`,
  `ufh27oa10064`,
  `ufh27oa10063`,
  `ufh27oa10062`,
  `ufh27oa10061`,
  `ufh27oa10060`,
  `ufh27oa10059`,
  `ufh27oa10058`,
  `ufh27oa10057`,
  `ufh27oa10056`,
  `ufh27oa10055`,
  `ufh27oa10054`,
  `ufh27oa10053`,
  `ufh27oa10052`,
  `ufh27oa10051`,
  `ufh27oa10050`,
  `ufh27oa10049`,
  `ufh27oa10048`,
  `ufh27oa10047`,
  `ufh27oa10046`,
  `ufh27oa10045`,
  `ufh27oa10044`,
  `ufh27oa10043`,
  `ufh27oa10042`,
  `ufh27oa10041`,
  `ufh27oa10040`,
  `ufh27oa10039`,
  `ufh27oa10038`,
  `ufh27oa10037`,
  `ufh27oa10036`,
  `ufh27oa10035`,
  `ufh27oa10034`,
  `ufh27oa10033`,
  `ufh27oa10032`,
  `ufh27oa10031`,
  `ufh27oa10025`,
  `ufh27oa10023`,
  `ufh27oa10022`,
  `ufh27oa10021`,
  `ufh27oa10014`,
  `ufh27oa10010`,
  `ufh27oa1000NaN`,
  `ufh27oa10004`,
  `ufh27oa10003`,
  `ufh27oa10002`,
  `ufh27oa10001`,
  `ufh27oa10000000`,
  `ufh27oa1000000`,
  `ufh27oa100000`,
  `ufh27oa10000`,
  `ufh27oa1000`,
  `ufh27oa100`,
  `ufh27oa10`,
];