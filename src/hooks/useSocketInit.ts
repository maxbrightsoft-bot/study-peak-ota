import { useEffect } from 'react'
import { getAccessToken, getAcademyDomain, getLearningSpace } from '@/utils/helpers'
import { getSocket, initSocket } from '@/services'
import useAuthStore from '@/store/useAuthStore'

export const useSocketInit = () => {
  const { user } = useAuthStore()

  useEffect(() => {
    const startSocket = async () => {
      const socket = await initSocket()

      const token = await getAccessToken()
      const academyDomain = await getAcademyDomain()
      const isLearningSpace = await getLearningSpace()

      socket.auth = {
        token,
        academyDomain,
        super: `${!isLearningSpace && !academyDomain}`
      }

      if (!socket.connected) {
        socket.connect()
      }

      socket.on('connect', () => {
        console.log('SOCKET CONNECTED', socket.id)
      })

      socket.on('connect_error', (err) => {
        console.log('CONNECT ERROR', err.message)
      })
    }

    startSocket()

    return () => {
      const socket = getSocket()
      if (socket) {
        socket.off('connect')
        socket.off('connect_error')
        // We might not want to fully disconnect here if the hook re-runs frequently,
        // but since it's at root and depends on user.id, it should be fine.
        socket.disconnect()
      }
    }
  }, [user?.id, user?.academyDomain])
}
