import { startTextbook } from '@/containers/Textbook/apiClients/textbookService'
import useServerTime from '@/hooks/useServerTime'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import useAuthStore from '@/store/useAuthStore'
import { AlarmType } from '@/utils/enums'
import { getErrorMessage, toast } from '@/utils/helpers'
import { SubjectTimerResponse, Textbook } from '@/utils/types'
import { useFocusEffect } from 'expo-router'
import moment from 'moment'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  handleCloseDialog: () => void
  onStart: (type: AlarmType, duration: number, subject?: SubjectTimerResponse, enable?: boolean) => void
}

const useAlarmTextbook = ({ handleCloseDialog, onStart }: Props) => {
  const { t } = useTranslation()
  const { getServerNow } = useServerTime()
  const { setLoading } = useAuthStore()
  const [isOpenAudioGuide, setOpenAudioGuide] = useState<boolean>(false)

  const handleOpenAudioGuide = () => {
    handleCloseDialog()
    setOpenAudioGuide(true)
  }
  const handleCloseAudioGuide = () => {
    setOpenAudioGuide(false)
  }

  const handleStartAudio = async (textbook: Textbook) => {
    onStart(AlarmType.Subject, textbook.duration, textbook.subject as any, true)
  }

  const handleStartTextbook = async (enable: boolean, textbook: any) => {
    try {
      setLoading(true)
      await startTextbook(textbook.id)
      setLoading(false)
      if (enable && !textbook.isMock) await handleStartAudio(textbook)
      handleCloseAudioGuide()
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      navigate(Routes.Auth.DoTextbook, { textbookId: textbook.id, reqTime: getServerNow() })
    }
  }
  useFocusEffect(useCallback(() => {
    return () => {
      handleCloseAudioGuide()
    }
  }, []))

  return {
    isOpenAudioGuide,
    handleOpenAudioGuide,
    handleCloseAudioGuide,
    handleStartTextbook
  }
}

export default useAlarmTextbook
