import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import Modal from "@/components/form/Modal";
import ReactIconComponent from "@/components/ReactIconComponent";
import toast from "react-hot-toast";
import { AgUserAccountDB } from "@prisma/client";
// import axios, { AxiosError } from "axios";

interface ModalCreateAgentProps {
  onSuccess?: () => void;
  data: AgUserAccountDB;
}

const ModalCreateAgent: React.FC<ModalCreateAgentProps> = ({ data, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    adviser: data.origin || "",
    usernameAG: data.username || "",
    position: "agent",
  });

  // Update form when data changes
  useEffect(() => {
    setForm({
      adviser: data.origin || "",
      usernameAG: data.username || "",
      position: "agent",
    });
  }, [data]);

  const handleSubmit = async () => {
    // Validation
    if (!form.adviser || !form.usernameAG || !form.position) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    console.log("📝 Create Agent Data:", {
      adviser: form.adviser,
      usernameAG: form.usernameAG,
      position: form.position,
    });

    try {
      setLoading(true);

      // TODO: เปิดใช้งานเมื่อพร้อม
      // const res = await axios.post('/api/create-agent', form);
      // if (!res.data?.success) {
      //   throw new Error(res.data?.error || 'สร้างคำขอไม่สำเร็จ');
      // }

      toast.success("สร้างคำขอสร้าง Agent สำเร็จ (Demo)");
      onSuccess?.();
      setIsOpen(false);
      // Reset form
      setForm({
        adviser: "",
        usernameAG: "",
        position: "agent",
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
        className="!bg-green-600 !text-white hover:!bg-green-700 rounded-full px-3"
      >
        สร้าง Agent
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="lg" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                สร้างคำขอสร้าง Agent
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

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adviser <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.adviser}
                onChange={(e) => setForm({ ...form, adviser: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ระบุ username AG"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ระบุ position"
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
              className="inline-flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ModalCreateAgent;

