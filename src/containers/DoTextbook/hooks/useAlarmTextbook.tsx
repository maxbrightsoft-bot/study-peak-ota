import { startTextbook } from '@/containers/Textbook/apiClients/textbookService'
import useAlarm from '@/layouts/hooks/useAlarm'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import useAuthStore from '@/store/useAuthStore'
import { AlarmType } from '@/utils/enums'
import { getErrorMessage, toast } from '@/utils/helpers'
import { SubjectTimerResponse, Textbook } from '@/utils/types'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  handleCloseDialog: () => void
  onStart: (type: AlarmType, duration: number, subject?: SubjectTimerResponse, enable?: boolean) => void
}

const useAlarmTextbook = ({ handleCloseDialog, onStart }: Props) => {
  const { t } = useTranslation()
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
      console.log('handleStartTextbook', enable, textbook)
      setLoading(true)
      await startTextbook(textbook.id)
      setLoading(false)
      if (enable) await handleStartAudio(textbook)
      handleCloseAudioGuide()
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      navigate(Routes.Auth.DoTextbook, { textbookId: textbook.id, reqTime: moment().valueOf() })
    }
  }

  return {
    isOpenAudioGuide,
    handleOpenAudioGuide,
    handleCloseAudioGuide,
    handleStartTextbook
  }
}

export default useAlarmTextbook
