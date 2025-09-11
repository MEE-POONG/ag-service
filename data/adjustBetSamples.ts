import { AdjustBetSample } from '@/types/adjustBet';

// ตัวอย่างข้อมูล Adjust Bet ตามที่ระบุใน JSON
export const adjustBetSamples: AdjustBetSample[] = [
  {
    id: "sample-001",
    name: "ลูกค้าทั่วไป - Sportsbook + Sexy",
    description: "ตัวอย่างการปรับเบทสำหรับลูกค้าทั่วไป เปิดใช้งาน Sportsbook และ Sexy",
    data: {
      customer: "ufh27oa10001",
      usernameAG: "ufh27oa1ufa66",
      agBaseUrl: "https://ag.ufabet.com",
      pinUsed: "221308",
      sportsbook: {
        work: false,
        commission: {
          main: 0,
          x12: 0,
          par: 0,
          other: 0
        },
        limits: {
          transLimit: 50000,
          beforeRun: 50000,
          maxX12: 50000,
          matchLimitX12: 50000,
          maxPar: 50000,
          par: 50000,
          maxOther: 50000,
          matchLimitOther: 50000,
          maxOS: 50000,
          matchLimitOS: 50000
        }
      },
      sexy: {
        enabled: true,
        profile: 1,
        work: false
      },
      sa: {
        enabled: false,
        commissionRAR: 0,
        profile: 1,
        work: false
      },
      slotItp: {
        enabled: false,
        work: false
      },
      slotJoker: {
        enabled: false,
        work: false
      },
      slotPlaystar: {
        enabled: false,
        work: false
      },
      lottoRCW: {
        enabled: false,
        work: false,
      },
      lottoRDC: {
        enabled: false,
        work: false
      },
      cockfight: {
        enabled: false,
        commissionRBG: 0,
        work: false,
        profile: 1
      },
      muayStep: {
        enabled: false,
        work: false,
        profile: 1
      },
      virtualSports: {
        enabled: false,
        work: false,
        profile: 1
      },
      createdBy: "507f1f77bcf86cd799439011",
      updatedBy: "507f1f77bcf86cd799439011"
    }
  },
  {
    id: "sample-002",
    name: "ลูกค้า VIP - ทุกเกมเปิดใช้งาน",
    description: "ตัวอย่างการปรับเบทสำหรับลูกค้า VIP ที่เปิดใช้งานทุกเกม",
    data: {
      customer: "ufh27oa10002",
      usernameAG: "ufh27oa1ufa66",
      agBaseUrl: "https://ag.ufabet.com",
      pinUsed: "999999",
      sportsbook: {
        commission: {
          main: 0,
          x12: 0,
          par: 0,
          other: 0
        },
        limits: {
          transLimit: 500000,
          beforeRun: 250000,
          maxX12: 50000,
          matchLimitX12: 10,
          maxPar: 100000,
          par: 75000,
          maxOther: 25000,
          matchLimitOther: 8,
          maxOS: 150000,
          matchLimitOS: 20
        },
        work: false
      },
      sexy: {
        enabled: true,
        profile: 2,
        work: false
      },
      sa: {
        enabled: true,
        commissionRAR: 0.5,
        profile: 2,
        work: false
      },
      slotItp: {
        enabled: true,
        work: false
      },
      slotJoker: {
        enabled: true,
        work: false
      },
      slotPlaystar: {
        enabled: true,
        work: false
      },
      lottoRCW: {
        enabled: true,
        work: false,
      },
      lottoRDC: {
        enabled: true,
        work: false
      },
      cockfight: {
        enabled: true,
        commissionRBG: 0.3,
        work: false,
        profile: 1
      },
      muayStep: {
        enabled: true,
        work: false,
        profile: 1
      },
      virtualSports: {
        enabled: true,
        work: false,
        profile: 1
      },
      createdBy: "507f1f77bcf86cd799439011",
      updatedBy: "507f1f77bcf86cd799439011"
    }
  },
  {
    id: "sample-003",
    name: "ลูกค้า Slot เท่านั้น",
    description: "ตัวอย่างการปรับเบทสำหรับลูกค้าที่เล่น Slot เท่านั้น",
    data: {
      customer: "ufh27oa10003",
      usernameAG: "ufh27oa1ufa66",
      agBaseUrl: "https://ag.ufabet.com",
      pinUsed: "999999",
      sportsbook: {
        work: false,
        commission: {
          main: 0,
          x12: 0,
          par: 0,
          other: 0
        },
        limits: {
          transLimit: 5000,
          beforeRun: 5000,
          maxX12: 5000,
          matchLimitX12: 5000,
          maxPar: 5000,
          par: 5000,
          maxOther: 5000,
          matchLimitOther: 5000,
          maxOS: 5000,
          matchLimitOS: 5000
        }
      },
      sexy: {
        enabled: false,
        work: false,
        profile: 1
      },
      sa: {
        enabled: false,
        commissionRAR: 0,
        work: false,
        profile: 1
      },
      slotItp: {
        enabled: true,
        work: false
      },
      slotJoker: {
        enabled: true,
        work: false
      },
      slotPlaystar: {
        enabled: true,
        work: false
      },
      lottoRCW: {
        enabled: false,
        work: false,
      },
      lottoRDC: {
        enabled: false,
        work: false
      },
      cockfight: {
        enabled: false,
        work: false,
        commissionRBG: 0,
        profile: 1
      },
      muayStep: {
        enabled: false,
        work: false,
        profile: 1
      },
      virtualSports: {
        enabled: false,
        work: false,
        profile: 1
      },
      createdBy: "507f1f77bcf86cd799439011",
      updatedBy: "507f1f77bcf86cd799439011"
    }
  },
  {
    id: "sample-004",
    name: "ลูกค้า Sportsbook เท่านั้น",
    description: "ตัวอย่างการปรับเบทสำหรับลูกค้าที่เล่น Sportsbook เท่านั้น",
    data: {
      customer: "ufh27oa10004",
      usernameAG: "ufh27oa1ufa66",
      agBaseUrl: "https://ag.ufabet.com",
      pinUsed: "999999",
      sportsbook: {
        work: false,
        commission: {
          main: 0,
          x12: 0,
          par: 0,
          other: 0
        },
        limits: {
          transLimit: 200000,
          beforeRun: 100000,
          maxX12: 20000,
          matchLimitX12: 8,
          maxPar: 40000,
          par: 30000,
          maxOther: 10000,
          matchLimitOther: 5,
          maxOS: 60000,
          matchLimitOS: 15
        }
      },
      sexy: {
        enabled: false,
        work: false,
        profile: 1
      },
      sa: {
        enabled: false,
        commissionRAR: 0,
        profile: 1,
        work: false
      },
      slotItp: {
        enabled: false,
        work: false
      },
      slotJoker: {
        enabled: false,
        work: false
      },
      slotPlaystar: {
        enabled: false,
        work: false
      },
      lottoRCW: {
        enabled: false,
        work: false,
      },
      lottoRDC: {
        enabled: false,
        work: false
      },
      cockfight: {
        enabled: false,
        work: false,
        commissionRBG: 0,
        profile: 1
      },
      muayStep: {
        enabled: false,
        work: false,
        profile: 1
      },
      virtualSports: {
        enabled: false,
        work: false,
        profile: 1
      },
      createdBy: "507f1f77bcf86cd799439011",
      updatedBy: "507f1f77bcf86cd799439011"
    }
  },
  {
    id: "sample-005",
    name: "ลูกค้า Cockfight + Muay Step",
    description: "ตัวอย่างการปรับเบทสำหรับลูกค้าที่เล่น Cockfight และ Muay Step",
    data: {
      customer: "ufh27oa10005",
      usernameAG: "ufh27oa1ufa66",
      agBaseUrl: "https://ag.ufabet.com",
      pinUsed: "999999",
      sportsbook: {
        work: false,
        commission: {
          main: 0,
          x12: 0,
          par: 0,
          other: 0
        },
        limits: {
          transLimit: 5000,
          beforeRun: 5000,
          maxX12: 5000,
          matchLimitX12: 5000,
          maxPar: 5000,
          par: 5000,
          maxOther: 5000,
          matchLimitOther: 5000,
          maxOS: 5000,
          matchLimitOS: 5000
        }
      },
      sexy: {
        enabled: false,
        work: false,
        profile: 1
      },
      sa: {
        enabled: false,
        commissionRAR: 0,
        profile: 1,
        work: false
      },
      slotItp: {
        enabled: false,
        work: false
      },
      slotJoker: {
        enabled: false,
        work: false
      },
      slotPlaystar: {
        enabled: false,
        work: false
      },
      lottoRCW: {
        enabled: false,
        work: false,
      },
      lottoRDC: {
        enabled: false,
        work: false
      },
      cockfight: {
        enabled: true,
        work: false,
        commissionRBG: 0.4,
        profile: 1
      },
      muayStep: {
        enabled: true,
        work: false,
        profile: 1
      },
      virtualSports: {
        enabled: false,
        work: false,
        profile: 1
      },
      createdBy: "507f1f77bcf86cd799439011",
      updatedBy: "507f1f77bcf86cd799439011"
    }
  },
  {
    id: "sample-006",
    name: "ลูกค้า SA (RAR) เท่านั้น",
    description: "ตัวอย่างการปรับเบทสำหรับลูกค้าที่เล่น SA (RAR) เท่านั้น",
    data: {
      customer: "ufh27oa10006",
      usernameAG: "ufh27oa1ufa66",
      agBaseUrl: "https://ag.ufabet.com",
      pinUsed: "999999",
      sportsbook: {
        work: false,
        commission: {
          main: 0,
          x12: 0,
          par: 0,
          other: 0
        },
        limits: {
          transLimit: 5000,
          beforeRun: 5000,
          maxX12: 5000,
          matchLimitX12: 5000,
          maxPar: 5000,
          par: 5000,
          maxOther: 5000,
          matchLimitOther: 5000,
          maxOS: 5000,
          matchLimitOS: 5000
        }
      },
      sexy: {
        enabled: false,
        work: false,
        profile: 1
      },
      sa: {
        enabled: true,
        commissionRAR: 0.6,
        work: false,
        profile: 3
      },
      slotItp: {
        enabled: false,
        work: false
      },
      slotJoker: {
        enabled: false,
        work: false
      },
      slotPlaystar: {
        enabled: false,
        work: false
      },
      lottoRCW: {
        enabled: false,
        work: false,
      },
      lottoRDC: {
        enabled: false,
        work: false
      },
      cockfight: {
        enabled: false,
        work: false,
        commissionRBG: 0,
        profile: 1
      },
      muayStep: {
        enabled: false,
        work: false,
        profile: 1
      },
      virtualSports: {
        enabled: false,
        work: false,
        profile: 1
      },
      createdBy: "507f1f77bcf86cd799439011",
      updatedBy: "507f1f77bcf86cd799439011"
    }
  },
  {
    id: "sample-007",
    name: "ลูกค้า Virtual Sports เท่านั้น",
    description: "ตัวอย่างการปรับเบทสำหรับลูกค้าที่เล่น Virtual Sports เท่านั้น",
    data: {
      customer: "ufh27oa10007",
      usernameAG: "ufh27oa1ufa66",
      agBaseUrl: "https://ag.ufabet.com",
      pinUsed: "999999",
      sportsbook: {
        work: false,
        commission: {
          main: 0,
          x12: 0,
          par: 0,
          other: 0
        },
        limits: {
          transLimit: 5000,
          beforeRun: 5000,
          maxX12: 5000,
          matchLimitX12: 5000,
          maxPar: 5000,
          par: 5000,
          maxOther: 5000,
          matchLimitOther: 5000,
          maxOS: 5000,
          matchLimitOS: 5000
        }
      },
      sexy: {
        enabled: false,
        work: false,
        profile: 1
      },
      sa: {
        enabled: false,
        commissionRAR: 0,
        work: false,
        profile: 1
      },
      slotItp: {
        enabled: false,
        work: false
      },
      slotJoker: {
        enabled: false,
        work: false
      },
      slotPlaystar: {
        enabled: false,
        work: false
      },
      lottoRCW: {
        enabled: false,
        work: false,
      },
      lottoRDC: {
        enabled: false,
        work: false
      },
      cockfight: {
        enabled: false,
        work: false,
        commissionRBG: 0,
        profile: 1
      },
      muayStep: {
        enabled: false,
        work: false,
        profile: 1
      },
      virtualSports: {
        enabled: true,
        work: false,
        profile: 1
      },
      createdBy: "507f1f77bcf86cd799439011",
      updatedBy: "507f1f77bcf86cd799439011"
    }
  },
  {
    id: "sample-008",
    name: "ลูกค้า Sexy + SA",
    description: "ตัวอย่างการปรับเบทสำหรับลูกค้าที่เล่น Sexy และ SA",
    data: {
      customer: "ufh27oa10008",
      usernameAG: "ufh27oa1ufa66",
      agBaseUrl: "https://ag.ufabet.com",
      pinUsed: "999999",
      sportsbook: {
        work: false,
        commission: {
          main: 0,
          x12: 0,
          par: 0,
          other: 0
        },
        limits: {
          transLimit: 5000,
          beforeRun: 5000,
          maxX12: 5000,
          matchLimitX12: 5000,
          maxPar: 5000,
          par: 5000,
          maxOther: 5000,
          matchLimitOther: 5000,
          maxOS: 5000,
          matchLimitOS: 5000
        }
      },
      sexy: {
        enabled: true,
        work: false,
        profile: 2
      },
      sa: {
        enabled: true,
        commissionRAR: 0.4,
        work: false,
        profile: 2,
      },
      slotItp: {
        enabled: false,
        work: false,
      },
      slotJoker: {
        enabled: false,
        work: false,
      },
      slotPlaystar: {
        enabled: false,
        work: false
      },
      lottoRCW: {
        enabled: false,
        work: false,
      },
      lottoRDC: {
        enabled: false,
        work: false
      },
      cockfight: {
        enabled: false,
        work: false,
        profile: 1,
        commissionRBG: 0,
      },
      muayStep: {
        enabled: false,
        work: false,
        profile: 1
      },
      virtualSports: {
        enabled: false,
        work: false,
        profile: 1
      },
      createdBy: "507f1f77bcf86cd799439011",
      updatedBy: "507f1f77bcf86cd799439011"
    }
  }
];

// ฟังก์ชันสำหรับสร้าง Adjust Bet จากตัวอย่าง
export const createAdjustBetFromSample = (sample: AdjustBetSample, customData?: Partial<AdjustBetSample['data']>) => {
  return {
    name: sample.name,
    description: sample.description,
    data: {
      ...sample.data,
      ...customData,
      pinUsed: '' // PIN/OTP ไม่ต้องกรอก
    }
  };
};

// ฟังก์ชันสำหรับค้นหาตัวอย่างตาม ID
export const findSampleById = (id: string): AdjustBetSample | undefined => {
  return adjustBetSamples.find(sample => sample.id === id);
};

// ฟังก์ชันสำหรับค้นหาตัวอย่างตามชื่อ
export const findSamplesByName = (name: string): AdjustBetSample[] => {
  return adjustBetSamples.filter(sample =>
    sample.name.toLowerCase().includes(name.toLowerCase())
  );
};
