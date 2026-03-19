import { getChapterResultsApi, getChapterResultsEffectSizeApi } from "@/containers/ExamResult/apiClients"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import { EffectSize, TextbookResult } from "@/utils/types"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  chapterId?: number
}
const useTextbookChapterResult = ({ chapterId }: Props) => {
  const { t } = useTranslation()
  const [textbookResult, setTextbookResult] = useState<TextbookResult>();
  const [effectSize, setEffectSize] = useState<EffectSize[]>();
  const { setLoadingWithoutOverlay } = useAuthStore()

  const getDataTextbookResult = async () => {
    if (!chapterId) return
    setLoadingWithoutOverlay(true)
    try {
      const result = await Promise.all([
        getChapterResultsApi(chapterId, undefined),
        getChapterResultsEffectSizeApi(chapterId, undefined),
      ])
      setTextbookResult(result[0].data?.data)
      setEffectSize(result[1].data?.data)
    } catch (error) {
      const message = getErrorMessage(t, error)
      toast.error(message)
    }
    setLoadingWithoutOverlay(false)
  }


  useEffect(() => {
    getDataTextbookResult()
  }, [chapterId])

  return { textbookResult, effectSize }
}

export default useTextbookChapterResult