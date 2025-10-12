/**
 * WebSocket Event Types and Interfaces for Real-time Chat
 */

// Socket Event Names
export enum SocketEvent {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  
  // User presence events
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  USER_TYPING = 'user:typing',
  USER_STOP_TYPING = 'user:stop_typing',
  
  // Conversation events
  CONVERSATION_NEW = 'conversation:new',
  CONVERSATION_UPDATED = 'conversation:updated',
  CONVERSATION_DELETED = 'conversation:deleted',
  CONVERSATION_ASSIGNED = 'conversation:assigned',
  
  // Message events
  MESSAGE_NEW = 'message:new',
  MESSAGE_UPDATED = 'message:updated',
  MESSAGE_DELETED = 'message:deleted',
  MESSAGE_READ = 'message:read',
  
  // Customer events
  CUSTOMER_UPDATED = 'customer:updated',
  
  // Agent events
  AGENT_JOIN_ROOM = 'agent:join_room',
  AGENT_LEAVE_ROOM = 'agent:leave_room',
  
  // System events
  NOTIFICATION = 'notification',
}

// Room naming conventions
export const getRoomName = {
  conversation: (conversationId: string) => `conversation:${conversationId}`,
  agent: (agentId: string) => `agent:${agentId}`,
  allAgents: () => 'agents:all',
  customer: (customerId: string) => `customer:${customerId}`,
}

// Event Payload Interfaces
export interface UserOnlinePayload {
  userId: string
  userType: 'agent' | 'customer'
  timestamp: Date
}

export interface UserOfflinePayload {
  userId: string
  userType: 'agent' | 'customer'
  timestamp: Date
}

export interface UserTypingPayload {
  conversationId: string
  userId: string
  userName: string
  userType: 'agent' | 'customer'
  timestamp: Date
}

export interface ConversationPayload {
  conversationId: string
  conversation: any // Full conversation object
  timestamp: Date
}

export interface ConversationAssignedPayload {
  conversationId: string
  assignedToId: string | null
  assignedToName?: string
  assignedBy: string
  timestamp: Date
}

export interface MessagePayload {
  conversationId: string
  message: any // Full message object
  timestamp: Date
}

export interface MessageReadPayload {
  conversationId: string
  messageIds?: string[]
  readBy: string
  readByType: 'agent' | 'customer'
  timestamp: Date
}

export interface CustomerUpdatedPayload {
  customerId: string
  customer: any
  timestamp: Date
}

export interface NotificationPayload {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  data?: any
  timestamp: Date
}

// Socket Client to Server Events
export interface ClientToServerEvents {
  [SocketEvent.AGENT_JOIN_ROOM]: (roomName: string) => void
  [SocketEvent.AGENT_LEAVE_ROOM]: (roomName: string) => void
  [SocketEvent.USER_TYPING]: (payload: UserTypingPayload) => void
  [SocketEvent.USER_STOP_TYPING]: (payload: Omit<UserTypingPayload, 'timestamp'>) => void
}

// Socket Server to Client Events
export interface ServerToClientEvents {
  [SocketEvent.USER_ONLINE]: (payload: UserOnlinePayload) => void
  [SocketEvent.USER_OFFLINE]: (payload: UserOfflinePayload) => void
  [SocketEvent.USER_TYPING]: (payload: UserTypingPayload) => void
  [SocketEvent.USER_STOP_TYPING]: (payload: UserTypingPayload) => void
  
  [SocketEvent.CONVERSATION_NEW]: (payload: ConversationPayload) => void
  [SocketEvent.CONVERSATION_UPDATED]: (payload: ConversationPayload) => void
  [SocketEvent.CONVERSATION_DELETED]: (payload: { conversationId: string; timestamp: Date }) => void
  [SocketEvent.CONVERSATION_ASSIGNED]: (payload: ConversationAssignedPayload) => void
  
  [SocketEvent.MESSAGE_NEW]: (payload: MessagePayload) => void
  [SocketEvent.MESSAGE_UPDATED]: (payload: MessagePayload) => void
  [SocketEvent.MESSAGE_DELETED]: (payload: { conversationId: string; messageId: string; timestamp: Date }) => void
  [SocketEvent.MESSAGE_READ]: (payload: MessageReadPayload) => void
  
  [SocketEvent.CUSTOMER_UPDATED]: (payload: CustomerUpdatedPayload) => void
  
  [SocketEvent.NOTIFICATION]: (payload: NotificationPayload) => void
}

// Socket Data stored per connection
export interface SocketData {
  userId?: string
  userType?: 'agent' | 'customer'
  username?: string
}

