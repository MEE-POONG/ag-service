import React, { useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import { AdminPositionDB } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ExtendedAdminDepartment } from '@/data/interface';
import Modal from '@/components/form/Modal';

interface PositionModalActiveProps {
  onSuccess: () => void;
  list: ExtendedAdminDepartment; // มี id และ name ของแผนก
  position: AdminPositionDB;
}

const PositionModalActive: React.FC<PositionModalActiveProps> = ({ list, position, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string>('');

  const nextActiveState = !list.isActive;

  const handleToggle = async () => {
    setIsToggling(true);
    setError('');

    try {
      const res = await axios.patch(`/api/admin-positions/${list.id}`, {
        isActive: nextActiveState
      });

      if (res.data?.success || res.status === 200) {
        onSuccess();
        setIsOpen(false);
        alert(`✅ ${nextActiveState ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}ตำแหน่งสำเร็จ`);
      } else {
        throw new Error(res.data?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะตำแหน่ง';
      setError(errorMessage);
      console.error('Toggle position active error:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleClose = () => {
    if (!isToggling) {
      setIsOpen(false);
      setError('');
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setError('');
  };

  return (
    <>
      {/* Toggle Switch */}
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={list.isActive}
          onChange={handleOpen}
          disabled={isToggling}
          className="form-checkbox h-3 w-3 sm:h-4 sm:w-4 text-primary-600 transition duration-150 ease-in-out rounded border-gray-300 focus:ring-primary-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className={`ml-1 sm:ml-2 text-xs font-medium ${list.isActive ? 'text-green-600' : 'text-gray-500'}`}>
          {list.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        </span>
      </label>

      {/* Confirmation Modal */}
      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>ยืนยันการ{nextActiveState ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</Modal.Title>
          </div>
          <Modal.Close onClick={handleClose} disabled={isToggling} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-3">
              คุณต้องการ{nextActiveState ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} ตำแหน่งต่อไปนี้หรือไม่?
            </p>

            <div className={`${nextActiveState ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-3 mb-3`}>
              <div className="flex items-center gap-2 mb-2">
                <ReactIconComponent
                  icon={nextActiveState ? "FaCheckCircle" : "FaPauseCircle"}
                  setClass={`w-4 h-4 ${nextActiveState ? 'text-green-500' : 'text-yellow-500'}`}
                />
                <span className={`text-sm font-medium ${nextActiveState ? 'text-green-800' : 'text-yellow-800'}`}>
                  {nextActiveState ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}ตำแหน่ง
                </span>
              </div>
              <div className={`text-sm ${nextActiveState ? 'text-green-700' : 'text-yellow-700'}`}>
                <div><strong>ตำแหน่ง:</strong> {position.name}</div>
                {list && (
                  <div><strong>แผนก:</strong> {list.name}</div>
                )}
                <div><strong>สถานะปัจจุบัน:</strong> {list.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</div>
                <div><strong>สถานะใหม่:</strong> {nextActiveState ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ReactIconComponent icon="FaInfoCircle" setClass="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">ข้อมูลเพิ่มเติม:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {nextActiveState ? (
                      <>
                        <li>ตำแหน่งจะสามารถใช้งานได้ทันที</li>
                        <li>ผู้ดูแลระบบสามารถเลือกตำแหน่งนี้ได้</li>
                        <li>ตำแหน่งจะปรากฏในรายการแบบเปิดใช้งาน</li>
                      </>
                    ) : (
                      <>
                        <li>ตำแหน่งจะถูกปิดใช้งานทันที</li>
                        <li>ผู้ดูแลระบบที่ใช้ตำแหน่งนี้จะไม่ได้รับผลกระทบ</li>
                        <li>ตำแหน่งจะยังคงอยู่ในระบบ แต่ไม่สามารถเลือกใช้งานใหม่ได้</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ReactIconComponent icon="FaExclamationCircle" setClass="w-4 h-4 text-red-500 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">เกิดข้อผิดพลาด:</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={handleToggle}
            className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {isToggling && <span className="animate-spin">⟳</span>}
            {isToggling ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PositionModalActive;



