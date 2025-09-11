import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { AdjustBet, AdjustBetFormData, AdjustBetData, AgUserAccount } from '@/types/adjustBet';
import toast from 'react-hot-toast';
import { log } from 'console';

interface ModalAdJustBetProps {
  data?: AdjustBet;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit' | 'view';
}

const ModalAdJustBet: React.FC<ModalAdJustBetProps> = ({
  data,
  isOpen,
  onClose,
  onSuccess,
  mode
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [agUserAccounts, setAgUserAccounts] = useState<AgUserAccount[]>([]);
  const [selectedAgUser, setSelectedAgUser] = useState<AgUserAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [autoSelectedAgent, setAutoSelectedAgent] = useState(false);
  const [formData, setFormData] = useState<AdjustBetFormData>({
    name: '',
    description: '',
    customer: '',
    usernameAG: '',
    agBaseUrl: 'https://ag.ufabet.com',
    pinUsed: '',
    sportsbook: {
      enabled: true,
      commission: {
        main: 0,
        x12: 0,
        par: 0,
        other: 0
      },
      limits: {
        transLimit: 50000,
        beforeRun: 50000,
        maxX12: 50000,
        matchLimitX12: 50000,
        maxPar: 50000,
        par: 50000,
        maxOther: 50000,
        matchLimitOther: 50000,
        maxOS: 50000,
        matchLimitOS: 50000
      }
    },
    sexy: {
      enabled: false,
      profile: 1
    },
    sa: {
      enabled: false,
      commissionRAR: 0,
      profile: 1
    },
    slotItp: {
      enabled: false
    },
    slotJoker: {
      enabled: false
    },
    slotPlaystar: {
      enabled: false
    },
    cockfight: {
      enabled: false,
      commissionRBG: 0
    },
    muayStep: {
      enabled: false
    },
    virtualSports: {
      enabled: false
    }
  });

  const loadAgUserAccounts = async () => {
    try {
      const response = await axios.get(`/api/aguseraccounts?keyword=${searchTerm}`);
      if (response.data.success) {
        console.log(response.data.data);
        setAgUserAccounts(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load AG User Accounts:', error);
    }
  };

  // โหลด agent ของลูกค้าจาก customer-agent mapping
  const loadCustomerAgent = async (customerId: string) => {
    try {
      const response = await axios.get(`/api/customer-agent?customerId=${customerId}`);
      if (response.data.success && response.data.data) {
        const customerAgent = response.data.data;
        setSelectedAgUser(customerAgent.agent);
        setSearchTerm(customerAgent.agent.username);
        setAutoSelectedAgent(true);
        
        toast.success(`เลือก Agent: ${customerAgent.agent.username} อัตโนมัติ`);
      }
    } catch (error) {
      console.error('Failed to load customer agent:', error);
      setAutoSelectedAgent(false);
    }
  };

  // บันทึก customer-agent mapping
  const saveCustomerAgent = async (customerId: string, agentId: string) => {
    try {
      await axios.post('/api/customer-agent', {
        customerId,
        agentId,
        note: `Auto-created from ModalAdJustBet for customer ${customerId}`
      });
    } catch (error) {
      console.error('Failed to save customer-agent mapping:', error);
      // ไม่ต้อง throw error เพราะนี่เป็นการบันทึกเพิ่มเติม
    }
  };

  // Load AG User Accounts
  useEffect(() => {


    if (isOpen) {
      loadAgUserAccounts();
    }
  }, [isOpen]);
  useEffect(() => {
    console.log(searchTerm.length);
    if (searchTerm.length >= 6) {
      loadAgUserAccounts();
    }
  }, [searchTerm]);

  // Initialize form data when data prop changes
  useEffect(() => {
    if (data && mode !== 'create') {
      setFormData({
        name: data.name,
        description: data.description,
        customer: data.data.customer,
        usernameAG: data.data.usernameAG,
        agBaseUrl: data.data.agBaseUrl,
        pinUsed: data.data.pinUsed,
        sportsbook: data.data.sportsbook,
        sexy: data.data.sexy,
        sa: data.data.sa,
        slotItp: data.data.slotItp,
        slotJoker: data.data.slotJoker,
        slotPlaystar: data.data.slotPlaystar,
        cockfight: data.data.cockfight,
        muayStep: data.data.muayStep,
        virtualSports: data.data.virtualSports
      });

      // Set selected AG User for edit mode
      if (agUserAccounts.length > 0) {
        const matchingAgUser = agUserAccounts.find(agUser =>
          agUser.username === data.data.usernameAG
        );
        if (matchingAgUser) {
          setSelectedAgUser(matchingAgUser);
          setSearchTerm(matchingAgUser.username);
        }
      }
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        customer: '',
        usernameAG: '',
        agBaseUrl: 'https://ag.ufabet.com',
        pinUsed: '',
        sportsbook: {
          enabled: true,
          commission: { main: 0, x12: 0, par: 0, other: 0 },
          limits: {
            transLimit: 10000,
            beforeRun: 10000,
            maxX12: 10000,
            matchLimitX12: 10000,
            maxPar: 10000,
            par: 10000,
            maxOther: 10000,
            matchLimitOther: 10000,
            maxOS: 500,
            matchLimitOS: 500
          }
        },
        sexy: { enabled: false, profile: 1 },
        sa: { enabled: false, commissionRAR: 0, profile: 1 },
        slotItp: { enabled: false },
        slotJoker: { enabled: false },
        slotPlaystar: { enabled: false },
        cockfight: { enabled: false, commissionRBG: 0 },
        muayStep: { enabled: false },
        virtualSports: { enabled: false }
      });

      // Reset AG User selection for create mode only if not already cleared
      if (selectedAgUser !== null || searchTerm !== '') {
        setSelectedAgUser(null);
        setSearchTerm('');
      }
    }
  }, [data, mode]);

  // Set selected AG User when agUserAccounts are loaded (for edit mode)
  useEffect(() => {
    if (data && mode === 'edit' && agUserAccounts.length > 0 && !selectedAgUser) {
      const matchingAgUser = agUserAccounts.find(agUser =>
        agUser.username === data.data.usernameAG
      );
      if (matchingAgUser) {
        setSelectedAgUser(matchingAgUser);
        setSearchTerm(matchingAgUser.username);
      }
    }
  }, [agUserAccounts, data, mode, selectedAgUser]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.customer.trim()) {
      toast.error('กรุณากรอกรหัสลูกค้า');
      return;
    }
    if (!selectedAgUser) {
      toast.error('กรุณาเลือก AG User');
      return;
    }

    try {
      setSubmitting(true);

      const adjustBetData: AdjustBetData = {
        customer: formData.customer,
        usernameAG: selectedAgUser.userLogin,
        agBaseUrl: formData.agBaseUrl,
        pinUsed: '',
        sportsbook: { ...formData.sportsbook },
        sexy: { ...formData.sexy },
        sa: { ...formData.sa },
        slotItp: { ...formData.slotItp },
        slotJoker: { ...formData.slotJoker },
        slotPlaystar: { ...formData.slotPlaystar },
        cockfight: { ...formData.cockfight },
        muayStep: { ...formData.muayStep },
        virtualSports: { ...formData.virtualSports },
        createdBy: 'current-user-id', // TODO: Get from auth context
        updatedBy: 'current-user-id' // TODO: Get from auth context
      };

      let response;
      if (mode === 'create') {
        response = await axios.post('/api/adjust-bet', {
          name: formData.name,
          description: formData.description,
          data: adjustBetData
        });
      } else if (mode === 'edit' && data) {
        response = await axios.put(`/api/adjust-bet/${data.id}`, {
          name: formData.name,
          description: formData.description,
          data: adjustBetData
        });
      }

      if (response?.data.success) {
        toast.success(mode === 'create' ? 'สร้าง Adjust Bet สำเร็จ' : 'อัพเดท Adjust Bet สำเร็จ');
        onSuccess();
        onClose();
      } else {
        toast.error(response?.data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!data) return;

    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Adjust Bet นี้?')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.delete(`/api/adjust-bet/${data.id}`);

      if (response.data.success) {
        toast.success('ลบ Adjust Bet สำเร็จ');
        onSuccess();
        onClose();
      } else {
        toast.error(response.data.error || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // เมื่อกรอกรหัสลูกค้า ให้โหลด agent ที่เชื่อมโยงอัตโนมัติ
    if (field === 'customer' && value.trim()) {
      setAutoSelectedAgent(false); // รีเซ็ตสถานะ
      loadCustomerAgent(value.trim());
    }
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof AdjustBetFormData] as any),
        [field]: value
      }
    }));
  };

  const updateCommission = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      sportsbook: {
        ...prev.sportsbook,
        commission: {
          ...prev.sportsbook.commission,
          [field]: value
        }
      }
    }));
  };

  const updateLimits = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      sportsbook: {
        ...prev.sportsbook,
        limits: {
          ...prev.sportsbook.limits,
          [field]: value
        }
      }
    }));
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
    setAutoSelectedAgent(false); // เป็นการเลือกแบบ manual

    // Auto-generate name from selected AG User
    if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        name: `${agUser.username} - Adjust Bet`,
        description: `การตั้งค่าปรับเบทสำหรับ ${agUser.username} (${prev.customer || agUser.userLogin})`
      }));

      // บันทึก customer-agent mapping ถ้ามีรหัสลูกค้าแล้ว
      if (formData.customer.trim()) {
        saveCustomerAgent(formData.customer.trim(), agUser.id);
      }
    }
  };

  const filteredAgUsers = agUserAccounts.filter(agUser =>
    agUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agUser.userLogin.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const renderGameSection = (
    title: string,
    gameKey: keyof AdjustBetFormData,
    fields: { key: string; label: string; type: 'boolean' | 'number'; min?: number; max?: number }[]
  ) => {
    const game = formData[gameKey] as any;

    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={game.enabled}
              onChange={(e) => updateNestedFormData(gameKey as string, 'enabled', e.target.checked)}
              disabled={mode === 'view'}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
          </label>
        </div>

        {game.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={game[field.key]}
                    onChange={(e) => updateNestedFormData(gameKey as string, field.key, e.target.checked)}
                    disabled={mode === 'view'}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type="number"
                    value={game[field.key]}
                    onChange={(e) => updateNestedFormData(gameKey as string, field.key, parseFloat(e.target.value) || 0)}
                    disabled={mode === 'view'}
                    min={field.min}
                    max={field.max}
                    className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose} size="xl" closeOnOverlayClick={!submitting} closeOnEsc={!submitting}>
      <Modal.Header>
        <div>
          <Modal.Title>
            {mode === 'create' ? 'สร้าง Adjust Bet' :
              mode === 'edit' ? 'แก้ไข Adjust Bet' :
                'ดูรายละเอียด Adjust Bet'}
          </Modal.Title>
          {data && (
            <div className="text-xs text-gray-500 mt-1">
              ID: <span className="font-medium">{data.id}</span>
            </div>
          )}
        </div>
        <Modal.Close onClick={onClose} disabled={submitting}>
          <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
        </Modal.Close>
      </Modal.Header>

      <Modal.Body>
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Basic Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">ข้อมูลพื้นฐาน</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">รหัสลูกค้า *</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => updateFormData('customer', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น ufh27oa10001"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                    disabled={mode === 'view'}
                    className={`w-full rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 ${
                      autoSelectedAgent 
                        ? 'border-green-300 bg-green-50 focus:ring-green-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="ค้นหา AG User..."
                  />
                  {showDropdown && filteredAgUsers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
                  <div className={`mt-2 p-2 border rounded text-sm ${
                    autoSelectedAgent 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className={`font-medium ${
                      autoSelectedAgent ? 'text-green-900' : 'text-blue-900'
                    }`}>
                      เลือกแล้ว: {selectedAgUser.username}
                      {autoSelectedAgent && (
                        <span className="ml-2 text-xs">
                          (เชื่อมโยงกับลูกค้าอัตโนมัติ)
                        </span>
                      )}
                    </div>
                    <div className={`text-xs ${
                      autoSelectedAgent ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      User Login: {selectedAgUser.userLogin}
                      {selectedAgUser.webname && ` | Web: ${selectedAgUser.webname}`}
                      {selectedAgUser.position && ` | Position: ${selectedAgUser.position}`}
                    </div>
                    {!autoSelectedAgent && mode === 'create' && formData.customer.trim() && (
                      <div className="mt-1 text-xs text-gray-600">
                        💡 การเลือกนี้จะถูกบันทึกเป็นค่าเริ่มต้นสำหรับลูกค้า {formData.customer}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">คำอธิบาย</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  disabled={mode === 'view'}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="คำอธิบาย Adjust Bet"
                />
              </div>

              {/* Hidden name field for form data */}
              <input
                type="hidden"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
              />
            </div>
          </div>

          {/* Sportsbook */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Sportsbook</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.sportsbook.enabled}
                  onChange={(e) => updateNestedFormData('sportsbook', 'enabled', e.target.checked)}
                  disabled={mode === 'view'}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">เปิดใช้งาน</span>
              </label>
            </div>

            {formData.sportsbook.enabled && (
              <div className="space-y-4">
                {/* Commission */}
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">คอมมิชชั่น (%) - Read Only</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Main</label>
                      <input
                        type="number"
                        value={formData.sportsbook.commission.main}
                        readOnly
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-gray-100 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">X12</label>
                      <input
                        type="number"
                        value={formData.sportsbook.commission.x12}
                        readOnly
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-gray-100 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Par</label>
                      <input
                        type="number"
                        value={formData.sportsbook.commission.par}
                        readOnly
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-gray-100 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Other</label>
                      <input
                        type="number"
                        value={formData.sportsbook.commission.other}
                        readOnly
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">ขีดจำกัด</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Trans Limit</label>
                      <input
                        type="number"
                        value={formData.sportsbook.limits.transLimit}
                        onChange={(e) => updateLimits('transLimit', parseInt(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        min="0"
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Before Run</label>
                      <input
                        type="number"
                        value={formData.sportsbook.limits.beforeRun}
                        onChange={(e) => updateLimits('beforeRun', parseInt(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        min="0"
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Max X12</label>
                      <input
                        type="number"
                        value={formData.sportsbook.limits.maxX12}
                        onChange={(e) => updateLimits('maxX12', parseInt(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        min="0"
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Match Limit X12</label>
                      <input
                        type="number"
                        value={formData.sportsbook.limits.matchLimitX12}
                        onChange={(e) => updateLimits('matchLimitX12', parseInt(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        min="0"
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Max Par</label>
                      <input
                        type="number"
                        value={formData.sportsbook.limits.maxPar}
                        onChange={(e) => updateLimits('maxPar', parseInt(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        min="0"
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Par</label>
                      <input
                        type="number"
                        value={formData.sportsbook.limits.par}
                        onChange={(e) => updateLimits('par', parseInt(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        min="0"
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other Games */}
          {renderGameSection('Sexy (RBF)', 'sexy', [
            { key: 'profile', label: 'Profile', type: 'number', min: 1, max: 10 }
          ])}

          {renderGameSection('SA (RAR)', 'sa', [
            { key: 'commissionRAR', label: 'Commission RAR (%)', type: 'number', min: 0, max: 100 },
            { key: 'profile', label: 'Profile', type: 'number', min: 1, max: 10 }
          ])}

          {renderGameSection('Slot ITP (RAS)', 'slotItp', [])}
          {renderGameSection('Slot JOKER (RAU)', 'slotJoker', [])}
          {renderGameSection('Slot PLAYSTAR (RBL)', 'slotPlaystar', [])}

          {renderGameSection('Cockfight (RBG)', 'cockfight', [
            { key: 'commissionRBG', label: 'Commission RBG (%)', type: 'number', min: 0, max: 100 }
          ])}

          {renderGameSection('Muay Step (RBM)', 'muayStep', [])}
          {renderGameSection('Virtual Sports (RBO)', 'virtualSports', [])}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-between w-full">
          <div>
            {mode === 'edit' && (
              <Button
                onClick={handleDelete}
                disabled={submitting}
                className="inline-flex items-center px-3 py-2 rounded text-sm bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ReactIconComponent icon="FaTrash" setClass="w-4 h-4 mr-1" />
                ลบ
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={onClose}
              disabled={submitting}
              className="inline-flex items-center px-3 py-2 rounded text-sm bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'view' ? 'ปิด' : 'ยกเลิก'}
            </Button>
            {mode !== 'view' && (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center px-3 py-2 rounded text-sm bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <ReactIconComponent icon="FaSave" setClass="w-4 h-4 mr-1" />
                    {mode === 'create' ? 'สร้าง' : 'บันทึก'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalAdJustBet;