import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { AdminDepartmentDB } from '@prisma/client';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';


interface DepartmentsModalDeleteProps {
  data: AdminDepartmentDB;
  onSuccess: () => void;
}

const DepartmentsModalDelete: React.FC<DepartmentsModalDeleteProps> = ({ data, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await axios.delete('/api/admin-departments', { data: { id: data.id } });
      if (res.status === 200) {
        alert('✅ ลบแผนกสำเร็จ');
        onSuccess();
        setIsOpen(false);
      } else {
        alert('เกิดข้อผิดพลาดในการลบ');
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2 py-1 rounded text-base bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ลบ
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>ยืนยันการลบ</Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} disabled={deleting}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>
        <Modal.Body>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <ReactIconComponent icon="FaInfoCircle" setClass="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-800">ข้อมูลปัจจุบัน</span>
            </div>
            <p className="text-sm text-red-700">คุณต้องการลบแผนก "{data.name}" ใช่หรือไม่?</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleDelete} disabled={deleting}
            className="inline-flex items-center px-2 py-1 rounded text-me bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >{deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}</Button>
          <Button onClick={() => setIsOpen(false)} className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">ยกเลิก</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DepartmentsModalDelete;



