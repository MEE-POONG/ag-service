import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/form/Modal';
import ReactIconComponent from '@/components/ReactIconComponent';
import { useMutation, useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/queryKeys';
import { ExtendedWebBaseDB } from '@/data/interface';
import axios from '@/lib/axios';
import qs from 'qs';
import { useAuth } from '@/hooks/useAuth';
// import { AgUserAccountDB } from '@prisma/client';

type WebBaseResp = {
  success: boolean;
  data: ExtendedWebBaseDB[];
  total?: number;
};

type AgUserAccountDB = {
  id?: string
  username: string
  reserve: string
  userLogin: string
  origin: string
  position: string
  gaSecretEnc: string
  meta?: string
  webname?: string
}

interface ModalFuctionSettingProps {
  onSuccess?: () => void;
  data: AgUserAccountDB;
}

const ModalFuctionSetting: React.FC<ModalFuctionSettingProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectFuction, setSelectFuction] = useState(''); // เริ่มที่ค่าว่างตรงกับ placeholder
  const { user } = useAuth();
  
  const createResetMasterJobsMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/create-reset-master-jobs', {
        adviser: data.username,
        position: data.position,
        webname: data.webname,
        userId: user?.id,
      });
      return res.data;
    },
  });

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!selectFuction) {
        toast.error('กรุณาเลือกฟังก์ชันก่อน');
        return;
      }

      // ✅ log ตามที่ต้องการ
      createResetMasterJobsMutation.mutate();

      // ถ้าอยากโชว์บน toast ด้วย
      toast.success(`webname=${data.webname || '-'} | position=${data.position || '-'} | username=${data.username || '-'}`);

      // …ที่เหลือค่อยต่อ API จริงทีหลังได้
    } catch (error: any) {
      console.error('❌ เกิดข้อผิดพลาดในการบันทึก:', error);
      toast.error(error?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectFuction === '1xxxxxxxa1') {
      const { webname, position, username } = data || {};
      console.log('[Reset Master] webname:', webname, '| position:', position, '| username:', username);
    }
  }, [selectFuction]);


  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="px-3 block p-1 rounded-md ring-1 transition-colors shadow-sm border ring-gray-200 bg-white/90 border-red-200 hover:bg-gradient-to-r from-[#fa8b8b50] to-[#d3343450] hover:shadow-md cursor-pointer"
      >
        ปุ่มฟังก์ชันอันตราย
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              ปุ่มฟังก์ชันอันตราย
              <span className="ms-2 text-lg font-bold text-red-500">{data.username}</span>
            </Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} size="sm">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="grid grid-cols-1 gap-4">
            <label className='block mb-1 text-sm font-medium'>เลือกฟังก์ชัน</label>
            <select
              defaultValue=""
              onChange={(e) => setSelectFuction(e.target.value)}
              className="px-3 py-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
            >
              <option value="" disabled hidden>เลือกฟังก์ชัน</option>
              <option value="1xxxxxxxa1">รีรหัสผ่าน Master ทั้งหมด</option>
            </select>
          </div>

        </Modal.Body>

        <Modal.Footer>
          <div className="flex justify-between items-center w-full">
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 rounded text-sm bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

              <Button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 rounded text-sm bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ReactIconComponent icon="FaTimes" setClass="w-4 h-4 mr-2" />
                ปิด
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalFuctionSetting;
