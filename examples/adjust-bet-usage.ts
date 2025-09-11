// ตัวอย่างการใช้งาน Adjust Bet System

import { useAdjustBet } from '@/hooks/useAdjustBet';
import { adjustBetSamples, createAdjustBetFromSample } from '@/data/adjustBetSamples';

// 1. การใช้งาน Hook พื้นฐาน
export const BasicUsageExample = () => {
  const {
    adjustBets,
    isLoading,
    error,
    fetchAdjustBets,
    createAdjustBet,
    updateAdjustBet,
    deleteAdjustBet
  } = useAdjustBet();

  // ดึงข้อมูลทั้งหมด
  const loadAllAdjustBets = async () => {
    await fetchAdjustBets({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // ค้นหาข้อมูล
  const searchAdjustBets = async (searchTerm: string) => {
    await fetchAdjustBets({
      page: 1,
      limit: 10,
      search: searchTerm
    });
  };

  // สร้างจากตัวอย่าง
  const createFromSample = async (sampleId: string) => {
    const sample = adjustBetSamples.find(s => s.id === sampleId);
    if (sample) {
      const adjustBetData = createAdjustBetFromSample(sample, {
        customer: 'new-customer-id',
        usernameAG: 'new-username',
        pinUsed: '123456'
      });
      
      await createAdjustBet(adjustBetData);
    }
  };

  return {
    adjustBets,
    isLoading,
    error,
    loadAllAdjustBets,
    searchAdjustBets,
    createFromSample
  };
};

// 2. การสร้าง Adjust Bet แบบกำหนดเอง
export const createCustomAdjustBet = async () => {
  const { createAdjustBet } = useAdjustBet();

  const customAdjustBet = {
    name: 'ลูกค้า Custom - Sportsbook + Slot',
    description: 'การตั้งค่าสำหรับลูกค้าที่เล่น Sportsbook และ Slot เท่านั้น',
    data: {
      customer: 'custom001',
      usernameAG: 'customuser',
      agBaseUrl: 'https://ag.ufabet.com',
      pinUsed: '999999',
      sportsbook: {
        enabled: true,
        commission: {
          main: 0.5,
          x12: 0.3,
          par: 0.4,
          other: 0.2
        },
        limits: {
          transLimit: 100000,
          beforeRun: 50000,
          maxX12: 25000,
          matchLimitX12: 5,
          maxPar: 50000,
          par: 30000,
          maxOther: 15000,
          matchLimitOther: 3,
          maxOS: 75000,
          matchLimitOS: 10
        }
      },
      sexy: {
        enabled: false,
        profile: 1
      },
      sa: {
        enabled: false,
        commissionRAR: 0,
        profile: 1
      },
      slotItp: {
        enabled: true
      },
      slotJoker: {
        enabled: true
      },
      slotPlaystar: {
        enabled: true
      },
      cockfight: {
        enabled: false,
        commissionRBG: 0
      },
      muayStep: {
        enabled: false
      },
      virtualSports: {
        enabled: false
      },
      createdBy: 'current-user-id',
      updatedBy: 'current-user-id'
    }
  };

  return await createAdjustBet(customAdjustBet);
};

// 3. การอัพเดท Adjust Bet
export const updateAdjustBetExample = async (id: string) => {
  const { updateAdjustBet } = useAdjustBet();

  // อัพเดทเฉพาะบางส่วน
  const updateData = {
    id,
    name: 'ชื่อใหม่',
    data: {
      sportsbook: {
        enabled: true,
        commission: {
          main: 1.0, // เพิ่มคอมมิชชั่น
          x12: 0.5,
          par: 0.8,
          other: 0.3
        },
        limits: {
          transLimit: 200000, // เพิ่มขีดจำกัด
          beforeRun: 100000,
          maxX12: 50000,
          matchLimitX12: 10,
          maxPar: 100000,
          par: 75000,
          maxOther: 30000,
          matchLimitOther: 6,
          maxOS: 150000,
          matchLimitOS: 20
        }
      }
    }
  };

  return await updateAdjustBet(updateData);
};

// 4. การจัดการหลาย Adjust Bet
export const bulkOperationsExample = async () => {
  const { createAdjustBet, deleteAdjustBet } = useAdjustBet();

  // สร้างหลาย Adjust Bet จากตัวอย่าง
  const createMultipleFromSamples = async () => {
    const results = [];
    
    for (const sample of adjustBetSamples.slice(0, 3)) {
      const adjustBetData = createAdjustBetFromSample(sample, {
        customer: `bulk-${sample.id}`,
        usernameAG: `bulkuser-${sample.id}`,
        pinUsed: '111111'
      });
      
      const result = await createAdjustBet(adjustBetData);
      results.push(result);
    }
    
    return results;
  };

  // ลบหลาย Adjust Bet
  const deleteMultiple = async (ids: string[]) => {
    const results = [];
    
    for (const id of ids) {
      const result = await deleteAdjustBet(id);
      results.push({ id, success: result });
    }
    
    return results;
  };

  return {
    createMultipleFromSamples,
    deleteMultiple
  };
};

// 5. การค้นหาและกรองข้อมูล
export const searchAndFilterExample = async () => {
  const { fetchAdjustBets } = useAdjustBet();

  // ค้นหาตามชื่อ
  const searchByName = async (name: string) => {
    return await fetchAdjustBets({
      page: 1,
      limit: 10,
      search: name,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  // ค้นหาตามรหัสลูกค้า
  const searchByCustomer = async (customerId: string) => {
    return await fetchAdjustBets({
      page: 1,
      limit: 10,
      search: customerId
    });
  };

  // เรียงลำดับตามวันที่สร้าง
  const sortByCreatedDate = async (order: 'asc' | 'desc' = 'desc') => {
    return await fetchAdjustBets({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: order
    });
  };

  // Pagination
  const getPage = async (page: number, limit: number = 10) => {
    return await fetchAdjustBets({
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  return {
    searchByName,
    searchByCustomer,
    sortByCreatedDate,
    getPage
  };
};

// 6. การใช้งานใน React Component
export const ReactComponentExample = `
import React, { useState, useEffect } from 'react';
import { useAdjustBet } from '@/hooks/useAdjustBet';
import { adjustBetSamples } from '@/data/adjustBetSamples';

const AdjustBetManager: React.FC = () => {
  const {
    adjustBets,
    isLoading,
    error,
    total,
    page,
    limit,
    fetchAdjustBets,
    createAdjustBet,
    updateAdjustBet,
    deleteAdjustBet
  } = useAdjustBet();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load data on component mount
  useEffect(() => {
    fetchAdjustBets({
      page: currentPage,
      limit: 10,
      search: searchTerm
    });
  }, [currentPage, searchTerm]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Create from sample
  const handleCreateFromSample = async (sampleId: string) => {
    const sample = adjustBetSamples.find(s => s.id === sampleId);
    if (sample) {
      const adjustBetData = {
        name: \`\${sample.name} - Copy\`,
        description: \`สำเนาของ \${sample.description}\`,
        data: {
          ...sample.data,
          customer: \`copy-\${Date.now()}\`,
          usernameAG: \`copyuser-\${Date.now()}\`,
          pinUsed: '123456'
        }
      };
      
      await createAdjustBet(adjustBetData);
    }
  };

  // Update adjust bet
  const handleUpdate = async (id: string) => {
    const updateData = {
      id,
      name: 'Updated Name',
      data: {
        sportsbook: {
          enabled: true,
          commission: { main: 1.0, x12: 0.5, par: 0.8, other: 0.3 },
          limits: {
            transLimit: 200000,
            beforeRun: 100000,
            maxX12: 50000,
            matchLimitX12: 10,
            maxPar: 100000,
            par: 75000,
            maxOther: 30000,
            matchLimitOther: 6,
            maxOS: 150000,
            matchLimitOS: 20
          }
        }
      }
    };
    
    await updateAdjustBet(updateData);
  };

  // Delete adjust bet
  const handleDelete = async (id: string, name: string) => {
    if (confirm(\`คุณแน่ใจหรือไม่ที่จะลบ "\${name}"?\`)) {
      await deleteAdjustBet(id);
    }
  };

  return (
    <div>
      <h1>Adjust Bet Manager</h1>
      
      {/* Search */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ค้นหา Adjust Bet..."
        />
        <button type="submit">ค้นหา</button>
      </form>

      {/* Sample Templates */}
      <div>
        <h3>สร้างจากตัวอย่าง</h3>
        {adjustBetSamples.map(sample => (
          <button
            key={sample.id}
            onClick={() => handleCreateFromSample(sample.id)}
            disabled={isLoading}
          >
            {sample.name}
          </button>
        ))}
      </div>

      {/* Adjust Bets List */}
      {isLoading ? (
        <div>กำลังโหลด...</div>
      ) : error ? (
        <div>เกิดข้อผิดพลาด: {error}</div>
      ) : (
        <div>
          <p>พบ {total} รายการ</p>
          {adjustBets.map(adjustBet => (
            <div key={adjustBet.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h4>{adjustBet.name}</h4>
              <p>{adjustBet.description}</p>
              <p>ลูกค้า: {adjustBet.data.customer}</p>
              <p>Username AG: {adjustBet.data.usernameAG}</p>
              
              <div>
                <button onClick={() => handleUpdate(adjustBet.id)}>
                  อัพเดท
                </button>
                <button onClick={() => handleDelete(adjustBet.id, adjustBet.name)}>
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div>
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          ก่อนหน้า
        </button>
        <span>หน้า {currentPage} จาก {Math.ceil(total / limit)}</span>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage >= Math.ceil(total / limit)}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
};

export default AdjustBetManager;
`;

// 7. การใช้งาน API โดยตรง
export const directApiUsageExample = `
// การเรียกใช้ API โดยตรง (ไม่ผ่าน Hook)

// สร้าง Adjust Bet
const createAdjustBetDirect = async (data) => {
  const response = await fetch('/api/adjust-bet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  return await response.json();
};

// ดึงรายการ
const getAdjustBetsDirect = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(\`/api/adjust-bet?\${queryString}\`);
  
  return await response.json();
};

// อัพเดท
const updateAdjustBetDirect = async (id, data) => {
  const response = await fetch(\`/api/adjust-bet/\${id}\`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  return await response.json();
};

// ลบ
const deleteAdjustBetDirect = async (id) => {
  const response = await fetch(\`/api/adjust-bet/\${id}\`, {
    method: 'DELETE'
  });
  
  return await response.json();
};

// ตัวอย่างการใช้งาน
const example = async () => {
  // สร้างใหม่
  const newAdjustBet = await createAdjustBetDirect({
    name: 'Test Adjust Bet',
    description: 'Test Description',
    data: {
      customer: 'test001',
      usernameAG: 'testuser',
      agBaseUrl: 'https://ag.ufabet.com',
      pinUsed: '123456',
      sportsbook: {
        enabled: true,
        commission: { main: 0, x12: 0, par: 0, other: 0 },
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
      sexy: { enabled: false, profile: 1 },
      sa: { enabled: false, commissionRAR: 0, profile: 1 },
      slotItp: { enabled: false },
      slotJoker: { enabled: false },
      slotPlaystar: { enabled: false },
      cockfight: { enabled: false, commissionRBG: 0 },
      muayStep: { enabled: false },
      virtualSports: { enabled: false },
      createdBy: 'current-user-id',
      updatedBy: 'current-user-id'
    }
  });

  // ดึงรายการ
  const list = await getAdjustBetsDirect({
    page: 1,
    limit: 10,
    search: 'test'
  });

  // อัพเดท
  if (newAdjustBet.success) {
    await updateAdjustBetDirect(newAdjustBet.data.id, {
      name: 'Updated Test Adjust Bet'
    });
  }

  // ลบ
  if (newAdjustBet.success) {
    await deleteAdjustBetDirect(newAdjustBet.data.id);
  }
};
`;
