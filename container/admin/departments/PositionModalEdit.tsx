import React, { useState } from 'react';
import axios from '@/lib/axios';
import { Button, ButtonProps } from "@/components/ui/button"

import ReactIconComponent from '@/components/ReactIconComponent';
import { AdminPositionDB } from '@prisma/client';
import { ExtendedAdminDepartment } from '@/data/interface';
import Modal from '@/components/form/Modal';
import { useAuth } from '@/hooks/useAuth';

interface PositionModalEditProps {
  onSuccess: () => void;
  list: ExtendedAdminDepartment; // มี id และ name ของแผนก
  position: AdminPositionDB;
}

type SimpleDepartment = { id: string; name: string };

const PositionModalEdit: React.FC<PositionModalEditProps> = ({ list, position, onSuccess }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Form states
  const [name, setName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [priorityPositionId, setPriorityPositionId] = useState('');

  // Data states
  const [departments, setDepartments] = useState<SimpleDepartment[]>([]);
  const [positions, setPositions] = useState<{ id: string; name: string; priority: number }[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  // Load departments data
  const loadDepartments = async () => {
    try {
      const res = await axios.get('/api/admin-departments');
      const depts: SimpleDepartment[] = (res.data?.data || []).map((d: any) => ({ id: d.id, name: d.name }));
      setDepartments(depts);
    } catch (e) {
      console.error('fetch departments failed', e);
    }
  };

  // Load positions for selected department
  const fetchPositions = async (departmentId: string) => {
    if (!departmentId) return;
    try {
      setIsLoadingPositions(true);
      const response = await axios.get(`/api/admin-positions?adminDepartmentId=${departmentId}`);
      const allPositions = response.data.data || [];
      // Filter out current position from the list
      const filteredPositions = allPositions.filter((pos: any) => pos.id !== position.id);
      setPositions(filteredPositions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setPositions([]);
    } finally {
      setIsLoadingPositions(false);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    if (!name.trim()) {
      setError('กรุณากรอกชื่อตำแหน่ง');
      return;
    }

    if (!selectedDeptId) {
      setError('กรุณาเลือกแผนก');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload: any = {
        id: position.id,
        name: name.trim(),
        adminDepartmentId: selectedDeptId,
        updatedBy: user?.id,
      };

      // แปลง priorityPositionId เป็น priority number
      if (priorityPositionId) {
        const targetPosition = positions.find(pos => pos.id === priorityPositionId);
        if (targetPosition) {
          payload.priority = targetPosition.priority;
        }
      }

      const res = await axios.put('/api/admin-positions', payload);

      if (res.data?.success) {
        onSuccess();
        setIsOpen(false);
        alert('✅ แก้ไขตำแหน่งสำเร็จ');
      } else {
        throw new Error(res.data?.error || 'เกิดข้อผิดพลาดในการแก้ไข');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'เกิดข้อผิดพลาดในการแก้ไขตำแหน่ง';
      setError(errorMessage);
      console.error('Update position error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setIsOpen(false);
      setError('');
      // Reset form
      setName('');
      setSelectedDeptId('');
      setPriorityPositionId('');
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    setError('');

    // Initialize form with current values
    setName(position.name || '');
    setSelectedDeptId(position.adminDepartmentId || '');
    setPriorityPositionId('');

    // Load departments if not loaded
    if (!departments.length) {
      await loadDepartments();
    }

    // Load positions for current department
    if (position.adminDepartmentId) {
      await fetchPositions(position.adminDepartmentId);
    }
  };

  // Handle department change
  const handleDepartmentChange = async (newDeptId: string) => {
    setSelectedDeptId(newDeptId);
    setPriorityPositionId(''); // Reset priority selection

    if (newDeptId) {
      await fetchPositions(newDeptId);
    } else {
      setPositions([]);
    }
  };

  return (
    <>
      <Button
        size="xs"
        onClick={handleOpen}
        className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 border border-solid border-blue-700 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed "
        title="แก้ไขตำแหน่ง"
        disabled={isSaving}
      >
        <ReactIconComponent icon="FaEdit" setClass="w-3 h-3" />
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>แก้ไขตำแหน่ง</Modal.Title>
          </div>
          <Modal.Close onClick={handleClose} disabled={isSaving} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>          </Modal.Header>

        <Modal.Body>
          <div className="space-y-4">
            {/* Current Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <ReactIconComponent icon="FaInfoCircle" setClass="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-800">ข้อมูลปัจจุบัน</span>
              </div>
              <div className="text-sm text-blue-700">
                <div><strong>ตำแหน่ง:</strong> {position.name}</div>
                {list && (
                  <div><strong>แผนก:</strong> {list.name}</div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกแผนก <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- เลือกแผนก --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อตำแหน่ง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="เช่น หัวหน้ากะกลางคืน / เจ้าหน้าที่ดูแลระบบ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ลำดับความสำคัญ
              </label>
              {isLoadingPositions ? (
                <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin" />
                  กำลังโหลดตำแหน่ง...
                </div>
              ) : positions.length > 0 ? (
                <>
                  <select
                    value={priorityPositionId}
                    onChange={(e) => setPriorityPositionId(e.target.value)}
                    disabled={isSaving}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- ไม่เปลี่ยนลำดับ --</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        แทรกก่อน: {pos.name} (ลำดับ: {pos.priority})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    เลือกตำแหน่งที่ต้องการแทรกก่อน หรือปล่อยว่างเพื่อไม่เปลี่ยนลำดับ
                  </p>
                </>
              ) : (
                <div className="text-sm text-gray-500 py-2">
                  {selectedDeptId ? 'ไม่มีตำแหน่งอื่นในแผนกนี้' : 'กรุณาเลือกแผนกก่อน'}
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ReactIconComponent icon="FaExclamationTriangle" setClass="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">คำเตือน:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>การแก้ไขจะมีผลทันที</li>
                    <li>หากย้ายแผนก ลำดับจะถูกปรับใหม่อัตโนมัติ</li>
                    <li>หากมีผู้ดูแลระบบใช้ตำแหน่งนี้ การเปลี่ยนแปลงจะส่งผลกับบัญชีนั้น</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <ReactIconComponent icon="FaExclamationCircle" setClass="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">เกิดข้อผิดพลาด:</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={handleSave}
            className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isSaving && <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin" />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
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

export default PositionModalEdit;



