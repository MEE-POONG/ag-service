/**
 * Test script for Partners API endpoints
 * Run this with: node test-partners-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testPartner = {
  agentId: '507f1f77bcf86cd799439011', // Sample ObjectId
  bankName: 'กสิกรไทย',
  bankNumber: '1234567890',
  name: 'ทดสอบ สมาชิก',
  tel: '0812345678',
  line: 'test_line',
  status: 'active',
  method: 'normal',
  startDate: new Date().toISOString(),
  createdBy: 'test_user'
};

let createdPartnerId = null;

async function testAPI() {
  console.log('🚀 เริ่มทดสอบ Partners API...\n');

  try {
    // Test 1: GET /api/partners (List all partners)
    console.log('1️⃣ ทดสอบ GET /api/partners (List all partners)');
    const listResponse = await axios.get(`${BASE_URL}/partners`);
    console.log('✅ Status:', listResponse.status);
    console.log('📊 Data count:', listResponse.data.data?.length || 0);
    console.log('');

    // Test 2: POST /api/partners (Create new partner)
    console.log('2️⃣ ทดสอบ POST /api/partners (Create new partner)');
    const createResponse = await axios.post(`${BASE_URL}/partners`, testPartner);
    console.log('✅ Status:', createResponse.status);
    console.log('🆔 Created ID:', createResponse.data.data?.id);
    createdPartnerId = createResponse.data.data?.id;
    console.log('');

    if (createdPartnerId) {
      // Test 3: GET /api/partners/[id] (Get partner by ID)
      console.log('3️⃣ ทดสอบ GET /api/partners/[id] (Get partner by ID)');
      const getResponse = await axios.get(`${BASE_URL}/partners/${createdPartnerId}`);
      console.log('✅ Status:', getResponse.status);
      console.log('👤 Partner name:', getResponse.data.data?.name);
      console.log('');

      // Test 4: PUT /api/partners/[id] (Update partner)
      console.log('4️⃣ ทดสอบ PUT /api/partners/[id] (Update partner)');
      const updateData = {
        id: createdPartnerId,
        name: 'ทดสอบ สมาชิก (แก้ไขแล้ว)',
        tel: '0823456789',
        updatedBy: 'test_user_updated'
      };
      const updateResponse = await axios.put(`${BASE_URL}/partners/${createdPartnerId}`, updateData);
      console.log('✅ Status:', updateResponse.status);
      console.log('👤 Updated name:', updateResponse.data.data?.name);
      console.log('');

      // Test 5: PUT /api/partners (Update partner via body)
      console.log('5️⃣ ทดสอบ PUT /api/partners (Update partner via body)');
      const updateBodyData = {
        id: createdPartnerId,
        name: 'ทดสอบ สมาชิก (แก้ไขผ่าน body)',
        tel: '0834567890',
        updatedBy: 'test_user_body'
      };
      const updateBodyResponse = await axios.put(`${BASE_URL}/partners`, updateBodyData);
      console.log('✅ Status:', updateBodyResponse.status);
      console.log('👤 Updated name:', updateBodyResponse.data.data?.name);
      console.log('');

      // Test 6: DELETE /api/partners/[id] (Delete partner)
      console.log('6️⃣ ทดสอบ DELETE /api/partners/[id] (Delete partner)');
      const deleteResponse = await axios.delete(`${BASE_URL}/partners/${createdPartnerId}`);
      console.log('✅ Status:', deleteResponse.status);
      console.log('🗑️ Message:', deleteResponse.data.message);
      console.log('');

      // Test 7: DELETE /api/partners (Delete partner via body)
      console.log('7️⃣ ทดสอบ DELETE /api/partners (Delete partner via body)');
      // First create another partner for this test
      const createAnotherResponse = await axios.post(`${BASE_URL}/partners`, {
        ...testPartner,
        name: 'ทดสอบ สมาชิก สำหรับลบ'
      });
      const anotherPartnerId = createAnotherResponse.data.data?.id;
      
      const deleteBodyResponse = await axios.delete(`${BASE_URL}/partners`, {
        data: { id: anotherPartnerId }
      });
      console.log('✅ Status:', deleteBodyResponse.status);
      console.log('🗑️ Message:', deleteBodyResponse.message);
      console.log('');
    }

    // Test 8: Error handling
    console.log('8️⃣ ทดสอบ Error handling');
    try {
      await axios.get(`${BASE_URL}/partners/invalid-id`);
    } catch (error) {
      console.log('✅ Expected error for invalid ID:', error.response?.status);
    }

    try {
      await axios.post(`${BASE_URL}/partners`, {});
    } catch (error) {
      console.log('✅ Expected error for missing required fields:', error.response?.status);
    }

    console.log('\n🎉 ทดสอบ API เสร็จสิ้น!');

  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
  }
}

// Run the test
testAPI();
