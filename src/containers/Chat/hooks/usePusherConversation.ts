import useAuthStore from "@/store/useAuthStore"
import { ConversationResponse } from "@/utils/types"
import { PusherChannel } from "@pusher/pusher-websocket-react-native"
import { useEffect, useRef } from "react"
import { MESSAGE_CONVERSATION_EVENT, MESSAGE_CONVERSATION_READ_EVENT, MessageConversationEvents2 } from "../configs/constants"
const usePusherConversation = (onNewMessageConversation?: (data: ConversationResponse) => void, onReadMessageConversation?: (id: number, total: number) => void) => {
    const { user, pusher, subscribeChannel, unsubscribeChannelSafe } = useAuthStore()
    const channel = useRef<PusherChannel>()
    const channelName = useRef<string>()

    const userId = user?.id
    const academyDomain: string | undefined = user?.academyDomain

    const handleNewMessageConversationCreated = (data: ConversationResponse) => {
        onNewMessageConversation?.(data)
    }

    const handleReadMessageConversation = (data: ConversationResponse) => {
        onReadMessageConversation?.(data.id, data.totalUnReadMessage)
    }

    const cleanupPusher = () => {
        if (!pusher) return
        if (channelName.current) {
            unsubscribeChannelSafe(pusher, channelName.current)
        }
    };

    const handleListenerEvent = async () => {
        try {
            if (
                pusher &&
                academyDomain &&
                !!userId
            ) {
                cleanupPusher()

                channelName.current = `presence-conversation-channel-userId-${userId}-${academyDomain.trim().toUpperCase()}`

                const messageHandlers = {
                    [MESSAGE_CONVERSATION_EVENT]: handleNewMessageConversationCreated,
                    [MESSAGE_CONVERSATION_READ_EVENT]: handleReadMessageConversation
                }
                channel.current = await subscribeChannel(pusher, channelName.current, Object.entries(messageHandlers).map(([eventName, handler]) => ({ eventName, handler })))
            }
        } catch (err) {
            console.error("Pusher subscription failed", err);
        }
    }

    useEffect(() => {
        const initPusher = async () => {
            await handleListenerEvent();
        };

        initPusher();
        return cleanupPusher
    }, [userId, academyDomain, pusher])
    return {}
}

export default usePusherConversation
