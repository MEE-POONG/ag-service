import { Button } from '@/components/ui/button';
import Modal from '@/components/form/Modal';
import { ExtendedWebBaseDB } from '@/data/interface';
import { WebBaseDB } from '@prisma/client';
import axios from '@/lib/axios';
import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface WebBaseModalEditProps {
  data: ExtendedWebBaseDB;
  onSuccess: () => void;
}

const WebBaseModalEdit: React.FC<WebBaseModalEditProps> = ({
  onSuccess,
  data,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    passS: false,
    passM: false,
    passA: false
  });
  // Toggle การแสดงรหัสผ่าน
  const togglePasswordVisibility = (field: 'passS' | 'passM' | 'passA') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  const [formData, setFormData] = useState<ExtendedWebBaseDB>({
    id: data.id,
    createdAt: new Date(),
    createdBy: data.createdBy,
    updatedAt: new Date(),
    updatedBy: data.updatedBy,
    name: data.name,
    passS: data.passS,
    passM: data.passM,
    passA: data.passA,
    otpS: data.otpS,
    otpM: data.otpM,
    otpA: data.otpA,
    isActive: data.isActive,
    isDeleted: data.isDeleted,
    // Note: deleteBy field removed - not in WebBaseDB schema
  });
  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        alert('กรุณากรอกชื่อ WebBase');
        return;
      }

      const url = `/api/web-base`;
      const method = 'PUT';
      const body = formData;

      const response = await axios({
        method,
        url,
        data: body,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      if (result.success) {
        alert('แก้ข้อมูลสำเร็จ');
        onSuccess();
        setIsOpen(false);
      } else {
        alert(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed" size="sm">
        แก้ไข
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>แก้ไข Web Base</Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} />
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                ชื่อ Web Base *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="กรอกชื่อ Web Base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* คอลัมน์ซ้าย: Passwords */}
              <div className="space-y-4">
                {["passS", "passM", "passA"].map((field) => (
                  <div key={field}>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Password {field === "passS" ? "Super Admin" : field === "passM" ? "Master Admin" : "Admin"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords[field as 'passS' | 'passM' | 'passA'] ? "text" : "password"}
                        value={formData[field as keyof typeof formData] as string}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field as 'passS' | 'passM' | 'passA')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[field as 'passS' | 'passM' | 'passA'] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* คอลัมน์ขวา: OTPs */}
              <div className="space-y-4">
                {["otpS", "otpM", "otpA"].map((field) => (
                  <div key={field}>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      OTP {field === "otpS" ? "Super Admin" : field === "otpM" ? "Master Admin" : "Admin"}
                    </label>
                    <input
                      type="text"
                      value={formData[field as keyof typeof formData] as string}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>


            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-xs sm:text-sm text-gray-700">
                เปิดใช้งาน
              </label>
            </div>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={handleSave}
            className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            บันทึก
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

export default WebBaseModalEdit;

