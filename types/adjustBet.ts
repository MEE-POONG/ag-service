// Types สำหรับ Adjust Bet System

export interface SportsbookCommission {
  main: number;
  x12: number;
  par: number;
  other: number;
}

export interface SportsbookLimits {
  transLimit: number;
  beforeRun: number;
  maxX12: number;
  matchLimitX12: number;
  maxPar: number;
  par: number;
  maxOther: number;
  matchLimitOther: number;
  maxOS: number;
  matchLimitOS: number;
}

export interface Sportsbook {
  work: boolean;
  commission: SportsbookCommission;
  limits: SportsbookLimits;
}

export interface Sexy {
  enabled: boolean;
  work: boolean;
  profile?: number;
}

export interface SA {
  enabled: boolean;
  work: boolean;
  commissionRAR: number;
  profile?: number;
}

export interface SlotItp {
  enabled: boolean;
  work: boolean;
}

export interface SlotJoker {
  enabled: boolean;
  work: boolean;
}

export interface SlotPlaystar {
  enabled: boolean;
  work: boolean;
}

export interface Lottos {
  enabled: boolean;
  work: boolean;
}

export interface Cockfight {
  enabled: boolean;
  work: boolean;
  profile?: number;
  commissionRBG: number;
}

export interface MuayStep {
  enabled: boolean;
  work: boolean;
  profile?: number;
}

export interface VirtualSports {
  enabled: boolean;
  work: boolean;
  profile?: number;
}

export interface AdjustBetData {
  customer: string;
  usernameAG: string;
  agBaseUrl: string;
  pinUsed: string;
  sportsbook: Sportsbook;
  sexy: Sexy;
  sa: SA;
  slotItp: SlotItp;
  slotJoker: SlotJoker;
  slotPlaystar: SlotPlaystar;
  lottoRCW: Lottos;
  lottoRDC: Lottos;
  cockfight: Cockfight;
  muayStep: MuayStep;
  virtualSports: VirtualSports;
  createdBy: string;
  updatedBy: string;
}

export interface AdjustBet {
  id: string;
  name: string;
  description: string;
  data: AdjustBetData;
  createdAt?: Date;
  updatedAt?: Date;
  overallStatus?: string;
}

export interface AdjustBetFormData {
  name: string;
  description: string;
  customer: string;
  usernameAG: string;
  agBaseUrl: string;
  pinUsed: string;
  sportsbook: Sportsbook;
  sexy: Sexy;
  sa: SA;
  slotItp: SlotItp;
  slotJoker: SlotJoker;
  slotPlaystar: SlotPlaystar;
  lottoRDC: Lottos;
  lottoRCW: Lottos;
  cockfight: Cockfight;
  muayStep: MuayStep;
  virtualSports: VirtualSports;
}

// Interface สำหรับ AG User Account
export interface AgUserAccount {
  id: string;
  username: string;
  userLogin: string;
  webname?: string;
  origin?: string;
  position?: string;
  reserve?: string;
}

export interface AdjustBetResponse {
  success: boolean;
  data?: AdjustBet;
  message?: string;
  error?: string;
}

export interface AdjustBetListResponse {
  success: boolean;
  data?: AdjustBet[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

// Sample data types
export interface AdjustBetSample {
  id: string;
  name: string;
  description: string;
  data: AdjustBetData;
}

// Form validation types
export interface AdjustBetValidation {
  name: string;
  customer: string;
  usernameAG: string;
  agBaseUrl: string;
  pinUsed: string;
}

// API request types
export interface CreateAdjustBetRequest {
  name: string;
  description: string;
  data: AdjustBetData;
}

export interface UpdateAdjustBetRequest {
  id: string;
  name?: string;
  description?: string;
  data?: Partial<AdjustBetData>;
}

export interface DeleteAdjustBetRequest {
  id: string;
}

export interface GetAdjustBetRequest {
  id: string;
}

export interface ListAdjustBetRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
