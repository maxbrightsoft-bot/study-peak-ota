import { useCallback } from "react"
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import type { ParamListBase } from "@react-navigation/native"
import Question from "@/containers/Chat"

type Props = BottomTabScreenProps<ParamListBase>

const QuestionScreen = ({ route, navigation }: Props) => {
  const conversationId = (
    route?.params as { conversationId?: number | string } | undefined
  )?.conversationId
  // Tab screens keep their params: clear it once the chat has consumed it.
  const handleConsumed = useCallback(() => {
    navigation?.setParams?.({ conversationId: undefined } as object)
  }, [navigation])

  return (
    <Question
      initialConversationId={
        conversationId ? Number(conversationId) : undefined
      }
      onInitialConversationConsumed={handleConsumed}
    />
  )
}
export default QuestionScreen
