import { TheLayout } from '@/components/TheLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { qk } from '@/lib/queryKeys'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import ReactIconComponent from '@/components/ReactIconComponent'
import toast from 'react-hot-toast'
import PageHeader from '@/components/PageHeader'

type ChatCustomer = {
  id: string
  name: string
  phone?: string
  email?: string
  lastMessage?: string
  lastMessageAt?: Date
  unreadCount?: number
  status: 'active' | 'pending' | 'closed'
  assignedTo?: string
  tags?: string[]
}

type ChatMessage = {
  id: string
  conversationId: string
  content: string
  senderId: string
  senderType: 'customer' | 'agent'
  createdAt: Date
  attachments?: string[]
}

export default function AgentInboxPage() {
  const queryClient = useQueryClient()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'closed'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery<ChatCustomer[]>({
    queryKey: qk.chat.conversations(searchKeyword, filterStatus),
    queryFn: async () => {
      const res = await axios.get('/api/chat/conversations', {
        params: { keyword: searchKeyword, status: filterStatus !== 'all' ? filterStatus : undefined }
      })
      if (!res.data?.success) throw new Error(res.data?.error || 'โหลดข้อมูลล้มเหลว')
      return res.data.data || []
    },
    staleTime: 10 * 1000,
  })

  // Fetch messages for selected conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<ChatMessage[]>({
    queryKey: qk.chat.messages(selectedConversation || ''),
    queryFn: async () => {
      if (!selectedConversation) return []
      const res = await axios.get('/api/chat/messages', {
        params: { conversationId: selectedConversation }
      })
      if (!res.data?.success) throw new Error(res.data?.error || 'โหลดข้อความล้มเหลว')
      return res.data.data || []
    },
    enabled: !!selectedConversation,
    staleTime: 5 * 1000,
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { conversationId: string; content: string }) => {
      const res = await axios.post('/api/chat/messages', payload)
      if (!res.data?.success) throw new Error(res.data?.error || 'ส่งข้อความไม่สำเร็จ')
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.chat.messages(selectedConversation || '') })
      queryClient.invalidateQueries({ queryKey: qk.chat.conversations(searchKeyword, filterStatus) })
      setMessageInput('')
      toast.success('ส่งข้อความสำเร็จ')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'เกิดข้อผิดพลาด')
    },
  })

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageInput.trim(),
    })
  }

  const selectedConversationData = conversations?.find(c => c.id === selectedConversation)

  return (
    <TheLayout>
      <PageHeader
        title="Agent Inbox"
        icon='FaInbox'
        description="กล่องข้อความสำหรับเจ้าหน้าที่"
        gradient={true}
      />

      <div className="py-2">
        <div className="h-[calc(100vh-200px)] flex gap-4">
          {/* Conversation List - Left Sidebar */}
          <div className="w-80 flex flex-col bg-white/90 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur">
            {/* Search & Filter */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="ค้นหาลูกค้า..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent shadow-sm mb-3"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-[#A78BFA] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    filterStatus === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  กำลังสนทนา
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    filterStatus === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  รอดำเนินการ
                </button>
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <ReactIconComponent icon="FaSpinner" setClass="w-6 h-6 animate-spin" />
                </div>
              ) : conversations && conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                      selectedConversation === conv.id
                        ? 'bg-[#A78BFA]/10 border-l-4 border-l-[#A78BFA]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#34D399] flex items-center justify-center text-white font-semibold">
                          {conv.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{conv.name}</h3>
                          <p className="text-xs text-gray-500">{conv.phone || conv.email}</p>
                        </div>
                      </div>
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage || 'ไม่มีข้อความ'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        conv.status === 'active' ? 'bg-green-100 text-green-700' :
                        conv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {conv.status === 'active' ? 'กำลังสนทนา' :
                         conv.status === 'pending' ? 'รอดำเนินการ' : 'ปิดแล้ว'}
                      </span>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(conv.lastMessageAt).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  ไม่พบการสนทนา
                </div>
              )}
            </div>
          </div>

          {/* Chat Area - Main Content */}
          <div className="flex-1 flex flex-col bg-white/90 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#A78BFA]/10 to-[#34D399]/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#34D399] flex items-center justify-center text-white font-semibold">
                        {selectedConversationData?.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">{selectedConversationData?.name}</h2>
                        <p className="text-sm text-gray-500">
                          {selectedConversationData?.phone || selectedConversationData?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full px-3"
                      >
                        <ReactIconComponent icon="FaEllipsisV" setClass="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <ReactIconComponent icon="FaSpinner" setClass="w-6 h-6 animate-spin" />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            msg.senderType === 'agent'
                              ? 'bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.senderType === 'agent' ? 'text-white/70' : 'text-gray-500'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      ยังไม่มีข้อความในการสนทนานี้
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex items-end gap-2">
                    <Button
                      size="xs"
                      className="!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-100 rounded-full p-2"
                    >
                      <ReactIconComponent icon="FaPaperclip" setClass="w-5 h-5" />
                    </Button>
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="พิมพ์ข้อความ... (Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่)"
                      className="flex-1 px-4 py-2 text-sm rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent shadow-sm resize-none"
                      rows={2}
                    />
                    <Button
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      onClick={handleSendMessage}
                      className="!bg-gradient-to-r !from-[#A78BFA] !to-[#34D399] !text-white hover:opacity-90 rounded-full px-4 disabled:opacity-60"
                    >
                      {sendMessageMutation.isPending ? (
                        <ReactIconComponent icon="FaSpinner" setClass="w-5 h-5 animate-spin" />
                      ) : (
                        <ReactIconComponent icon="FaPaperPlane" setClass="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <ReactIconComponent icon="FaComments" setClass="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">เลือกการสนทนาเพื่อเริ่มต้น</p>
                  <p className="text-sm mt-2">คลิกที่การสนทนาทางซ้ายเพื่อดูและตอบกลับข้อความ</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TheLayout>
  )
}
