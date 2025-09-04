import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import ReactIconComponent from '@/components/ReactIconComponent';
import { AdminPositionDB } from '@prisma/client';
import { ExtendedAdminDepartment } from '@/data/interface';
import Modal from '@/components/form/Modal';

interface PositionModalDeleteProps {
  onSuccess: () => void;
  list: ExtendedAdminDepartment; // มี id และ name ของแผนก
  position: AdminPositionDB;
}


const PositionModalDelete: React.FC<PositionModalDeleteProps> = ({ position, list, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');

      const res = await axios.delete('/api/admin-positions', {
        data: { id: position.id }
      });

      if (res.data?.success) {
        onSuccess();
        setIsOpen(false);
        // ใช้ toast หรือ notification แทน alert ถ้ามี
        alert('✅ ลบตำแหน่งสำเร็จ');
      } else {
        throw new Error(res.data?.error || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'เกิดข้อผิดพลาดในการลบตำแหน่ง';
      setError(errorMessage);
      console.error('Delete position error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
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
      <Button
        size="xs"
        onClick={handleOpen}
        className="inline-flex items-center px-2 py-1 rounded text-base bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="ลบตำแหน่ง"
        disabled={isDeleting}
      >
        <ReactIconComponent icon="FaTrash" setClass="w-3 h-3" />
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>ยืนยันการลบตำแหน่ง</Modal.Title>
          </div>
          <Modal.Close onClick={handleClose} disabled={isDeleting} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-3">
              คุณต้องการลบตำแหน่งต่อไปนี้หรือไม่?
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <ReactIconComponent icon="FaExclamationTriangle" setClass="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-800">ข้อมูลที่จะลบ</span>
              </div>
              <div className="text-sm text-red-700">
                <div><strong>ตำแหน่ง:</strong> {position.name}</div>
                {list && (
                  <div><strong>แผนก:</strong> {list.name}</div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ReactIconComponent icon="FaInfoCircle" setClass="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">คำเตือน:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>การลบจะไม่สามารถย้อนกลับได้</li>
                    <li>หากมีผู้ดูแลระบบใช้ตำแหน่งนี้อยู่ จะไม่สามารถลบได้</li>
                    <li>ลำดับของตำแหน่งอื่นจะถูกปรับใหม่อัตโนมัติ</li>
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
            onClick={handleDelete}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting && <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin" />}
            {isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
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

export default PositionModalDelete;




