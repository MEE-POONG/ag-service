// PositionModalAdd.tsx
import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { ExtendedAdminDepartment } from '@/data/interface';
import { Button, ButtonProps } from "@/components/ui/button"

import Modal from '@/components/form/Modal';
import ReactIconComponent from '@/components/ReactIconComponent';
import { useAuth } from '@/hooks/useAuth';

interface PositionModalAddProps {
  onSuccess: () => void;
  list: ExtendedAdminDepartment; // มี id และ name ของแผนก
}

const PositionModalAdd: React.FC<PositionModalAddProps> = ({ list, onSuccess }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [positions, setPositions] = useState<{ id: string; name: string; priority: number }[]>([]);
  const [name, setName] = useState('');
  const [priorityPositionId, setPriorityPositionId] = useState('');

  // โหลดตำแหน่งในแผนกนี้
  const fetchPositions = async (departmentId: string) => {
    try {
      const res = await axios.get('/api/admin-positions', { params: { adminDepartmentId: departmentId } });
      setPositions(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('กรุณากรอกชื่อตำแหน่ง');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        adminDepartmentId: list.id,
        createdBy: user?.id,
      };
      
      // แปลง priorityPositionId เป็น priority number
      if (priorityPositionId) {
        const targetPosition = positions.find(pos => pos.id === priorityPositionId);
        if (targetPosition) {
          payload.priority = targetPosition.priority;
        }
      }

      const res = await axios.post('/api/admin-positions', payload);
      if (res.data?.success) {
        alert('✅ เพิ่มตำแหน่งสำเร็จ');
        onSuccess();
        setIsOpen(false);
        setName('');
        setPriorityPositionId('');
      } else {
        throw new Error(res.data?.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'เกิดข้อผิดพลาดในการบันทึก';
      alert(errorMessage);
      console.error('Create position error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    setIsOpen(false);
    setName('');
    setPriorityPositionId('');
  };

  useEffect(() => {
    if (isOpen) {
      if (Array.isArray(list.adminPositions) && list.adminPositions.length > 0) {
        setPositions([...list.adminPositions].sort((a, b) => Number(a.priority) - Number(b.priority)).map(pos => ({
          id: pos.id,
          name: pos.name,
          priority: Number(pos.priority)
        })));
      } else {
        fetchPositions(list.id);
      }
    }
  }, [isOpen, list.id, list.adminPositions]);

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2 py-1 rounded text-base bg-purple-100 text-purple-700 border border-solid border-purple-700 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSaving}
      >
        <ReactIconComponent icon="FaPlus" setClass="w-3 h-3" /> เพิ่มตำแหน่งใหม่
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>เพิ่มตำแหน่งใหม่ ในแผนก <span className="text-blue-500 text-bold">"{list.name}"</span></Modal.Title>
          </div>
          <Modal.Close onClick={handleClose} disabled={isSaving} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อตำแหน่ง <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="เช่น หัวหน้ากะกลางคืน / เจ้าหน้าที่ดูแลระบบ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ลำดับความสำคัญ</label>
            {positions.length > 0 ? (
              <>
                <select
                  value={priorityPositionId}
                  onChange={(e) => setPriorityPositionId(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- แทรกที่ท้ายสุด --</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      แทรกก่อน: {pos.name} (ลำดับ: {pos.priority})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  เลือกตำแหน่งที่ต้องการแทรกก่อน หรือปล่อยว่างเพื่อเพิ่มที่ท้ายสุด
                </p>
              </>
            ) : (
              <div className="text-sm text-gray-500 py-2">ไม่มีตำแหน่งอื่นในแผนกนี้</div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleSave} className="inline-flex items-center px-2 py-1 rounded text-base bg-purple-100 text-purple-700 border border-solid border-purple-700 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
          <Button onClick={handleClose} className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PositionModalAdd;
