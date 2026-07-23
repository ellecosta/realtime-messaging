import { io, Socket } from 'socket.io-client'
import { getToken } from './tokenStorage'
let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io({                      
      autoConnect: false,
      auth: (cb) => cb({ token: getToken() ?? '' }), 
    })
  }
  return socket
}
export function connectSocket() { getSocket().connect() }
export function disconnectSocket() { socket?.disconnect() }