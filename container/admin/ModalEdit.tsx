import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { useQueryClient } from '@tanstack/react-query';
import { qk } from '@/lib/queryKeys';
import { AdminDB } from '@prisma/client';


interface AdminModalEditProps {
  data: AdminDB;            // ข้อมูลแถวที่ต้องการแก้ไข
  onUpdated?: () => void;       // callback หลังบันทึกสำเร็จ (ถ้ามี)
  triggerClassName?: string;    // เผื่อปรับปุ่ม trigger ภายนอก
  triggerText?: string;         // ข้อความบนปุ่ม trigger
}

const AdminModalEdit: React.FC<AdminModalEditProps> = ({
  data,
  onUpdated,
  triggerClassName,
  triggerText = 'แก้ไขข้อมูล',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    tel: '',
  });

  const queryClient = useQueryClient();

  // เติมค่าเริ่มจาก props.data ทุกครั้งที่เปิดโมดอล
  useEffect(() => {
    if (!isOpen) return;
    setForm({
      username: data?.username ?? '',
      name: data?.name ?? '',
      email: data?.email ?? '',
      tel: data?.tel ?? '',
    });
  }, [isOpen, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.username.trim()) return 'กรุณากรอกชื่อผู้ใช้';
    if (!form.name.trim()) return 'กรุณากรอกชื่อ-นามสกุล';
    if (!form.email.trim()) return 'กรุณากรอกอีเมล';
    // ตรวจรูปแบบอีเมลแบบง่าย
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'รูปแบบอีเมลไม่ถูกต้อง';
    return '';
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.put('/api/admin', {
        id: data.id,
        username: form.username.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        tel: form.tel.trim(),
      });

      if (res.data?.success) {
        // refresh list & detail ถ้าใช้ qk แบบเดียวกับหน้า /admin
        await Promise.allSettled([
          queryClient.invalidateQueries({ queryKey: qk.admins.list, exact: false }),
          queryClient.invalidateQueries({ queryKey: qk.admins.detail(data.id), exact: false }),
        ]);

        alert('บันทึกข้อมูลสำเร็จ');
        setIsOpen(false);
        onUpdated?.();
      } else {
        alert(res.data?.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (e: any) {
      alert(e?.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200'
        }
      >
        <ReactIconComponent icon="FaEdit" setClass="w-4 h-4 mr-2" />
        {triggerText}
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>แก้ไขข้อมูลผู้ดูแลระบบ</Modal.Title>
            <div className="text-xs text-gray-500 mt-1">
              ID: <span className="font-medium">{data.id}</span>
            </div>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} disabled={submitting}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-3">
            {/* ชื่อผู้ใช้ */}
            <div>
              <label className="block text-sm font-medium mb-1">ชื่อผู้ใช้ *</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* ชื่อ-นามสกุล */}
            <div>
              <label className="block text-sm font-medium mb-1">ชื่อ-นามสกุล *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* อีเมล */}
            <div>
              <label className="block text-sm font-medium mb-1">อีเมล *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* เบอร์โทร */}
            <div>
              <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
              <input
                name="tel"
                value={form.tel}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200"
          >
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminModalEdit;
