// Message Types
export interface IMessage {
  _id: string
  conversationId: string
  senderId: string
  text: string
  readBy: string[]
  messageType: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: Date
  updatedAt: Date
}

// Conversation Types
export interface IConversation {
  _id: string
  participants: string[]
  lastMessage?: string
  unreadCount: Map<string, number>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'fail'
  data?: T
  message?: string
  errors?: any[]
}

export interface PaginatedResponse<T> {
  data: T[]
  hasMore: boolean
  nextCursor?: string
}

// Request Types
export interface SendMessageRequest {
  conversationId: string
  text: string
}

export interface CreateConversationRequest {
  userId: string
}

export interface GetMessagesQuery {
  conversationId: string
  cursor?: string
  limit?: number
}

// DTO Types
export interface ConversationDTO {
  _id: string
  participant: {
    _id: string
    name: string
    username: string
    avatar?: string
    isOnline: boolean
    lastSeen?: Date
  }
  lastMessage?: {
    text: string
    createdAt: Date
    senderId: string
  }
  unreadCount: number
  lastActivity: Date
}

export interface MessageDTO {
  _id: string
  conversationId: string
  sender: {
    _id: string
    name: string
    username: string
    avatar?: string
  }
  text: string
  readBy: string[]
  createdAt: Date
}