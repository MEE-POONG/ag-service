// Test script for adjust bet API
const fetch = require('node-fetch');

const testData = {
  name: 'ufh27oa1 - Adjust Bet',
  description: 'การตั้งค่าปรับเบทสำหรับ ufh27oa1 (ufh27oa10007)',
  data: {
    customer: 'ufh27oa10007',
    usernameAG: 'ufh27oa1ufa66',
    agBaseUrl: 'https://ag.ufabet.com',
    pinUsed: '',
    sportsbook: {
      enabled: true,
      work: false,
      commission: {
        main: 0,
        x12: 0,
        par: 0,
        other: 0
      },
      limits: {
        transLimit: 96,
        beforeRun: 96,
        maxX12: 96,
        matchLimitX12: 96,
        maxPar: 96,
        par: 96,
        maxOther: 96,
        matchLimitOther: 96,
        maxOS: 10,
        matchLimitOS: 10
      },
      'ทำรายการ': true
    },
    sexy: { enabled: false, work: false, profile: 1 },
    sa: { enabled: false, work: false, commissionRAR: 0, profile: 1 },
    slotItp: { enabled: false, work: false },
    slotJoker: { enabled: false, work: false },
    slotPlaystar: { enabled: false, work: false },
    lottoRDC: { enabled: false, work: false, share: 0 },
    lottoRCW: { enabled: false, work: false, share: 0 },
    asiaPowerball: { enabled: false, work: false },
    cockfight: { enabled: false, work: false, profile: 1, commissionRBG: 0 },
    muayStep: { enabled: false, work: false, profile: 1 },
    virtualSports: { enabled: false, work: false, profile: 1 },
    createdBy: 'current-user-id',
    updatedBy: 'current-user-id'
  }
};

async function testAdjustBetAPI() {
  try {
    console.log('Testing Adjust Bet API...');
    console.log('Sending data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/adjust-bet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Test PASSED: Adjust bet created successfully');
    } else {
      console.log('❌ Test FAILED:', result.error);
    }
  } catch (error) {
    console.error('❌ Test ERROR:', error.message);
  }
}

testAdjustBetAPI();
