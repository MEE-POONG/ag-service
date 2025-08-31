import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Modal from '@/components/form/Modal';
import { ExtendedWebBaseDB } from '@/data/interface';

interface WebBaseModalDeleteProps {
  data: ExtendedWebBaseDB;
  onSuccess: () => void;
}

const WebBaseModalDelete: React.FC<WebBaseModalDeleteProps> = ({
  data,
  onSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await axios.delete('/api/web-base', {
        data: {
          id: data.id,          // ✅ ส่งผ่าน req.body ตาม API
          deleteBy: 'admin',    // หรือใช้ user จาก context
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      if (result.success) {
        alert('ลบข้อมูลสำเร็จ');
        onSuccess();
        setIsOpen(false);
      } else {
        alert(result.error || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2 py-1 rounded text-base bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
        size="sm"
      >
        ลบ
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="sm" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>ยืนยันการลบ</Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} />
        </Modal.Header>
        <Modal.Body>
          <p className="text-sm mb-2 text-gray-700">
            คุณต้องการลบ WebBase <strong>{data.name}</strong> หรือไม่?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={handleDelete}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ลบ
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

export default WebBaseModalDelete;


