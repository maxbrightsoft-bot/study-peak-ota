import { io, Socket } from 'socket.io-client'
import { SOCKET_URL } from '@/utils/constants'

let socket: Socket | null = null

export const createSocket = () => {
  return io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  })
}

export const initSocket = async () => {
  if (!socket) {
    socket = createSocket()
  }
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  socket?.disconnect()
  socket = null
}
