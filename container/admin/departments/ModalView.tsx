import React from 'react';
import { Button } from '@/components/ui/button';
import { AdminDepartmentDB } from '@prisma/client';
import Modal from '@/components/form/Modal';
import { FaTimes } from 'react-icons/fa';

interface DepartmentsModalViewProps {
  data: AdminDepartmentDB;
}

const DepartmentsModalView: React.FC<DepartmentsModalViewProps> = ({ data }) => {
  const [open, setOpen] = React.useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-2 py-1 rounded text-base bg-green-100 text-green-700 border border-solid border-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ดู
      </Button>

      <Modal open={open} onOpenChange={setOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>รายละเอียดแผนก</Modal.Title>
            {/* <Modal.Description>ตรวจสอบข้อมูลก่อนดำเนินการต่อ</Modal.Description> */}
          </div>
          <Modal.Close onClick={() => setOpen(false)}>
            <FaTimes className="h-6 w-6 mx-auto" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div>
            <span className="font-bold">ชื่อแผนก:</span> {data.name}
          </div>
          <div>
            <span className="font-bold">คำอธิบาย:</span> {data.description || '-'}
          </div>
          <div>
            <span className="font-bold">สถานะ:</span> {data.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </div>
          {data.createdAt && (
            <div>
              <span className="font-bold">สร้างเมื่อ:</span> {new Date(data.createdAt).toLocaleString()}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed" onClick={close}>ปิด</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DepartmentsModalView;


