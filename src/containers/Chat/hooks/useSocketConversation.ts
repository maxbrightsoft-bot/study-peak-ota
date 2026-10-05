import { useEffect, useRef } from 'react'
import useAuthStore from '@/store/useAuthStore'
import { EventsMap } from '@/utils/types'
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
  const academyDomain: string | undefined = user?.academyDomain
  const eventsRef = useRef(conversationEvents)
  eventsRef.current = conversationEvents

  // Register event listeners on socket once
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleEvent = (eventName: string) => (data: any) => {
      console.log(`[Socket] Received event [${eventName}]:`, typeof data === 'string' ? data.slice(0, 100) : data)
      eventsRef.current?.[eventName]?.(data)
    }

    const eventNames = [
      'new-message-event',
      'completed-conversation-event',
      'delete-message-event',
      'update-message-event'
    ]

    const handlers: Record<string, (data: any) => void> = {}
    eventNames.forEach(name => {
      handlers[name] = handleEvent(name)
      socket.on(name, handlers[name])
    })

    return () => {
      eventNames.forEach(name => {
        socket.off(name, handlers[name])
      })
    }
  }, [])

  // Subscribe to the presence channel of the active conversation
  useEffect(() => {
    if (!academyDomain || !selectedConversation?.id) return

    const socket = getSocket()
    const normalizedDomain = academyDomain.trim().toUpperCase()
    const conversationChannel = `presence-conversation-channel-${selectedConversation.id}-${normalizedDomain}`

    const subscribeChannel = () => {
      console.log('[Socket] Subscribing to channel:', conversationChannel, 'socket.id:', socket?.id, 'connected:', socket?.connected)
      socket?.emit('subscribe', conversationChannel)
    }

    if (socket?.connected) {
      subscribeChannel()
    } else {
      console.log('[Socket] Socket not connected yet, waiting for connect event to subscribe:', conversationChannel)
    }

    socket?.on('connect', subscribeChannel)

    return () => {
      console.log('[Socket] Unsubscribing from channel:', conversationChannel)
      socket?.off('connect', subscribeChannel)
      if (socket?.connected) {
        socket?.emit('unsubscribe', conversationChannel)
      }
    }
  }, [selectedConversation?.id, academyDomain])

  return {}
}

export default useSocketConversation
