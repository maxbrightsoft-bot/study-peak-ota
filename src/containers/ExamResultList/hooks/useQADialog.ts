import { MouseEvent, useState } from "react";
import { createConversationApi } from "../apiClients";
import { useTranslation } from "react-i18next";
import { Question, QuestionData } from "@/utils/types";
import useAuthStore from "@/store/useAuthStore";
import { getErrorMessage, toast } from "@/utils/helpers";


const useCreateQuestionDialog = (handleSelectQuestion: (question?: QuestionData) => void) => {
    const [isOpenQuestionDialog, setOpenQuestionDialog] = useState<boolean>(false)
    const [questionIdContextMenu, setQuestionIdContextMenu] = useState<number>()
    const { t } = useTranslation()
    const { setLoading } = useAuthStore()

    const handleCloseQuestionContextMenu = () => {
        setQuestionIdContextMenu(0)
    }
    const handleOpenQuestionContextMenu = (question: Question) => {
        setQuestionIdContextMenu(question?.id)
    }
    
    const handleOpenQuestionDialog = (_: MouseEvent<HTMLButtonElement>, question?: Question) => {
        handleSelectQuestion(question)
        handleCloseQuestionContextMenu()
        setOpenQuestionDialog(true)
    }

    const handleCloseQuestionDialog = () => {
        handleCloseQuestionContextMenu()
        handleSelectQuestion(undefined)
        setOpenQuestionDialog(false)
    }

    const handleCreateQuestion = async({ content, examSessionId, studentTextbookId, questionId }: { content : string, examSessionId: number, studentTextbookId: number, questionId: number}) => {
        setLoading(true)
        try {
            await createConversationApi({ examSessionId, content, questionId, studentTextbookId })
            handleCloseQuestionDialog()
        } catch (error) {
            console.log({ error });
            toast.error(getErrorMessage(t, error))
        }
        setLoading(false)
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