import { useEffect } from 'react'
import { getAccessToken, getAcademyDomain, getLearningSpace } from '@/utils/helpers'
import { initSocket } from '@/services'
import useAuthStore from '@/store/useAuthStore'

export const useSocketInit = () => {
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    let socketInstance: any = null

    const handleConnect = () => {
      console.log('[SocketInit] SOCKET CONNECTED', socketInstance?.id)
    }

    const handleConnectError = (err: any) => {
      console.log('[SocketInit] CONNECT ERROR', err?.message)
    }

    const startSocket = async () => {
      const socket = await initSocket()
      socketInstance = socket

      const token = await getAccessToken()
      if (!token) {
        console.log('[SocketInit] No token found, skipping socket connect')
        return
      }

      const storeUser = useAuthStore.getState().user
      const storedAcademyDomain = await getAcademyDomain()
      const academyDomain = storeUser?.academyDomain || storedAcademyDomain || ''
      const isLearningSpace = storeUser?.isLearningSpace ?? (await getLearningSpace())

      socket.auth = {
        token,
        academyDomain,
        super: `${!isLearningSpace && !academyDomain}`
      }

      socket.off('connect', handleConnect)
      socket.off('connect_error', handleConnectError)
      socket.on('connect', handleConnect)
      socket.on('connect_error', handleConnectError)

      if (socket.connected) {
        socket.disconnect()
      }
      socket.connect()
    }

    startSocket()

    return () => {
      if (socketInstance) {
        socketInstance.off('connect', handleConnect)
        socketInstance.off('connect_error', handleConnectError)
      }
    }
  }, [user?.id, user?.academyDomain])
}
