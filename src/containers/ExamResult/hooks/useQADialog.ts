import { useState } from "react";
import { createConversationApi } from "../../ExamResultList/apiClients";
import { useTranslation } from "react-i18next";
import { Question, QuestionData } from "@/utils/types";
import { getErrorMessage, toast } from "@/utils/helpers";
import { GestureResponderEvent } from "react-native";
import useAuthStore from "@/store/useAuthStore";


const useCreateQuestionDialog = (handleSelectQuestion: (question?: QuestionData) => void) => {
    const [isOpenQuestionDialog, setOpenQuestionDialog] = useState<boolean>(false)
    const [questionIdContextMenu, setQuestionIdContextMenu] = useState<number>()
    const { t } = useTranslation()
    const { setLoadingWithoutOverlay} = useAuthStore()

    const handleCloseQuestionContextMenu = () => {
        setQuestionIdContextMenu(0)
    }
    const handleOpenQuestionContextMenu = (question: Question) => {
        setQuestionIdContextMenu(question?.id)
    }

    const handleOpenQuestionDialog = (_: GestureResponderEvent, question?: Question) => {
        handleSelectQuestion(question)
        handleCloseQuestionContextMenu()
        setOpenQuestionDialog(true)
    }

    const handleCloseQuestionDialog = () => {
        handleCloseQuestionContextMenu()
        handleSelectQuestion(undefined)
        setOpenQuestionDialog(false)
    }

    const handleCreateQuestion = async ({ content, examSessionId, studentTextbookId, questionId }: { content: string, examSessionId: number, studentTextbookId: number, questionId: number }) => {
        setLoadingWithoutOverlay(true)
        try {
            await createConversationApi({ examSessionId, content, questionId, studentTextbookId })
            toast.success(t('conversation_created_success'))
        } catch (error) {
            console.log({ error });
            toast.error(getErrorMessage(t, error))
        }
        finally {
            setLoadingWithoutOverlay(false)
            handleCloseQuestionDialog()
        }
    }

    return {
        questionIdContextMenu,
        isOpenQuestionDialog,
        setOpenQuestionDialog,
        handleOpenQuestionContextMenu,
        handleOpenQuestionDialog,
        handleCloseQuestionDialog,
        handleCreateQuestion,
        handleCloseQuestionContextMenu
    }
}

export default useCreateQuestionDialog;