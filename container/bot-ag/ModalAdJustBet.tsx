import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { AdjustBet, AdjustBetFormData, AdjustBetData, AgUserAccount } from '@/types/adjustBet';
import toast from 'react-hot-toast';

/* =========================
 * DEFAULTS ต่อ section
 * ========================= */
const DEFAULTS = {
  sportsbook: {
    work: false,
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
      maxOS: 10,
      matchLimitOS: 10,
    },
  },
  sexy: { enabled: false, work: false, profile: 1 },
  sa: { enabled: false, work: false, commissionRAR: 0, profile: 1 },
  slotItp: { enabled: false, work: false },
  slotJoker: { enabled: false, work: false },
  slotPlaystar: { enabled: false, work: false },
  lottoRCW: { enabled: false, work: false },
  lottoRDC: { enabled: false, work: false },
  cockfight: { enabled: false, work: false, profile: 1 },
  muayStep: { enabled: false, work: false, profile: 1 },
  virtualSports: { enabled: false, work: false, profile: 1 },
} as const;

type SectionKey = keyof typeof DEFAULTS;

function makeResetSection(
  setFormData: React.Dispatch<React.SetStateAction<AdjustBetFormData>>
) {
  return (gameKey: SectionKey) => {
    setFormData(prev => ({
      ...prev,
      [gameKey]: { ...(DEFAULTS[gameKey] as any), work: false },
    }));
  };
}

interface ModalAdJustBetProps {
  data?: AdjustBet;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit' | 'view';
}

