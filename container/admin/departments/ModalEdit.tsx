import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { AdminDepartmentDB } from '@prisma/client';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface DepartmentsModalEditProps {
  data: AdminDepartmentDB;
  onSuccess: () => void;
}

const DepartmentsModalEdit: React.FC<DepartmentsModalEditProps> = ({ data, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AdminDepartmentDB>({ ...data });

  const handleClose = () => {
    setIsOpen(false);
    setFormData({ ...data });
  };


  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        alert('กรุณากรอกชื่อแผนก');
        return;
      }
      setSaving(true);
      const res = await axios.put('/api/admin-departments', {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
      });
      if (res.status === 200) {
        alert('✅ อัปเดตแผนกสำเร็จ');
        onSuccess();
        setIsOpen(false);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
        แก้ไข
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>แก้ไขแผนก</Modal.Title>
          </div>
          <Modal.Close onClick={handleClose} disabled={saving} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">ชื่อแผนก *</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">คำอธิบาย</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border rounded-lg"
              rows={3}
            />
          </div>
          <div className="flex items-center">
            <input
              id={`deptIsActiveEdit-${formData.id}`}
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor={`deptIsActiveEdit-${formData.id}`} className="ml-2 text-xs sm:text-sm font-bold text-gray-700">เปิดใช้งาน</label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
          <Button onClick={handleClose} className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">ยกเลิก</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DepartmentsModalEdit;




