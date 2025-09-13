import { Button } from '@/components/ui/button';
import axios from '@/lib/axios';
import React, { useState, useEffect } from 'react';
import Modal from '@/components/form/Modal';
import ReactIconComponent from '@/components/ReactIconComponent';
import { AgUserAccountDB } from '@prisma/client';
import { qk } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

interface CommandWorkModalCreateCProps {
  onSuccess?: () => void;
  data: AgUserAccountDB;
}

const CommandWorkModalCreateC: React.FC<CommandWorkModalCreateCProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerStartNew, setCustomerStartNew] = useState(``);

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('customerStartNew:', customerStartNew);
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
          <div className="flex rounded-md border-2 border-blue-200 hover:border-blue-500 ">
            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 rounded-e-0 border-none rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
              {data.username}
            </span>
            <input type="text" id="website-admin" className="rounded-none rounded-e-lg bg-gray-50 border text-gray-900 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-0" placeholder="elonmusk" />
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
