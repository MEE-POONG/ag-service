/**
 * Widget Keys Management Page
 * สำหรับจัดการ Widget Keys ที่ให้เว็บอื่นใช้งาน chat widget
 */

import { TheLayout } from '@/components/TheLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { qk } from '@/lib/queryKeys'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ReactIconComponent from '@/components/ReactIconComponent'
import toast from 'react-hot-toast'
import PageHeader from '@/components/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useHeadSupport } from '@/hooks/useHeadSupport'
import Page404 from '@/components/Page404'

interface WidgetKey {
  id: string
  name: string
  key: string
  domain: string
  description?: string
  isActive: boolean
  settings: {
    primaryColor: string
    accentColor: string
    headerTitle: string
    headerSubtitle: string
    welcomeMessage: string
    placeholderText: string
    position: string
    autoOpen: boolean
    showAgentAvatar: boolean
    showTimestamp: boolean
    enableFileUpload: boolean
    enableEmoji: boolean
  }
  usage: {
    totalConversations: number
    totalMessages: number
    lastUsedAt?: Date
  }
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export default function WidgetKeysPage() {
  const hs = useHeadSupport(); // ใช้ path ปัจจุบัน
  const queryClient = useQueryClient()
  const { user, userLoading } = useAuth()

  // ตรวจสอบว่าเป็น dev user หรือไม่
  const isDevUser = user?.username === "superadmin" ||
                    user?.username === "admin" ||
                    user?.adminPosition?.adminDepartment?.name === "IT Department";

  // ถ้าไม่มีสิทธิ์เข้าถึง ให้แสดง 404
  const isAllowed = hs.ok || isDevUser;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<WidgetKey | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '',
    settings: {
      primaryColor: '#3B82F6',
      accentColor: '#10B981',
      headerTitle: 'Chat with us',
      headerSubtitle: "We're here to help",
      welcomeMessage: 'Hello! How can we help you today?',
      placeholderText: 'Type a message...',
      position: 'bottom-right',
      autoOpen: false,
      showAgentAvatar: true,
      showTimestamp: true,
      enableFileUpload: true,
      enableEmoji: true
    }
  })

  // Fetch widget keys
  const { data: widgetKeys, isLoading } = useQuery<WidgetKey[]>({
    queryKey: ['widget-keys'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/widget-keys')
      if (!res.data?.success) throw new Error(res.data?.error || 'โหลดข้อมูลล้มเหลว')
      return res.data.data || []
    },
    staleTime: 30 * 1000,
  })

  // Create widget key mutation
  const createKeyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await axios.post('/api/admin/widget-keys', data)
      if (!res.data?.success) throw new Error(res.data?.error || 'สร้าง Widget Key ไม่สำเร็จ')
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-keys'] })
      setIsCreateDialogOpen(false)
      resetForm()
      toast.success('สร้าง Widget Key สำเร็จ')
    },
    onError: (error: any) => {
      toast.error(error.message || 'สร้าง Widget Key ไม่สำเร็จ')
    }
  })

  // Update widget key mutation
  const updateKeyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WidgetKey> }) => {
      const res = await axios.put(`/api/admin/widget-keys/${id}`, data)
      if (!res.data?.success) throw new Error(res.data?.error || 'อัปเดต Widget Key ไม่สำเร็จ')
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-keys'] })
      setIsEditDialogOpen(false)
      setSelectedKey(null)
      resetForm()
      toast.success('อัปเดต Widget Key สำเร็จ')
    },
    onError: (error: any) => {
      toast.error(error.message || 'อัปเดต Widget Key ไม่สำเร็จ')
    }
  })

  // Delete widget key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete(`/api/admin/widget-keys/${id}`)
      if (!res.data?.success) throw new Error(res.data?.error || 'ลบ Widget Key ไม่สำเร็จ')
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-keys'] })
      toast.success('ลบ Widget Key สำเร็จ')
    },
    onError: (error: any) => {
      toast.error(error.message || 'ลบ Widget Key ไม่สำเร็จ')
    }
  })

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await axios.patch(`/api/admin/widget-keys/${id}/toggle`, { isActive })
      if (!res.data?.success) throw new Error(res.data?.error || 'เปลี่ยนสถานะไม่สำเร็จ')
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widget-keys'] })
      toast.success('เปลี่ยนสถานะสำเร็จ')
    },
    onError: (error: any) => {
      toast.error(error.message || 'เปลี่ยนสถานะไม่สำเร็จ')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      description: '',
      settings: {
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        headerTitle: 'Chat with us',
        headerSubtitle: "We're here to help",
        welcomeMessage: 'Hello! How can we help you today?',
        placeholderText: 'Type a message...',
        position: 'bottom-right',
        autoOpen: false,
        showAgentAvatar: true,
        showTimestamp: true,
        enableFileUpload: true,
        enableEmoji: true
      }
    })
  }

  const handleCreate = () => {
    createKeyMutation.mutate(formData)
  }

  const handleEdit = (key: WidgetKey) => {
    setSelectedKey(key)
    setFormData({
      name: key.name,
      domain: key.domain,
      description: key.description || '',
      settings: key.settings
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!selectedKey) return
    updateKeyMutation.mutate({
      id: selectedKey.id,
      data: formData
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบ Widget Key นี้?')) {
      deleteKeyMutation.mutate(id)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('คัดลอกไปยังคลิปบอร์ดแล้ว')
  }

  // รอให้ user โหลดเสร็จก่อนตรวจสอบสิทธิ์
  if (userLoading) {
    return (
      <TheLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
          </div>
        </div>
      </TheLayout>
    );
  }

  // ถ้าไม่มีสิทธิ์ ให้แสดง 404
  if (!isAllowed) {
    return (
      <Page404
        title="ไม่มีสิทธิ์เข้าถึง"
        message="คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ"
        backUrl="/"
      />
    );
  }

  return (
    <TheLayout>
      <PageHeader
        title="Widget Keys"
      />

      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Widget Keys</h2>
            <p className="text-sm text-gray-600">จัดการ Widget Keys สำหรับให้เว็บไซต์อื่นใช้งาน Chat Widget</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="!bg-gradient-to-r !from-[#A78BFA] !to-[#34D399] !text-white">
                <ReactIconComponent icon="FaPlus" setClass="w-4 h-4 mr-2" />
                สร้าง Widget Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>สร้าง Widget Key ใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">ชื่อ Widget Key</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="เช่น My Website Chat"
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Domain ที่อนุญาต</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="เช่น example.com หรือ localhost:3000"
                  />
                </div>
                <div>
                  <Label htmlFor="description">คำอธิบาย</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="คำอธิบายการใช้งาน..."
                    rows={3}
                  />
                </div>

                {/* Widget Settings */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">การตั้งค่า Widget</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">สีหลัก</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.settings.primaryColor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, primaryColor: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="accentColor">สีเสริม</Label>
                      <Input
                        id="accentColor"
                        type="color"
                        value={formData.settings.accentColor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, accentColor: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="headerTitle">หัวข้อ</Label>
                      <Input
                        id="headerTitle"
                        value={formData.settings.headerTitle}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, headerTitle: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="headerSubtitle">หัวข้อรอง</Label>
                      <Input
                        id="headerSubtitle"
                        value={formData.settings.headerSubtitle}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, headerSubtitle: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setIsCreateDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={createKeyMutation.isPending}
                    className="!bg-gradient-to-r !from-[#A78BFA] !to-[#34D399] !text-white"
                  >
                    {createKeyMutation.isPending ? (
                      <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin" />
                    ) : (
                      'สร้าง'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Widget Keys List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <ReactIconComponent icon="FaSpinner" setClass="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : widgetKeys && widgetKeys.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {widgetKeys.map((key) => (
                <div key={key.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{key.name}</h3>
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          key.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {key.isActive ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Domain:</span> {key.domain}
                        </div>
                        <div>
                          <span className="font-medium">Widget Key:</span>
                          <code className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                            {key.key}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(key.key)}
                            className="ml-2 h-6 px-2 text-xs"
                          >
                            <ReactIconComponent icon="FaCopy" setClass="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {key.description && (
                        <p className="text-sm text-gray-600 mb-3">{key.description}</p>
                      )}
                      <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">การสนทนา:</span> {key.usage.totalConversations}
                        </div>
                        <div>
                          <span className="font-medium">ข้อความ:</span> {key.usage.totalMessages}
                        </div>
                        <div>
                          <span className="font-medium">ใช้งานล่าสุด:</span> {
                            key.usage.lastUsedAt 
                              ? new Date(key.usage.lastUsedAt).toLocaleDateString('th-TH')
                              : 'ยังไม่เคยใช้'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={key.isActive}
                        onCheckedChange={(checked) => 
                          toggleActiveMutation.mutate({ id: key.id, isActive: checked })
                        }
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(key)}
                      >
                        <ReactIconComponent icon="FaEdit" setClass="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(key.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <ReactIconComponent icon="FaTrash" setClass="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ReactIconComponent icon="FaKey" setClass="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มี Widget Key</h3>
              <p className="text-gray-600 mb-4">สร้าง Widget Key แรกของคุณเพื่อเริ่มใช้งาน Chat Widget</p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="!bg-gradient-to-r !from-[#A78BFA] !to-[#34D399] !text-white"
              >
                <ReactIconComponent icon="FaPlus" setClass="w-4 h-4 mr-2" />
                สร้าง Widget Key
              </Button>
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <ReactIconComponent icon="FaInfoCircle" setClass="w-5 h-5 mr-2" />
            วิธีใช้งาน Widget Key
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>1. คัดลอก Widget Key</strong> ที่สร้างขึ้นไปใช้ในเว็บไซต์ของคุณ
            </div>
            <div>
              <strong>2. เพิ่มโค้ดในเว็บไซต์:</strong>
              <pre className="mt-2 p-3 bg-blue-100 rounded text-xs overflow-x-auto">
{`<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
<script src="https://meetanggroup.com/chat-widget.js"></script>
<script>
  AGChat.init({
    widgetKey: 'YOUR_WIDGET_KEY',
    apiUrl: 'https://meetanggroup.com'
  });
</script>`}
              </pre>
            </div>
            <div>
              <strong>3. Widget จะปรากฏ</strong> ที่มุมขวาล่างของเว็บไซต์
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไข Widget Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">ชื่อ Widget Key</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-domain">Domain ที่อนุญาต</Label>
              <Input
                id="edit-domain"
                value={formData.domain}
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">คำอธิบาย</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={updateKeyMutation.isPending}
                className="!bg-gradient-to-r !from-[#A78BFA] !to-[#34D399] !text-white"
              >
                {updateKeyMutation.isPending ? (
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin" />
                ) : (
                  'บันทึก'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TheLayout>
  )
}
