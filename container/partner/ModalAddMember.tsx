import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Button, ButtonProps } from "@/components/ui/button"

import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { AgUserAccount } from '@/types/adjustBet';
import toast from 'react-hot-toast';

interface MemberModalAddProps {
  onSuccess: () => void;
}

interface MemberFormData {
  // รหัสพันธมิตร - ใช้เป็น agentId
  customer: string;
  // สู้ฟรี - ไม่มีใน PartnerDB แต่เก็บไว้สำหรับการแสดงผล
  freeFight: number;
  // เลขบัญชี - bankNumber ใน PartnerDB
  bankNumber: string;
  // ชื่อบัญชี - name ใน PartnerDB
  name: string;
  // ธนาคาร - bankName ใน PartnerDB
  bankName: string;
  // เบอร์โทร - tel ใน PartnerDB
  tel: string;
  // Line ID - line ใน PartnerDB
  line: string;
  // สถานะ - status ใน PartnerDB
  status: string;
  // วิธีคิด - method ใน PartnerDB
  method: string;
  // วันที่เริ่มทำงาน - startDate ใน PartnerDB
  startDate: string;
}

const MemberModalAdd: React.FC<MemberModalAddProps> = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [agUserAccounts, setAgUserAccounts] = useState<AgUserAccount[]>([]);
  const [selectedAgUser, setSelectedAgUser] = useState<AgUserAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [autoSelectedAgent, setAutoSelectedAgent] = useState(false);

  const [formData, setFormData] = useState<MemberFormData>({
    customer: '',
    freeFight: 0,
    bankNumber: '',
    name: '',
    bankName: '',
    tel: '',
    line: '',
    status: 'active',
    method: 'normal',
    startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  });

  // Load AG User Accounts
  const loadAgUserAccounts = async () => {
    try {
      const response = await axios.get(`/api/aguseraccounts?keyword=${searchTerm}`);
      if (response.data.success) {
        setAgUserAccounts(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load AG User Accounts:', error);
    }
  };

  // AG User search functions
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(true);
  };

  const handleSelectAgUser = (agUser: AgUserAccount) => {
    setSelectedAgUser(agUser);
    setSearchTerm(agUser.username);
    setShowDropdown(false);
    setAutoSelectedAgent(false); // manual

    // Auto-fill customer field with userLogin
    setFormData(prev => ({
      ...prev,
      customer: agUser.userLogin
    }));
    
    console.log('Selected AG User:', agUser.username, 'for customer:', agUser.userLogin);
  };

  const filteredAgUsers = agUserAccounts.filter(agUser =>
    agUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agUser.userLogin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = () => {
    setIsOpen(true);
    // Reset form data when opening
    setFormData({
      customer: '',
      freeFight: 0,
      bankNumber: '',
      name: '',
      bankName: '',
      tel: '',
      line: '',
      status: 'active',
      method: 'normal',
      startDate: new Date().toISOString().split('T')[0],
    });
    setSelectedAgUser(null);
    setSearchTerm('');
    setShowDropdown(false);
    setAutoSelectedAgent(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedAgUser(null);
    setSearchTerm('');
    setShowDropdown(false);
    setAutoSelectedAgent(false);
  };


  // Load AG User Accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAgUserAccounts();
    }
  }, [isOpen]);

  // Load AG User Accounts when search term changes
  useEffect(() => {
    if (searchTerm.length >= 6) {
      loadAgUserAccounts();
    }
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.ag-user-dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!selectedAgUser) {
        toast.error('กรุณาเลือก AG User');
        return;
      }
      if (!formData.name.trim()) {
        toast.error('กรุณากรอกชื่อบัญชี');
        return;
      }
      if (!formData.bankName.trim()) {
        toast.error('กรุณาเลือกธนาคาร');
        return;
      }
      if (!formData.bankNumber.trim()) {
        toast.error('กรุณากรอกเลขบัญชี');
        return;
      }
      if (!formData.tel.trim()) {
        toast.error('กรุณากรอกเบอร์โทร');
        return;
      }

      // ตรวจสอบรูปแบบเบอร์โทร
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.tel.replace(/[-\s]/g, ''))) {
        toast.error('กรุณากรอกเบอร์โทรให้ถูกต้อง (10-11 หลัก)');
        return;
      }

      // ตรวจสอบรูปแบบเลขบัญชี
      if (formData.bankNumber.length < 10) {
        toast.error('เลขบัญชีต้องมีอย่างน้อย 10 หลัก');
        return;
      }

      setSaving(true);
      
      // ส่งข้อมูลไปยัง API ตาม PartnerDB schema
      const partnerData = {
        agentId: selectedAgUser.id,
        bankName: formData.bankName.trim(),
        bankNumber: formData.bankNumber.trim(),
        name: formData.name.trim(),
        tel: formData.tel.trim(),
        line: formData.line.trim() || '',
        status: formData.status,
        method: formData.method,
        startDate: formData.startDate,
        createdBy: 'system', // TODO: Get from auth context
      };
      
      const res = await axios.post('/api/partners', partnerData);
      
      if (res.status === 201 && res.data.success) {
        toast.success('✅ เพิ่มข้อมูลสมาชิกสำเร็จ');
        onSuccess();
        handleClose();
      } else {
        const errorMessage = res.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล';
        toast.error(errorMessage);
        console.error('API Error:', res.data);
      }
    } catch (err: any) {
      console.error('Save error:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Add Member Button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
      >
        <ReactIconComponent icon="FaPlus" setClass="w-4 h-4 mr-2" />
        เพิ่มสมาชิก
      </button>

      {/* Modal */}
      <Modal open={isOpen} onOpenChange={handleClose} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>เพิ่มสมาชิกใหม่</Modal.Title>
            <Modal.Description>กรอกข้อมูลสมาชิกใหม่เพื่อเพิ่มเข้าสู่ระบบ</Modal.Description>
          </div>
          <Modal.Close onClick={handleClose} disabled={saving} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-4">
            {/* แถวที่ 1: รหัสพันธมิตร และ AG User */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสพันธมิตร *
                </label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => updateFormData('customer', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="เช่น ufh27oa10001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AG User *
                  {autoSelectedAgent && (
                    <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      เลือกอัตโนมัติ
                    </span>
                  )}
                </label>
                <div className="relative ag-user-dropdown">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent ${autoSelectedAgent
                        ? 'border-green-300 bg-green-50 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-green-500'
                      }`}
                    placeholder="ค้นหา AG User..."
                  />
                  {showDropdown && filteredAgUsers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredAgUsers.map((agUser) => (
                        <div
                          key={agUser.id}
                          onClick={() => handleSelectAgUser(agUser)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          <div className="font-medium">{agUser.username}</div>
                          <div className="text-gray-500 text-xs">
                            User Login: {agUser.userLogin}
                            {agUser.webname && ` | Web: ${agUser.webname}`}
                            {agUser.position && ` | Position: ${agUser.position}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedAgUser && (
                  <div
                    className={`mt-2 p-2 border rounded text-sm ${autoSelectedAgent ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                      }`}
                  >
                    <div className={`font-medium ${autoSelectedAgent ? 'text-green-900' : 'text-blue-900'}`}>
                      เลือกแล้ว: {selectedAgUser.username}
                      {autoSelectedAgent && <span className="ml-2 text-xs">(เชื่อมโยงกับลูกค้าอัตโนมัติ)</span>}
                    </div>
                    <div className={`text-xs ${autoSelectedAgent ? 'text-green-700' : 'text-blue-700'}`}>
                      User Login: {selectedAgUser.userLogin}
                      {selectedAgUser.webname && ` | Web: ${selectedAgUser.webname}`}
                      {selectedAgUser.position && ` | Position: ${selectedAgUser.position}`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* แถวที่ 2: ชื่อบัญชี และ เลขบัญชี */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อบัญชี *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="เช่น สาโรจน์"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เลขบัญชี *
                </label>
                <input
                  type="text"
                  value={formData.bankNumber}
                  onChange={(e) => updateFormData('bankNumber', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="เช่น 1668972833"
                />
              </div>
            </div>

            {/* แถวที่ 3: ธนาคาร และ เบอร์โทร */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ธนาคาร *
                </label>
                <select
                  value={formData.bankName}
                  onChange={(e) => updateFormData('bankName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">เลือกธนาคาร</option>
                  <option value="กสิกรไทย">กสิกรไทย</option>
                  <option value="กรุงเทพ">กรุงเทพ</option>
                  <option value="กรุงศรีอยุธยา">กรุงศรีอยุธยา</option>
                  <option value="ไทยพาณิชย์">ไทยพาณิชย์</option>
                  <option value="กรุงไทย">กรุงไทย</option>
                  <option value="ทหารไทย">ทหารไทย</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทร *
                </label>
                <input
                  type="tel"
                  value={formData.tel}
                  onChange={(e) => updateFormData('tel', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="เช่น 0915239792"
                />
              </div>
            </div>

            {/* แถวที่ 4: Line ID และ วันที่เริ่มทำงาน */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line ID
                </label>
                <input
                  type="text"
                  value={formData.line}
                  onChange={(e) => updateFormData('line', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="เช่น @username หรือ -"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่เริ่มทำงาน
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* แถวที่ 5: สถานะ และ วิธีคิด */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สถานะ
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วิธีคิด
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => updateFormData('method', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="special">Special</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>

            {/* สู้ฟรี (ข้อมูลเพิ่มเติม) */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สู้ฟรี (ข้อมูลเพิ่มเติม)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.freeFight}
                  onChange={(e) => updateFormData('freeFight', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">ข้อมูลนี้จะไม่ถูกบันทึกในฐานข้อมูล แต่แสดงเพื่อความสะดวก</p>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'กำลังบันทึก...' : 'เพิ่มสมาชิก'}
          </Button>
          <Button 
            onClick={handleClose} 
            disabled={saving}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MemberModalAdd;
