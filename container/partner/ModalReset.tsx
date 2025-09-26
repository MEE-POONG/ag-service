// PartnerModalConfirmReset.tsx
import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/form/Modal";
import ReactIconComponent from "@/components/ReactIconComponent";
import toast from "react-hot-toast";

type AgUserAccountDB = {
  id?: string;
  username: string;
  reserve: string;
  userLogin: string;
  origin: string;
  position: string;
  gaSecretEnc: string;
  meta?: string;
  webname?: string;
};

interface PartnerModalResetProps {
  data: AgUserAccountDB;
}

const PartnerModalReset: React.FC<PartnerModalResetProps> = ({
  data,
}) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = useCallback(async () => {
    console.log('handleConfirm', data);
    // try {
    //   setSubmitting(true);
    //   toast.success("ดำเนินการสำเร็จ");
    // } catch (err: any) {
    //   console.error("Confirm error:", err);
    //   toast.error(err?.message || "เกิดข้อผิดพลาดในการดำเนินการ");
    // } finally {
    //   setSubmitting(false);
    // }
  }, [data]);

  // กด Enter = ยืนยัน / Esc = ปิด (Modal เดิมรองรับ Esc อยู่แล้ว)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!submitting) handleConfirm();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, handleConfirm]);

  return (
    <>
      {/* ปุ่มเปิดโมดัล */}
      <Button
        onClick={() => setOpen(true)}
        className="px-3 block p-1 rounded-md ring-1 transition-colors shadow-sm border ring-gray-200 bg-white/90 border-red-200 hover:bg-gradient-to-r from-[#fa8b8b50] to-[#d3343450] hover:shadow-md cursor-pointer"
      >
        รีเซ็ตรหัสผ่าน
      </Button>

      <Modal
        open={open}
        onOpenChange={(v) => !submitting && setOpen(v)} // กันปิดระหว่างกำลังส่ง
        size="md"
        closeOnOverlayClick={!submitting}
        closeOnEsc={!submitting}
      >
        <Modal.Header>
          <div>
            <Modal.Title>
              ยืนยันการรีเซ็ตข้อมูล
              <span className="ms-2 text-lg font-bold text-red-500">
                {data?.username || "-"}
              </span>
            </Modal.Title>
          </div>
          <Modal.Close
            onClick={() => !submitting && setOpen(false)}
            size="sm"
            disabled={submitting}
          >
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <p className="text-sm text-gray-700 leading-6">
            `คุณต้องการรีเซ็ตรหัสผ่าน/ข้อมูลที่เกี่ยวข้องของผู้ใช้ "${data?.username ?? "-"}" ใช่หรือไม่?
            การกระทำนี้อาจส่งผลกับการเข้าสู่ระบบและสิทธิ์การเข้าถึงที่เชื่อมโยง โปรดยืนยันเพื่อดำเนินการต่อ`
          </p>
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            ⚠️ คำเตือน: การรีเซ็ตจะไม่สามารถย้อนกลับได้ กรุณาตรวจสอบให้แน่ใจก่อนยืนยัน
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex justify-end space-x-2 w-full">
            <Button
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 rounded text-sm bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ReactIconComponent icon="FaTimes" setClass="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 rounded text-sm bg-red-600 text-white border border-solid border-red-700 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <ReactIconComponent
                    icon="FaSpinner"
                    setClass="w-4 h-4 mr-2 animate-spin"
                  />
                  กำลังยืนยัน...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaCheck" setClass="w-4 h-4 mr-2" />
                  ยืนยัน
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PartnerModalReset;
