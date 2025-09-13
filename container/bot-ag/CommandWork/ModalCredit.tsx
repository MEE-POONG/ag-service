import { Button } from '@/components/ui/button';
import axios from '@/lib/axios';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/form/Modal';
import ReactIconComponent from '@/components/ReactIconComponent';
import { AgUserAccountDB } from '@prisma/client';
import { qk } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

interface CommandWorkModalCreditProps {
  onSuccess?: () => void;
  data: AgUserAccountDB;
}


const CommandWorkModalCredit: React.FC<CommandWorkModalCreditProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credit, setCredit] = useState({ username: '', credit: 0 });


  // เติมค่าเริ่มต้นเมื่อเปิดโมดัล
  useEffect(() => {
    if (isOpen && data) {
      setCredit({ username: data.username, credit: 0 });
    }
  }, [isOpen, data]);

  // --- ดึงข้อมูลแบบเจาะจงจาก /api/aguseraccounts/selectorigin ---
  const { data: sel, isFetching: isFetchingSel } = useQuery({
    queryKey: qk.agUsers.selectOrigin(data.origin || '', data.position || '',),
    queryFn: async () => {
      const res = await axios.get('/api/aguseraccounts/selectorigin', {
        params: {
          origin: data.origin || '',
          position: data.position || '',

        },
      })
      if (!res.data?.success) throw new Error(res.data?.error || 'โหลดข้อมูล selectorigin ล้มเหลว')
      return {
        data: res.data.data,
        pagination: res.data.pagination,
      }
    },
    enabled: isOpen,
    staleTime: 30_000,
  });

  const originUser = sel?.data?.originUser ?? null;

  const handleSave = async () => {
    try {
      if (!credit.credit || credit.credit <= 0) {
        toast.error('กรุณาระบุจำนวนเครดิตให้ถูกต้อง')
        return
      }
      setLoading(true);
      const res = await axios.post('/api/aguseraccounts/credit', {
        username: data.username,
        credit: credit.credit,
      })
      if (!res.data?.success) throw new Error(res.data?.error || 'บันทึกไม่สำเร็จ')

      const result = res.data?.data
      const flag = result?.statusServe
      if (flag === 'SUCCESS') {
        toast.success('เติมเครดิตสำเร็จ')
      } else if (flag === 'FAILED') {
        toast.error(result?.statusAG || 'เติมเครดิตล้มเหลว')
      } else {
        toast.success('ส่งคำสั่งเติมเครดิตแล้ว')
      }
      setIsOpen(false)
    } catch (error: any) {
      console.error('❌ เกิดข้อผิดพลาดในการบันทึก:', error);
      toast.error(error?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="px-3 block p-1 rounded-md ring-1 transition-colors shadow-sm border ring-gray-200 bg-white/90 border-purple-200 hover:bg-gradient-to-r from-[#A78BFA50] to-[#34D39950] hover:shadow-md cursor-pointer"
      >
        เติมเครดิต
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              เติมเครดิต
              <span className="ms-2 text-lg font-bold text-purple-500">{data.username}</span>
            </Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} size="sm">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="grid grid-cols-1 gap-4">
            {/* ช่องกรอกเครดิต */}
            <div>
              <label className="block mb-1 text-sm font-medium">จำนวนเครดิต</label>
              <input
                type="number"
                value={credit.credit}
                onChange={(e) => setCredit((prev) => ({ ...prev, credit: Number(e.target.value) || 0 }))}
                className="px-3 py-2 w-full rounded-xl border border-green-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              />
            </div>

            {/* แสดงผล selectorigin */}
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">ข้อมูลอ้างอิง (origin / higher position)</h3>
                {isFetchingSel && (
                  <span className="text-sm text-green-500 inline-flex items-center gap-1">
                    <ReactIconComponent icon="FaSpinner" setClass="h-3.5 w-3.5 animate-spin" />
                    กำลังโหลด...
                  </span>
                )}
              </div>
              {/* originUser */}
              <div className="mt-2 p-3 rounded-lg border border-green-200 bg-green-50">
                <div className="text-sm text-green-600 mb-1">ต้นทาง (origin):</div>
                {data.origin ? (
                  originUser ? (
                    <div className="text-sm">
                      <span className="text-lg font-medium text-green-800">{originUser.username}</span>
                      <span className="text-green-600">
                        {' '}
                        • userLogin: {originUser.userLogin} • position: {originUser.position}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-green-500">
                      ไม่พบผู้ใช้ที่ username ตรงกับ <span className="font-medium">{data.origin}</span>
                    </div>
                  )
                ) : (
                  <div className="text-sm text-green-500">ไม่มีค่า origin ในรายการนี้</div>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex justify-between items-center w-full">
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={loading || !credit.credit || credit.credit <= 0}
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

export default CommandWorkModalCredit;
