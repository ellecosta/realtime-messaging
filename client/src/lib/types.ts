export interface User { id: string; email: string; username: string }
export interface Server { id: string; name: string; createdAt: string }
export interface Channel {
  id: string; serverId: string; name: string; isDefault: boolean; createdAt: string
}
export interface Message {
  id: string
  channelId: string
  authorId: string
  username: string
  content: string
  createdAt: string
  serverId?: string   
  tempId?: string     
  pending?: boolean   
}
export interface ApiError { code: string; message: string }