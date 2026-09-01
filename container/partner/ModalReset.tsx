import { Button, ButtonProps } from "@/components/ui/button";

import React, { useEffect, useState } from "react";
import Modal from "@/components/form/Modal";
import ReactIconComponent from "@/components/ReactIconComponent";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import { AgUserDB } from "@prisma/client";

type Position = "master" | "agent";

interface PartnerModalResetProps {
  onSuccess?: () => void;
  data: AgUserDB;
}

/** เลือก endpoint ตามตำแหน่ง */
function getEndpointByPosition(pos?: string) {
  const p = (pos || "").toLowerCase();
  if (p === "master") return "/api/unblock-master";
  if (p === "agent") return "/api/unblock-agent";
  throw new Error(`ไม่รองรับตำแหน่ง (position): ${pos}`);
}

const PartnerModalReset: React.FC<PartnerModalResetProps> = ({ data, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /** 
   * NOTE:
   * ใน flow เดิม newPassword ถูกใช้เป็น "suffix/รหัสต่อท้าย" เพื่อสร้าง usernameAG
   * และถูก preload มาจาก /api/web-base?name= ด้วย passM/passA
   */
  const newPassword = "riDNdZb7430E+1";

  /** preload ค่าจาก web-base (passM/passA) ตามตำแหน่ง */
  const fetchnewPassword = async () => {
    setLoading(true);
    try {
      const webname = data.webname ?? "";
      if (!webname) {
        return;
      }

      const response = await fetch(`/api/web-base?name=${encodeURIComponent(webname)}`);
      const result = await response.json();

      if (result?.success && result?.data) {
        const isMaster = (data.position || "").toLowerCase() === "master";
        const passValue = isMaster ? result.data?.passM : result.data?.passA;
      } else {
        toast.error("ไม่พบข้อมูล WebBaseDB/OTP");
      }
    } catch (err) {
      console.error("Failed to fetch OTP:", err);
      toast.error("ดึงรหัสไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchnewPassword();
    } else {
      // ปิดแล้วเคลียร์ค่าถ้าต้องการ
      // setNewPassword('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /** ปลดล็อค (ส่งคำสั่งไปยัง endpoint ตามตำแหน่ง) */
  const handleUnlock = async () => {


    // เตรียมค่าที่จะใช้ และ log ให้ครบแบบไม่ error
    const usernameAG = `${data.username}`;
    const adviser = data.origin ?? "";
    const position = data.position ?? "";

   // console.log(`chech usernameAG : ufh27oa0 : ${usernameAG === "ufh27oa0"}`);
   // console.log(`chech adviser : ufh27o : ${adviser === "ufh27o"}`);
   // console.log(`chech position : agent : ${position === "agent" || "master"}`);
   // console.log(`chech newPassword : riDNdZb7430E+1 : ${newPassword === "riDNdZb7430E+1"}`);

    try {
      setLoading(true);

      const endpoint = getEndpointByPosition(data.position);
     // console.log("endpoint :", endpoint);

      const payload: {
        usernameAG: string;
        adviser: string;
        position: Position | string;
        newPassword?: string; // ถ้าต้องการให้เซิร์ฟเวอร์ตั้งรหัสใหม่ตามที่ระบุเอง ให้เปิดใช้งาน
      } = {
        usernameAG,
        adviser,
        position,
        newPassword
      };

      const res = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.data?.success) {
        const apiErr = res.data?.error || res.data?.message || "ปลดล็อคไม่สำเร็จ";
        throw new Error(apiErr);
      }

      toast.success(`ส่งคำสั่งปลดล็อคแล้ว (${(data.position || "").toUpperCase()})`);
      onSuccess?.();
      setIsOpen(false);
    } catch (err) {
      let message = "เกิดข้อผิดพลาด";
      if ((err as Error)?.message) message = (err as Error).message;
      if (axios.isAxiosError(err)) {
        const axErr = err as AxiosError<any>;
        message =
          axErr.response?.data?.error ||
          axErr.response?.data?.message ||
          axErr.message ||
          message;
      }
      console.error("❌ เกิดข้อผิดพลาดในการปลดล็อค:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="px-3 block p-1 rounded-md ring-1 transition-colors shadow-sm border ring-gray-200 bg-white/90 border-blue-400 hover:bg-gradient-to-r from-[#ff7878c2] to-[#69eeffc2] hover:shadow-md cursor-pointer"
      >
        ปลดล็อค {data.position === "master" ? "Master" : "Agent"}
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              ปลดล็อคพันธมิตร
              <span className="text-lg font-bold text-purple-500 ms-2">
                {data.username}
              </span>{" "}
              {(data.position || "").toLowerCase() === "master" ? "Master" : "Agent"}
            </Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} size="sm">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <h2 className=" text-2xl text-purple-600">
            Reset {data.username}
          </h2>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex space-x-2">
            <Button
              onClick={handleUnlock}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded border border-blue-700 border-solid hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 mr-2 animate-spin" />
                  กำลังปลดล็อค...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaUnlock" setClass="w-4 h-4 mr-2" />
                  ปลดล็อค
                </>
              )}
            </Button>

            <Button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded border border-gray-700 border-solid hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ReactIconComponent icon="FaTimes" setClass="w-4 h-4 mr-2" />
              ปิด
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PartnerModalReset;
