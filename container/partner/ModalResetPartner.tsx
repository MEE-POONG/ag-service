import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import Modal from "@/components/form/Modal";
import ReactIconComponent from "@/components/ReactIconComponent";
import toast from "react-hot-toast";
import { AgUserAccountDB } from "@prisma/client";
import axios from "axios";
// import axios, { AxiosError } from "axios";

interface ModalResetPartnerProps {
  onSuccess?: () => void;
  data: AgUserAccountDB;
}

const ModalResetPartner: React.FC<ModalResetPartnerProps> = ({ data, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    adviser: data.origin || "",
    usernameAG: data.username || "",
    partnerAG: data.partnerAG || "",
    partnerLogin: data.partnerLogin || "",
    position: data.position as "agent" | "master" || "agent",
  });

  // Update form when data changes
  useEffect(() => {
    setForm({
      adviser: data.origin || "",
      usernameAG: data.username || "",
      partnerAG: data.partnerAG || "",
      partnerLogin: data.partnerLogin || "",
      position: data.position as "agent" | "master" || "agent",
    });
  }, [data]);

  const handleSubmit = async () => {
    // Validation
    if (!form.adviser || !form.usernameAG || !form.partnerAG || !form.partnerLogin) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    console.log("📝 Reset Partner Data:", {
      adviser: form.adviser.trim(),
      usernameAG: form.usernameAG.trim(),
      partnerAG: form.partnerAG.trim(),
      partnerLogin: form.partnerLogin.trim(),
      position: form.position.trim(),
    });

    try {
      setLoading(true);

      // TODO: เปิดใช้งานเมื่อพร้อม
      const res = await axios.post('/api/reset-partner', form);
      if (!res.data?.success) {
        throw new Error(res.data?.error || 'สร้างคำขอไม่สำเร็จ');
      }

      toast.success("สร้างคำขอรีเซ็ตพาร์ทเนอร์สำเร็จ (Demo)");
      onSuccess?.();
      setIsOpen(false);
      // Reset form
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
        className="px-3 block p-1 rounded-md ring-1 transition-colors shadow-sm border ring-gray-200 bg-white/90 border-blue-400 hover:bg-gradient-to-r from-[#ff7878c2] to-[#69eeffc2] hover:shadow-md cursor-pointer"
      >
        รีเซ็ตพาร์ทเนอร์
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="lg" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                สร้างคำขอรีเซ็ตพาร์ทเนอร์
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
                Username AG <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.usernameAG}
                onChange={(e) => setForm({ ...form, usernameAG: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ระบุ username AG"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adviser <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.adviser}
                onChange={(e) => setForm({ ...form, adviser: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ระบุ adviser"
                disabled
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner AG <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.partnerAG}
                onChange={(e) => setForm({ ...form, partnerAG: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ระบุ partner AG"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner Login <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.partnerLogin}
                onChange={(e) => setForm({ ...form, partnerLogin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ระบุ partner login"
                disabled
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position <span className="text-red-500">*</span>
              </label>
              <select
                disabled
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value as "agent" | "master" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="agent">Agent</option>
                <option value="master">Master</option>
              </select>
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
              className="inline-flex items-center px-4 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ModalResetPartner;

