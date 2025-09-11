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