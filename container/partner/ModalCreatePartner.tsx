import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import Modal from "@/components/form/Modal";
import ReactIconComponent from "@/components/ReactIconComponent";
import toast from "react-hot-toast";
import { AgUserAccountDB } from "@prisma/client";
// import axios, { AxiosError } from "axios";

interface ModalCreatePartnerProps {
  onSuccess?: () => void;
  data: AgUserAccountDB;
}

const ModalCreatePartner: React.FC<ModalCreatePartnerProps> = ({ data, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    adviser: data.origin || "",
    usernameAG: data.username || "",
    parentUsername: data.username || "",
    position: "agent",
    createdPartnerUsername: "",
    createdPartnerPassword: "",
    createdPartnerNickname: "",
  });

  // Update form when data changes
  useEffect(() => {
    setForm({
      adviser: data.origin || "",
      usernameAG: data.username || "",
      parentUsername: data.username || "",
      position: "agent",
      createdPartnerUsername: "",
      createdPartnerPassword: "",
      createdPartnerNickname: "",
    });
  }, [data]);

  const handleSubmit = async () => {
    // Validation
    if (!form.adviser || !form.usernameAG || !form.parentUsername || !form.position) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    console.log("📝 Create Partner Data:", {
      adviser: form.adviser,
      usernameAG: form.usernameAG,
      parentUsername: form.parentUsername,
      position: form.position,
      createdPartnerUsername: form.createdPartnerUsername || null,
      createdPartnerPassword: form.createdPartnerPassword || null,
      createdPartnerNickname: form.createdPartnerNickname || null,
    });

    try {
      setLoading(true);

      // TODO: เปิดใช้งานเมื่อพร้อม
      // const res = await axios.post('/api/create-partner', form);
      // if (!res.data?.success) {
      //   throw new Error(res.data?.error || 'สร้างคำขอไม่สำเร็จ');
      // }

      toast.success("สร้างคำขอสร้าง Partner สำเร็จ (Demo)");
      onSuccess?.();
      setIsOpen(false);
      // Reset form
      setForm({
        adviser: "",
        usernameAG: "",
        parentUsername: "",
        position: "agent",
        createdPartnerUsername: "",
        createdPartnerPassword: "",
        createdPartnerNickname: "",
      });
    } catch (err) {
      console.error("❌ เกิดข้อผิดพลาด:", err);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="xs"
        className="!bg-indigo-600 !text-white hover:!bg-indigo-700 rounded-full px-3"
      >
        สร้าง Partner
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                สร้างคำขอสร้าง Partner
              </span>
            </Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} size="sm">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>ข้อมูลจาก:</strong> {data.username} ({data.position})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adviser <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.adviser}
                onChange={(e) => setForm({ ...form, adviser: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ระบุ adviser"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username AG <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.usernameAG}
                onChange={(e) => setForm({ ...form, usernameAG: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ระบุ username AG"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.parentUsername}
                onChange={(e) => setForm({ ...form, parentUsername: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ระบุ parent username"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ระบุ position"
              />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-2">
                ข้อมูล Partner ที่สร้าง (Optional)
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created Partner Username
              </label>
              <input
                type="text"
                value={form.createdPartnerUsername}
                onChange={(e) => setForm({ ...form, createdPartnerUsername: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="username ของ partner ที่สร้าง"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created Partner Password
              </label>
              <input
                type="text"
                value={form.createdPartnerPassword}
                onChange={(e) => setForm({ ...form, createdPartnerPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="password ของ partner ที่สร้าง"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created Partner Nickname
              </label>
              <input
                type="text"
                value={form.createdPartnerNickname}
                onChange={(e) => setForm({ ...form, createdPartnerNickname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="nickname ของ partner ที่สร้าง"
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ReactIconComponent icon="FaTimes" setClass="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaSave" setClass="w-4 h-4 mr-2" />
                  บันทึก
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalCreatePartner;

