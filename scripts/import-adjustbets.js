const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importAdjustBets() {
  try {
    // อ่านไฟล์ JSON
    const jsonPath = path.join(__dirname, '..', 'ME004DB.adjustbets.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const adjustBetsData = JSON.parse(jsonData);

   // console.log(`Found ${adjustBetsData.length} adjust bets to import`);

    // Import แต่ละ record
    for (const data of adjustBetsData) {
      try {
        const adjustBet = await prisma.adjustbets.create({
          data: {
            customer: data.customer,
            usernameAG: data.usernameAG,
            agBaseUrl: data.agBaseUrl,
            pinUsed: data.pinUsed,
            sportsbook: data.sportsbook,
            sexy: data.sexy,
            sa: data.sa,
            slotItp: data.slotItp,
            slotJoker: data.slotJoker,
            slotPlaystar: data.slotPlaystar,
            cockfight: data.cockfight,
            muayStep: data.muayStep,
            virtualSports: data.virtualSports,
            overallStatus: data.overallStatus,
            attemptCount: data.attemptCount,
            createdBy: data.createdBy,
            updatedBy: data.updatedBy,
            lastError: data.lastError,
            createdAt: new Date(data.createdAt.$date),
            updatedAt: new Date(data.updatedAt.$date)
          }
        });
       // console.log(`✅ Imported: ${adjustBet.customer} - ${adjustBet.usernameAG}`);
      } catch (error) {
        console.error(`❌ Failed to import ${data.customer}:`, error.message);
      }
    }

   // console.log('🎉 Import completed!');
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importAdjustBets();
