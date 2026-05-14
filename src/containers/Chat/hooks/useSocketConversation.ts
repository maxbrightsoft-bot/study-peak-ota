import { useEffect } from 'react'
import useAuthStore from '@/store/useAuthStore'
import { EventsMap } from '@/utils/types'
import { Role } from '@/utils/enums'
import { getSocket } from '@/services'

type Props = {
  selectedConversation?: any
  conversationEvents: EventsMap
}

const useSocketConversation = ({
  selectedConversation,
  conversationEvents
}: Props) => {
  const user = useAuthStore(state => state.user)
  const socket = getSocket()

  const roles = user?.roles
  const academyDomain: string | undefined = user?.academyDomain
  const isStudent = roles?.includes(Role.Student)

  const registerEvents = (eventsObj: EventsMap) => {
    Object.entries(eventsObj).forEach(([event, handler]) => {
      socket?.on(event, handler)
    })
  }

  const unregisterEvents = (eventsObj: EventsMap) => {
    Object.entries(eventsObj).forEach(([event, handler]) => {
      socket?.off(event, handler)
    })
  }

  useEffect(() => {
    if (!academyDomain || !user?.id) return

    const normalizedDomain = academyDomain.trim().toUpperCase()

    let conversationChannel: string | null = null
    let roleChannel: string | null = null
    let userChannel: string | null = null

    if (selectedConversation?.id) {
      conversationChannel = `presence-conversation-channel-${selectedConversation.id}-${normalizedDomain}`
    }

    roleChannel = `conversations-channel-Student-${normalizedDomain}`

    userChannel = `conversations-channel-${user.id}-${normalizedDomain}`

    conversationChannel && socket?.send('subscribe', { channel: conversationChannel })
    roleChannel && socket?.send('subscribe', { channel: roleChannel })
    userChannel && socket?.send('subscribe', { channel: userChannel })

    registerEvents(conversationEvents)

    return () => {
      conversationChannel && socket?.send('unsubscribe', { channel: conversationChannel })
      roleChannel && socket?.send('unsubscribe', { channel: roleChannel })
      userChannel && socket?.send('unsubscribe', { channel: userChannel })
      unregisterEvents(conversationEvents)
    }
  }, [
    selectedConversation?.id,
    academyDomain,
    user?.id,
    isStudent
  ])

  return {}
}

export default useSocketConversation