type FieldDef = {
  key: string;
  label: string;
  type: 'boolean' | 'number' | 'profile';
  min?: number;
  max?: number;
};

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
    sportsbook: { ...DEFAULTS.sportsbook },
    sexy: { ...DEFAULTS.sexy },
    sa: { ...DEFAULTS.sa },
    slotItp: { ...DEFAULTS.slotItp },
    slotJoker: { ...DEFAULTS.slotJoker },
    slotPlaystar: { ...DEFAULTS.slotPlaystar },
    lottoRCW: { ...DEFAULTS.lottoRCW },
    lottoRDC: { ...DEFAULTS.lottoRDC },
    cockfight: { ...DEFAULTS.cockfight },
    muayStep: { ...DEFAULTS.muayStep },
    virtualSports: { ...DEFAULTS.virtualSports },
  });

  const resetSection = makeResetSection(setFormData);

  const PROFILE_OPTIONS: Record<string, { value: number; label: string }[]> = {
    sexy: [
      { value: 1, label: 'A • 20–500' },
      { value: 2, label: 'B • 100–10,000' },
      { value: 3, label: 'C • 200–25,000' },
      { value: 4, label: 'D • 500–50,000' },
      { value: 5, label: 'E • 500–200,000' },
    ],
    sa: [
      { value: 1, label: 'A • 20 / 1,000 / 100,000' },
      { value: 2, label: 'B • 50 / 5,000 / 200,000' },
      { value: 3, label: 'C • 100 / 10,000 / 400,000' },
      { value: 4, label: 'D • 300 / 30,000 / 600,000' },
      { value: 5, label: 'E • 500 / 50,000 / 1,000,000' },
      { value: 6, label: 'F • 10,000 / 200,000 / 2,000,000' },
    ],
    cockfight: [
      { value: 1, label: 'A • 20 / 2,500' },
      { value: 2, label: 'B • 100 / 5,000' },
      { value: 3, label: 'C • 200 / 10,000' },
      { value: 4, label: 'D • 300 / 15,000' },
      { value: 5, label: 'E • 500 / 25,000' },
    ],
    muayStep: [
      { value: 1, label: 'A • 10 / 5,000 / 10,000' },
      { value: 2, label: 'B • 20 / 10,000 / 20,000' },
      { value: 3, label: 'C • 30 / 15,000 / 30,000' },
      { value: 4, label: 'D • 40 / 20,000 / 40,000' },
      { value: 5, label: 'E • 50 / 30,000 / 50,000' },
    ],
    virtualSports: [
      { value: 1, label: 'A • 10 / 5,000 / 25,000' },
      { value: 2, label: 'B • 20 / 10,000 / 50,000' },
    ],
  };

  const getProfileOptions = (gameKey: keyof AdjustBetFormData) =>
    PROFILE_OPTIONS[String(gameKey)] ?? [];

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

  const saveCustomerAgent = async (customerId: string, agentId: string) => {
    try {
      await axios.post('/api/customer-agent', {
        customerId,
        agentId,
        note: `Auto-created from ModalAdJustBet for customer ${customerId}`
      });
    } catch (error) {
      console.error('Failed to save customer-agent mapping:', error);
    }
  };

  // Load AG User Accounts / reset state on close
  useEffect(() => {
    if (isOpen) {
      loadAgUserAccounts();
    } else {
      setFormData({
        name: '',
        description: '',
        customer: '',
        usernameAG: '',
        agBaseUrl: 'https://ag.ufabet.com',
        pinUsed: '',
        sportsbook: { ...DEFAULTS.sportsbook },
        sexy: { ...DEFAULTS.sexy },
        sa: { ...DEFAULTS.sa },
        slotItp: { ...DEFAULTS.slotItp },
        slotJoker: { ...DEFAULTS.slotJoker },
        slotPlaystar: { ...DEFAULTS.slotPlaystar },
        lottoRCW: { ...DEFAULTS.lottoRCW },
        lottoRDC: { ...DEFAULTS.lottoRDC },
        cockfight: { ...DEFAULTS.cockfight },
        muayStep: { ...DEFAULTS.muayStep },
        virtualSports: { ...DEFAULTS.virtualSports },
      });
    }
  }, [isOpen]);

  useEffect(() => {
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
        lottoRCW: data.data.lottoRCW,
        lottoRDC: data.data.lottoRDC,
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
        sportsbook: { ...DEFAULTS.sportsbook },
        sexy: { ...DEFAULTS.sexy },
        sa: { ...DEFAULTS.sa },
        lottoRCW: { ...DEFAULTS.lottoRCW },
        lottoRDC: { ...DEFAULTS.lottoRDC },
        slotItp: { ...DEFAULTS.slotItp },
        slotJoker: { ...DEFAULTS.slotJoker },
        slotPlaystar: { ...DEFAULTS.slotPlaystar },
        cockfight: { ...DEFAULTS.cockfight },
        muayStep: { ...DEFAULTS.muayStep },
        virtualSports: { ...DEFAULTS.virtualSports },
      });

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

  const hasAnyWork = (fd: AdjustBetFormData) => {
    const sections: (keyof AdjustBetFormData)[] = [
      'sportsbook',
      'sexy',
      'sa',
      'slotItp',
      'slotJoker',
      'slotPlaystar',
      'lottoRCW',
      'lottoRDC',
      'cockfight',
      'muayStep',
      'virtualSports',
    ];
    return sections.some((k) => (fd as any)?.[k]?.work === true);
  };

  const handleSubmit = async () => {
    if (!formData.customer.trim()) {
      toast.error('กรุณากรอกรหัสลูกค้า');
      return;
    }
    if (!selectedAgUser) {
      toast.error('กรุณาเลือก AG User');
      return;
    }
  
    // ✅ บล็อกการบันทึก ถ้าไม่มี section ไหนทำรายการเลย
    if (!hasAnyWork(formData)) {
      toast.error('กรุณาเลือกทำรายการอย่างน้อย 1 รายการ (เช่น เปิดเกม/เปลี่ยนโปรไฟล์/แก้ limits)');
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
        lottoRCW: { ...formData.lottoRCW },
        lottoRDC: { ...formData.lottoRDC },
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
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Adjust Bet นี้?')) return;

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
      setAutoSelectedAgent(false);
      loadCustomerAgent(value.trim());
    }
  };

  /**
   * อัปเดตฟิลด์ภายในแต่ละ section
   * เงื่อนไขตามข้อกำหนด:
   * - เมื่อมีการทำงานใน fields (number/profile/boolean ที่อยู่ใน fields ของ renderGameSection)
   *   ให้ตั้ง work=true และ enabled=true อัตโนมัติ (ถือว่าเปิดเกม)
   * - ถ้า field === 'enabled' จะตั้งค่าตามที่ผู้ใช้กด แต่ยังถือว่า work=true
   */
  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const currentGameData = prev[parent as keyof AdjustBetFormData] as any;
      const newGameData: any = {
        ...currentGameData,
        [field]: value,
        work: true,
      };

      // ถ้ามีแก้ไข "fields" ใดๆ ที่ไม่ใช่ปุ่มเปิด/ปิด ให้บังคับ enabled=true
      if (field !== 'enabled') {
        newGameData.enabled = true;
      }

      // ถ้ามีการเปลี่ยนโปรไฟล์ ก็ตีความว่าเปิดใช้งานอยู่แล้ว
      // (จริงๆ ถูกครอบคลุมโดย if(field!=='enabled') แล้ว)
      return {
        ...prev,
        [parent]: newGameData
      };
    });
  };

  // อัปเดต limits ของ sportsbook -> work=true และ enabled=true
  const updateLimits = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      sportsbook: {
        ...prev.sportsbook,
        work: true,
        // เมื่อผู้ใช้แก้ไข limits ให้ถือว่าเปิดเกม
        ...(prev.sportsbook as any),
        enabled: true as any,
        limits: {
          ...prev.sportsbook.limits,
          [field]: value
        }
      } as any
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
    setAutoSelectedAgent(false); // manual

    if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        name: `${agUser.username} - Adjust Bet`,
        description: `การตั้งค่าปรับเบทสำหรับ ${agUser.username} (${prev.customer || agUser.userLogin})`
      }));

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
    fields: FieldDef[]
  ) => {
    const game = formData[gameKey] as any;

    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            {game?.work && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                ทำรายการ
              </span>
            )}
          </div>
          <button
            onClick={() => resetSection(gameKey as SectionKey)}
            className={`flex items-center ml-auto px-2 py-0.5 ${game?.work ? `bg-red-100 text-red-800` : 'hidden'
              } text-xs rounded-full`}
          >
            <ReactIconComponent icon="FaTimes" setClass="w-3 h-3 mr-2" />
            ยกเลิกทำรายการ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {field.label}
              </label>

              {field.type === 'boolean' && (
                <input
                  type="checkbox"
                  checked={!!game[field.key]}
                  onChange={(e) =>
                    updateNestedFormData(gameKey as string, field.key, e.target.checked)
                  }
                  disabled={mode === 'view'}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              )}

              {field.type === 'number' && (
                <input
                  type="number"
                  value={Number(game?.[field.key] ?? 0)}
                  onChange={(e) =>
                    updateNestedFormData(
                      gameKey as string,
                      field.key,
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={mode === 'view'}
                  min={field.min}
                  max={field.max}
                  className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              {field.type === 'profile' && (
                <select
                  value={Number(game?.[field.key] ?? 1)}
                  onChange={(e) =>
                    updateNestedFormData(
                      gameKey as string,
                      field.key,
                      Number.parseInt(e.target.value, 10) || 1
                    )
                  }
                  disabled={mode === 'view'}
                  className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {getProfileOptions(gameKey).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* สวิตช์เปิด/ปิด เกม */}
          <div >
            <label className="block text-xs font-medium text-gray-700 mb-1">
              เปิด/ปิด เกม
            </label>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={!!game?.enabled}
                  onChange={(e) => updateNestedFormData(gameKey as string, 'enabled', e.target.checked)}
                  disabled={mode === 'view'}
                  className="sr-only"
                />
                <div
                  className={`block w-10 h-6 rounded-full transition-colors duration-300 ${game?.enabled ? 'bg-blue-500' : 'bg-gray-300'
                    } ${mode === 'view' ? 'opacity-50' : ''}`}
                />
                <div
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${game?.enabled ? 'translate-x-4' : ''
                    }`}
                />
              </div>
              <span
                className={`ml-3 text-sm font-medium ${game?.enabled ? 'text-blue-700' : 'text-gray-500'
                  }`}
              >
                {game?.enabled ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>
        </div>
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
                    className={`w-full rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 ${autoSelectedAgent
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
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      sportsbook: { ...prev.sportsbook, work: !prev.sportsbook.work }
                    }))
                  }
                  className={`ml-auto px-2 py-0.5 ${formData.sportsbook.work ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                    } text-xs rounded-full`}
                >
                  {formData.sportsbook.work ? (
                    <span className="flex items-center">
                      คลิกไม่ทำรายการ <ReactIconComponent icon="FaTimes" setClass="w-3 h-3 ml-2" />
                    </span>
                  ) : (
                    <span className="flex items-center">
                      คลิกทำรายการ <ReactIconComponent icon="FaChevronDown" setClass="w-3 h-3 ml-2" />
                    </span>
                  )}
                </button>

                {formData.sportsbook.work && (
                  <button
                    onClick={() => resetSection('sportsbook')}
                    className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full"
                    title="รีเซ็ต Sportsbook เป็นค่าเริ่มต้น"
                  >
                    รีเซ็ตค่าเริ่มต้น
                  </button>
                )}
              </div>
            </div>

            {formData.sportsbook.work ? (
              <div className="space-y-4">
                {/* Limits */}
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">ขีดจำกัด</h5>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Trans Limit</label>
                      <input
                        type="number"
                        value={formData.sportsbook.limits.transLimit}
                        onChange={(e) => updateLimits('transLimit', parseInt(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        min={0}
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
                        min={0}
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
                        min={0}
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
                        min={0}
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
                        min={0}
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
                        min={0}
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">MaxOther</label>
                      <input
                        type="number"
                        value={formData.sportsbook.limits.maxOther}
                        onChange={(e) => updateLimits('maxOther', parseInt(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        min={0}
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">MatchLimitOther</label>
                      <input
                        type="number"
                        value={formData.sportsbook.limits.matchLimitOther}
                        onChange={(e) => updateLimits('matchLimitOther', parseInt(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        min={0}
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                คลิกทำรายการเพื่อดูข้อมูล
              </div>
            )}
          </div>

          {/* Live Casino */}
          {renderGameSection('Sexy (RBF)', 'sexy', [
            { key: 'profile', label: 'โปรไฟล์', type: 'profile' },
          ])}
          {renderGameSection('SA (RAR)', 'sa', [
            { key: 'profile', label: 'โปรไฟล์', type: 'profile' },
          ])}
          {/* Slot */}
          {renderGameSection('Slot ITP (RAS)', 'slotItp', [])}
          {renderGameSection('Slot JOKER (RAU)', 'slotJoker', [])}
          {renderGameSection('Slot PLAYSTAR (RBL)', 'slotPlaystar', [])}
          {/* Lotto */}
          {renderGameSection('Lotto (RCW)', 'lottoRCW', [])}
          {renderGameSection('Lotto (RDC)', 'lottoRDC', [])}
          {/* Other */}
          {renderGameSection('Cockfight (RBG)', 'cockfight', [
            { key: 'profile', label: 'โปรไฟล์', type: 'profile' },
          ])}
          {renderGameSection('Muay Step (RBM)', 'muayStep', [
            { key: 'profile', label: 'โปรไฟล์', type: 'profile' },
          ])}
          {renderGameSection('Virtual Sports (RBO)', 'virtualSports', [
            { key: 'profile', label: 'โปรไฟล์', type: 'profile' },
          ])}
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
