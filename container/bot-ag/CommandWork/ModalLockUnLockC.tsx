import { Button, ButtonProps } from "@/components/ui/button"

import React, { useState } from 'react';
import Modal from '@/components/form/Modal';
import ReactIconComponent from '@/components/ReactIconComponent';
import { AgUserAccountDB } from '@prisma/client';
import toast from 'react-hot-toast';
import axios from 'axios';

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
      // เรียก API ปลดล็อค
      const res = await axios.post('/api/agent/unlock-customer', {
        adviser: data.username,
        usernameAG: fullUsername,
        // หากต้องการกำหนดรหัสผ่านใหม่เอง ให้เพิ่ม input และส่งค่าแทนที่นี้
        // ไม่ส่งจะให้เซิร์ฟเวอร์ตั้งค่า default เอง
        // newPassword: 'Aa123456',
      })
      if (!res.data?.success) throw new Error(res.data?.error || 'ปลดล็อคไม่สำเร็จ');
      toast.success('ส่งคำสั่งปลดล็อคแล้ว');

      onSuccess?.();
      setIsOpen(false);
      setCustomerStartNew('');
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการปลดล็อค:', error);
      toast.error((error as any)?.message || 'เกิดข้อผิดพลาด');
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
              <span className="text-lg font-bold text-purple-500 ms-2">{data.username}</span>
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
          <div className="flex overflow-hidden rounded-md border-2 border-blue-200 hover:border-blue-500">
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
              className="inline-flex items-center px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded border border-blue-700 border-solid hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded border border-gray-700 border-solid hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
