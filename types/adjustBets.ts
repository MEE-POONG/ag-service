// Types สำหรับ Adjust Bets (ตามข้อมูลจริงจาก ME004DB)

export interface AdjustBetsData {
  customer: string;
  usernameAG: string;
  agBaseUrl: string;
  pinUsed: string;
  sportsbook: SportsbookData;
  sexy: SexyData;
  sa: SaData;
  slotItp: SlotItpData;
  slotJoker: SlotJokerData;
  slotPlaystar: SlotPlaystarData;
  cockfight: CockfightData;
  muayStep: MuayStepData;
  virtualSports: VirtualSportsData;
  overallStatus: string;
  attemptCount: number;
  createdBy: string;
  updatedBy: string;
  lastError?: string;
}

export interface SportsbookData {
  enabled: boolean;
  commission: {
    main: number;
    x12: number;
    par: number;
    other: number;
  };
  limits: {
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
  };
  statusServe: string;
  lastSavedAt?: string;
  lastError?: string;
}

export interface SexyData {
  enabled: boolean;
  profile: number;
  statusServe: string;
}

export interface SaData {
  enabled: boolean;
  commissionRAR: number;
  profile: number;
  statusServe: string;
}

export interface SlotItpData {
  enabled: boolean;
  statusServe: string;
}

export interface SlotJokerData {
  enabled: boolean;
  statusServe: string;
}

export interface SlotPlaystarData {
  enabled: boolean;
  statusServe: string;
}

export interface CockfightData {
  enabled: boolean;
  commissionRBG: number;
  statusServe: string;
}

export interface MuayStepData {
  enabled: boolean;
  statusServe: string;
}

export interface VirtualSportsData {
  enabled: boolean;
  statusServe: string;
}

// Database Model
export interface AdjustBets {
  id: string;
  customer: string;
  usernameAG: string;
  agBaseUrl: string;
  pinUsed: string;
  sportsbook: SportsbookData;
  sexy: SexyData;
  sa: SaData;
  slotItp: SlotItpData;
  slotJoker: SlotJokerData;
  slotPlaystar: SlotPlaystarData;
  cockfight: CockfightData;
  muayStep: MuayStepData;
  virtualSports: VirtualSportsData;
  overallStatus: string;
  attemptCount: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastError?: string;
}

// API Response Types
export interface AdjustBetsListResponse {
  success: boolean;
  data?: AdjustBets[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export interface AdjustBetsResponse {
  success: boolean;
  data?: AdjustBets;
  message?: string;
  error?: string;
}

export interface CreateAdjustBetsRequest {
  customer: string;
  usernameAG: string;
  agBaseUrl: string;
  pinUsed: string;
  sportsbook?: SportsbookData;
  sexy?: SexyData;
  sa?: SaData;
  slotItp?: SlotItpData;
  slotJoker?: SlotJokerData;
  slotPlaystar?: SlotPlaystarData;
  cockfight?: CockfightData;
  muayStep?: MuayStepData;
  virtualSports?: VirtualSportsData;
  overallStatus?: string;
  attemptCount?: number;
  createdBy?: string;
  updatedBy?: string;
  lastError?: string;
}

export interface UpdateAdjustBetsRequest {
  customer?: string;
  usernameAG?: string;
  agBaseUrl?: string;
  pinUsed?: string;
  sportsbook?: SportsbookData;
  sexy?: SexyData;
  sa?: SaData;
  slotItp?: SlotItpData;
  slotJoker?: SlotJokerData;
  slotPlaystar?: SlotPlaystarData;
  cockfight?: CockfightData;
  muayStep?: MuayStepData;
  virtualSports?: VirtualSportsData;
  overallStatus?: string;
  attemptCount?: number;
  createdBy?: string;
  updatedBy?: string;
  lastError?: string;
}
