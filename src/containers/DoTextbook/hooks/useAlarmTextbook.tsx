import { startTextbook } from '@/containers/Textbook/apiClients/textbookService'
import useServerTime from '@/hooks/useServerTime'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import useAuthStore from '@/store/useAuthStore'
import { getErrorMessage, toast } from '@/utils/helpers'
import { SubjectTimerResponse, Textbook } from '@/utils/types'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  handleCloseDialog: () => void
  onStartAudio: (
    enable: boolean,
    duration?: number,
    subject?: SubjectTimerResponse,
    startTime?: number,
    skipPreAlarm?: boolean
  ) => Promise<void>
}

const useAlarmTextbook = ({ handleCloseDialog, onStartAudio }: Props) => {
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

  const handleStartAudio = async (textbook: Textbook, enable: boolean) => {
    await onStartAudio(enable, textbook.duration, textbook.subject as any)
  }

  const handleStartTextbook = async (enable: boolean, textbook: any) => {
    try {
      setLoading(true)
      await startTextbook(textbook.id)
      setLoading(false)
      if (!textbook.isMock) await handleStartAudio(textbook, enable)
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
