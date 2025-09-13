import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import Modal from '@/components/form/Modal';
import ReactIconComponent from '@/components/ReactIconComponent';
import { AgUserAccountDB } from '@prisma/client';

interface CommandWorkModalLockUnLockCProps {
  onSuccess?: () => void;
  data: AgUserAccountDB;
}

const CommandWorkModalLockUnLockC: React.FC<CommandWorkModalLockUnLockCProps> = ({ data, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerStartNew, setCustomerStartNew] = useState('');

  const handleUnlock = async () => {
    if (!customerStartNew.trim()) return;

    try {
      setLoading(true);
      const fullUsername = `${data.username}${customerStartNew}`;
      console.log('ปลดล็อคยูสลูกค้า → เอเย่น:', data.username, 'ยูสเต็ม:', fullUsername);

      // TODO: เรียก API ปลดล็อคจริง
      // await axios.post('/api/agent/unlock-customer', {
      //   agentUsername: data.username,
      //   customerUsername: fullUsername,
      // });

      onSuccess?.();
      setIsOpen(false);
      setCustomerStartNew('');
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการปลดล็อค:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className='px-3 block p-1 rounded-md ring-1 transition-colors shadow-sm border ring-gray-200 bg-white/90 border-red-200 hover:bg-gradient-to-r from-[#ff7878c2] to-[#69eeffc2] hover:shadow-md cursor-pointer'      >
        ปลดล็อคลูกค้า
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              ปลดล็อคลูกค้าใน
              <span className="ms-2 text-lg font-bold text-purple-500">{data.username}</span>
            </Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} size="sm">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            ยูสลูกค้าที่ต้องการปลดล็อค
          </label>

          {/* Input Group (ไม่มีช่องจำนวนแล้ว) */}
          <div className="flex rounded-md border-2 border-blue-200 hover:border-blue-500 overflow-hidden">
            {/* ซ้ายสุด: prefix เอเย่น */}
            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 dark:bg-gray-600 dark:text-gray-400">
              {data.username}
            </span>

            {/* ช่องกรอกยูสลูกค้า (suffix ต่อท้ายเอเย่น) */}
            <input
              type="text"
              className="flex-1 min-w-0 bg-gray-50 border-x border-gray-300 text-gray-900 text-sm p-2.5 
                         dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                         focus:outline-none focus:ring-0"
              placeholder="ระบุยูสลูกค้า (ต่อท้าย prefix ข้างซ้าย)"
              value={customerStartNew}
              onChange={(e) => setCustomerStartNew(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUnlock();
              }}
            />

            {/* ขวาสุด: label */}
            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 dark:bg-gray-600 dark:text-gray-400">
              ยูส
            </span>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex space-x-2">
            <Button
              onClick={handleUnlock}
              disabled={loading || !customerStartNew.trim()}
              className="inline-flex items-center px-4 py-2 rounded text-sm bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 mr-2 animate-spin" />
                  กำลังปลดล็อค...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaUnlock" setClass="w-4 h-4 mr-2" />
                  ปลดล็อค
                </>
              )}
            </Button>

            <Button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded text-sm bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ReactIconComponent icon="FaTimes" setClass="w-4 h-4 mr-2" />
              ปิด
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CommandWorkModalLockUnLockC;