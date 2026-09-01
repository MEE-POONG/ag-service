import { Button, ButtonProps } from "@/components/ui/button"

import React, { useState } from 'react';
import Modal from '@/components/form/Modal';
import ReactIconComponent from '@/components/ReactIconComponent';
import { AgUserDB } from '@prisma/client';

interface CommandWorkModalCreateCProps {
  onSuccess?: () => void;
  data: AgUserDB;
}

const CommandWorkModalCreateC: React.FC<CommandWorkModalCreateCProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerStartNew, setCustomerStartNew] = useState(``);
  const [createNum, setCreateNum] = useState(0);
  const handleSave = async () => {
    try {
      setLoading(true);
     // console.log('เอเย่น : ', data.username, 'ยูส : ', data.username + customerStartNew, 'จำนวน : ', createNum);
      // TODO: call API ที่ใช้บันทึกเครดิตจริง
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการบันทึก:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className='px-3 block p-1 rounded-md ring-1 transition-colors shadow-sm border ring-gray-200 bg-white/90 border-red-200 hover:bg-gradient-to-r from-[#34D39950] to-[rgba(255,120,120,0.76)] hover:shadow-md cursor-pointer'      >
        สร้างยูสลูกค้าใหม่
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              สร้างยูสลูกค้าใหม่ของ
              <span className="ms-2 text-lg font-bold text-purple-500">{data.username}</span>
            </Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} size="sm">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ยูสลูกค้าใหม่</label>
          <div className="flex rounded-md border-2 border-blue-200 hover:border-blue-500 overflow-hidden">
            {/* ซ้ายสุด */}
            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 dark:bg-gray-600 dark:text-gray-400">
              {data.username}
            </span>

            {/* ช่องกรอกกลาง */}
            <input
              type="text"
              className="flex-1 min-w-0 bg-gray-50 border-x border-gray-300 text-gray-900 text-sm p-2.5 
               dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
               focus:outline-none focus:ring-0"
              placeholder="ระบุลำดับยูสลูกค้าที่จะสร้าง"
              value={customerStartNew}
              onChange={(e) => setCustomerStartNew(e.target.value)}
            />

            {/* label จำนวน */}
            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 dark:bg-gray-600 dark:text-gray-400">
              จำนวน
            </span>

            {/* ช่องกรอกกลาง */}
            <input
              type="number"
              min={1}
              max={100}
              className="w-[10ch] text-end bg-gray-50 border-x border-gray-300 text-gray-900 text-sm p-2.5 
             dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
             focus:outline-none focus:ring-0"
              placeholder="จำนวน"
              value={createNum}
              onChange={(e) => setCreateNum(Number(e.target.value))}
            />

            {/* ขวาสุด */}
            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 dark:bg-gray-600 dark:text-gray-400">
              ยูส
            </span>
          </div>

        </Modal.Body>

        <Modal.Footer>
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 rounded text-sm bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaSave" setClass="w-4 h-4 mr-2" />
                  บันทึก
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
      </Modal >
    </>
  );
};

export default CommandWorkModalCreateC;
