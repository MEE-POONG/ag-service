import { Button, ButtonProps } from "@/components/ui/button"

import axios from '@/lib/axios';
import React, { useState, useEffect } from 'react';
import Modal from '@/components/form/Modal';
import ReactIconComponent from '@/components/ReactIconComponent';
import { ExtendedAdminDepartment } from '@/data/interface';
import { useAuth } from '@/hooks/useAuth';

interface MenuWebModalSwitchPositionProps {
  onSuccess: () => void;
  data: ExtendedAdminDepartment;
}

interface MenuWithOrder {
  id: string;
  name: string;
  originalOrder: number;
  showOrder: number;
}

const MenuWebModalSwitchPosition: React.FC<MenuWebModalSwitchPositionProps> = ({ onSuccess, data }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuWithOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && data) {
      console.log(data);
      // เรียงลำดับตาม showOrder และแปลงเป็น format ที่ใช้งาน
      const sortedMenus = [...data.adminPositions]
        .sort((a, b) => Number(a.priority) - Number(b.priority))
        .map(menu => ({
          id: menu.id,
          name: menu.name,
          originalOrder: Number(menu.priority),
          showOrder: Number(menu.priority),
        }));
      setMenuItems(sortedMenus);
    }
  }, [isOpen, data]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    const newMenuItems = [...menuItems];
    const draggedIndex = newMenuItems.findIndex(item => item.id === draggedItem);
    const targetIndex = newMenuItems.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // สลับตำแหน่ง
    const draggedItemData = newMenuItems[draggedIndex];
    newMenuItems.splice(draggedIndex, 1);
    newMenuItems.splice(targetIndex, 0, draggedItemData);

    // อัปเดต showOrder ใหม่
    const updatedMenus = newMenuItems.map((item, index) => ({
      ...item,
      showOrder: index + 1
    }));

    setMenuItems(updatedMenus);
    setDraggedItem(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;

    const newMenuItems = [...menuItems];
    [newMenuItems[index], newMenuItems[index - 1]] = [newMenuItems[index - 1], newMenuItems[index]];

    // อัปเดต showOrder
    const updatedMenus = newMenuItems.map((item, idx) => ({
      ...item,
      showOrder: idx + 1
    }));

    setMenuItems(updatedMenus);
  };

  const moveDown = (index: number) => {
    if (index === menuItems.length - 1) return;

    const newMenuItems = [...menuItems];
    [newMenuItems[index], newMenuItems[index + 1]] = [newMenuItems[index + 1], newMenuItems[index]];

    // อัปเดต showOrder
    const updatedMenus = newMenuItems.map((item, idx) => ({
      ...item,
      showOrder: idx + 1
    }));

    setMenuItems(updatedMenus);
  };

  const handleSave = async () => {
    console.log("menuItems : ", menuItems);
    if (loading) return;

    try {
      setLoading(true);

      // เตรียมข้อมูลสำหรับส่งไป API
      const updates = menuItems.map(item => ({
        id: item.id,
        showOrder: item.showOrder,
      }));

      const response = await axios.put('/api/admin-positions/showorder', {
        updates,
        updatedBy: user?.id
      });

      if (response.data.success) {
        setIsOpen(false);
        onSuccess();
        // แสดงข้อความสำเร็จ (อาจใช้ toast notification)
        console.log('✅ อัปเดตลำดับการแสดงสำเร็จ');
      } else {
        console.error('❌ เกิดข้อผิดพลาด:', response.data.error);
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการบันทึก:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <Button onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2 py-1 rounded text-base bg-purple-100 text-purple-700 border border-solid border-purple-700 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
        size="sm">
        จัดลำดับการแสดง
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>จัดลำดับการแสดงผลเมนู</Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-2">
            {/* คำแนะนำการใช้งาน */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <ReactIconComponent icon="FaInfoCircle" setClass="w-4 h-4 text-blue-500 mr-2 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <strong>วิธีใช้:</strong> ลากและวางเพื่อเปลี่ยนลำดับ หรือใช้ปุ่มลูกศรขึ้น/ลง
                </div>
              </div>
            </div>

            {/* รายการเมนู */}
            {menuItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ReactIconComponent icon="FaList" setClass="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>ไม่มีข้อมูลเมนูสำหรับจัดลำดับ</p>
              </div>
            ) : (
              menuItems.map((menu, index) => (
                <div
                  key={menu.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, menu.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, menu.id)}
                  className={`
                    flex items-center justify-between bg-white border-2 px-3 py-2 rounded-lg cursor-move
                    transition-all duration-200 hover:shadow-md
                    ${draggedItem === menu.id ? 'border-blue-400 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div className="flex items-center flex-1">
                    {/* Drag Handle */}
                    <div className="mr-3 cursor-move">
                      <ReactIconComponent icon="FaGripVertical" setClass="w-4 h-4 text-gray-400" />
                    </div>


                    {/* ชื่อเมนู */}
                    <span className="text-sm font-medium text-gray-700 flex-1">
                      {menu.name}
                    </span>
                  </div>

                  {/* ลำดับเก่า */}
                  <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full mr-3 min-w-[30px] text-center">
                    Old : {menu.originalOrder}
                  </div>
                  {/* ลำดับปัจจุบัน */}
                  <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full mr-3 min-w-[30px] text-center">
                    New : {menu.showOrder}
                  </div>

                  {/* ปุ่มควบคุม */}
                  <div className="flex items-center space-x-1">
                    {/* ปุ่มขึ้น */}
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className={`
                        p-1 rounded transition-colors
                        ${index === 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                        }
                      `}
                    >
                      <ReactIconComponent icon="FaChevronUp" setClass="w-3 h-3" />
                    </button>

                    {/* ปุ่มลง */}
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === menuItems.length - 1}
                      className={`
                        p-1 rounded transition-colors
                        ${index === menuItems.length - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                        }
                      `}
                    >
                      <ReactIconComponent icon="FaChevronDown" setClass="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* สถิติ */}
            {menuItems.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>จำนวนเมนูทั้งหมด: <strong>{menuItems.length}</strong> รายการ</span>
                  <span>ลำดับ: {menuItems[0]?.showOrder} - {menuItems[menuItems.length - 1]?.showOrder}</span>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-between items-center w-full">
            {/* สถานะการเปลี่ยนแปลง */}
            <div className="text-xs text-gray-500">
              {menuItems.length > 0 && (
                <span>พร้อมบันทึกการเปลี่ยนแปลง {menuItems.length} รายการ</span>
              )}
            </div>

            {/* ปุ่มควบคุม */}
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={loading || menuItems.length === 0}
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
                ยกเลิก
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MenuWebModalSwitchPosition;

