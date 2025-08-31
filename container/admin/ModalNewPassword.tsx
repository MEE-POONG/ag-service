import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { AdminDB } from '@prisma/client';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface AdminModalRepasswordProps {
  data: AdminDB;
  onSuccess: () => void;
}

const AdminModalRepassword: React.FC<AdminModalRepasswordProps> = ({ data, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      alert('กรุณากรอกรหัสใหม่และยืนยันรหัสใหม่ให้ครบถ้วน');
      return;
    }
    if (newPassword.length < 8) {
      alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('รหัสใหม่และยืนยันรหัสใหม่ไม่ตรงกัน');
      return;
    }

    try {
      setSubmitting(true);
      // ปรับ endpoint ตามหลังบ้านของคุณได้เลย (เช่น PUT /api/admin/password)
      const res = await axios.post('/api/admin/repassword', {
        id: data.id,
        newPassword,
      });

      if (res.data.success) {
        alert(res.data.message || '✅ ตั้งรหัสใหม่สำเร็จ');
        onSuccess();
        setIsOpen(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(res.data.error || 'เกิดข้อผิดพลาดในการตั้งรหัสใหม่');
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || 'เกิดข้อผิดพลาดในการตั้งรหัสใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2 py-1 rounded text-base bg-yellow-100 text-yellow-700 border border-solid border-yellow-700 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        รีเซ็ตรหัส
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>ตั้งรหัสใหม่</Modal.Title>
            <div className="text-xs text-gray-500 mt-1">
              ผู้ใช้: <span className="font-medium">{data.username}</span>
            </div>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} disabled={submitting}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <ReactIconComponent icon="FaInfoCircle" setClass="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-800">คำแนะนำ</span>
            </div>
            <p className="text-sm text-yellow-700">
              กรุณาตั้งรหัสผ่านอย่างน้อย 8 ตัวอักษร และรักษาความปลอดภัยของรหัสผ่าน
            </p>
          </div>

          <div className="space-y-3">
            {/* รหัสใหม่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสใหม่</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="กรอกรหัสใหม่"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-2 inline-flex items-center"
                  tabIndex={-1}
                >
                  <ReactIconComponent
                    icon={showPwd ? 'FaEyeSlash' : 'FaEye'}
                    setClass="w-4 h-4 text-gray-500"
                  />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">อย่างน้อย 8 ตัวอักษร</p>
            </div>

            {/* ยืนยันรหัสใหม่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสใหม่</label>
              <div className="relative">
                <input
                  type={showPwd2 ? 'text' : 'password'}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="กรอกยืนยันรหัสใหม่"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleReset();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd2((v) => !v)}
                  className="absolute inset-y-0 right-2 inline-flex items-center"
                  tabIndex={-1}
                >
                  <ReactIconComponent
                    icon={showPwd2 ? 'FaEyeSlash' : 'FaEye'}
                    setClass="w-4 h-4 text-gray-500"
                  />
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">รหัสผ่านไม่ตรงกัน</p>
              )}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={handleReset}
            disabled={submitting}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-yellow-100 text-yellow-700 border border-solid border-yellow-700 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'กำลังตั้งรหัส...' : 'ยืนยันตั้งรหัส'}
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

export default AdminModalRepassword;
