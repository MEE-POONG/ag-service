import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { MenuWebDB } from '@prisma/client';
import axios from '@/lib/axios';
import React, { useState, useEffect } from 'react';
import Modal from '@/components/form/Modal';
import ReactIconComponent from '@/components/ReactIconComponent';

interface MenuWebModalDeleteProps {
  data: MenuWebDB;
  onSuccess: () => void;
}

const MenuWebModalDelete: React.FC<MenuWebModalDeleteProps> = ({ data, onSuccess, }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<MenuWebDB>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(data);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    try {

      const response = await axios.delete('/api/menu-web', {
        data: {
          id: data.id,          // ✅ ส่งผ่าน req.body ตาม API
          deleteBy: user?.id,    // หรือใช้ user จาก context
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

      <Modal open={isOpen} onOpenChange={setIsOpen} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              ลบเมนู <span className="text-blue-500">{formData.name}</span>
            </Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4 text-sm text-gray-700">
            ยืนยันการลบเมนู <span className="text-red-500">{formData.name}</span>
            {formData.head && <div className="text-red-500">
              ลบรายการนี้จะทำให้รายการที่อยู่ใต้รายการนี้ถูกลบด้วย
            </div>}
          </div>
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

export default MenuWebModalDelete;

