import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Routes } from '@/navigators/RouteName'
import { getGuestAcademyByDomainApi, getGuestExamApi } from '../apiClients'
import { GUEST_CODE_LENGTH } from '../configs/constants'
import { getGuestErrorMessage, getGuestErrorStatus, isSameGuestAcademy, sanitizeGuestCode } from '../configs/helpers'
import { GuestAcademy } from '../configs/types'
import { loadGuestAcademy, saveGuestAcademy } from '../utils/guestAcademy'
import { dropGuestState } from '../utils/guestNavigation'
import { clearGuestSession } from '../utils/guestSession'
import { parseExamQr } from '../utils/qr'

const useGuestCode = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const [academy, setAcademy] = useState<GuestAcademy>()
  const [code, setCode] = useState<string>('')
  const [error, setError] = useState<string>()
  const [isSubmitting, setSubmitting] = useState<boolean>(false)
  const [isPickerOpen, setPickerOpen] = useState<boolean>(false)
  const [isScannerOpen, setScannerOpen] = useState<boolean>(false)
  const academyTouchedRef = useRef<boolean>(false)

  useEffect(() => {
    loadGuestAcademy().then(saved => {
      // A pick or a scan made while storage was loading wins.
      if (saved && !academyTouchedRef.current) setAcademy(saved)
    })
  }, [])

  // A new child starts here: never carry the previous guest token, and no previous code.
  useFocusEffect(
    useCallback(() => {
      dropGuestState()
      setCode('')
      setError(undefined)
    }, [])
  )

  const pickAcademy = useCallback((value: GuestAcademy) => {
    academyTouchedRef.current = true
    setAcademy(value)
    saveGuestAcademy(value)
  }, [])

  const handleChangeCode = useCallback((value: string) => {
    setCode(sanitizeGuestCode(value))
    setError(undefined)
  }, [])

  const handleSelectAcademy = useCallback(
    (value: GuestAcademy) => {
      pickAcademy(value)
      setPickerOpen(false)
      setError(undefined)
    },
    [pickAcademy]
  )

  const handleScanned = useCallback(
    async (data: string) => {
      setScannerOpen(false)
      const payload = parseExamQr(data)
      if (!payload) {
        setError(t('guest_qr_invalid'))
        return
      }
      if (!payload.domain) {
        const studySpace: GuestAcademy = {
          name: t('my_study_space'),
          domain: '',
          isLearningSpace: true
        }
        pickAcademy(isSameGuestAcademy(academy, studySpace) && academy ? academy : studySpace)
        setCode(sanitizeGuestCode(payload.code))
        setError(undefined)
        return
      }
      // The QR only carries the domain: look it up so the academy box shows the real name.
      setSubmitting(true)
      try {
        const res = await getGuestAcademyByDomainApi(payload.domain)
        pickAcademy({
          name: res.data?.name || payload.domain,
          domain: res.data?.domain || payload.domain,
          isLearningSpace: false
        })
        setCode(sanitizeGuestCode(payload.code))
        setError(undefined)
      } catch (err) {
        setCode(sanitizeGuestCode(payload.code))
        if (getGuestErrorStatus(err) === 404) {
          // Unknown academy: keep the current academy.
          setError(t('guest_code_invalid'))
        } else {
          // Lookup unavailable: fill the domain; confirm replaces it with the academy name from the exam.
          const scanned: GuestAcademy = {
            name: payload.domain,
            domain: payload.domain,
            isLearningSpace: false
          }
          pickAcademy(isSameGuestAcademy(academy, scanned) && academy ? academy : scanned)
          setError(undefined)
        }
      } finally {
        setSubmitting(false)
      }
    },
    [academy, pickAcademy, t]
  )

  const handleCancel = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack()
    else navigation.navigate(Routes.UnAuth.Login)
  }, [navigation])

  const isComplete = code.length === GUEST_CODE_LENGTH

  const handleConfirm = useCallback(async () => {
    if (isSubmitting || !isComplete) return
    if (!academy) {
      setError(t('guest_select_academy'))
      setPickerOpen(true)
      return
    }
    setSubmitting(true)
    try {
      // A stored guest token on a {code} route gets 403: drop any stale session first.
      await clearGuestSession()
      const res = await getGuestExamApi(academy, code)
      const exam = res.data
      const picked: GuestAcademy = academy.isLearningSpace ? academy : { ...academy, name: exam?.academyName || academy.name }
      pickAcademy(picked)
      navigation.navigate(Routes.UnAuth.GuestInfo, { exam, academy: picked })
    } catch (err) {
      setError(getGuestErrorStatus(err) === 404 ? t('guest_code_invalid') : getGuestErrorMessage(t, err))
    } finally {
      setSubmitting(false)
    }
  }, [academy, code, isComplete, isSubmitting, navigation, pickAcademy, t])

  return {
    t,
    academy,
    code,
    error,
    isComplete,
    isSubmitting,
    isPickerOpen,
    isScannerOpen,
    openPicker: () => setPickerOpen(true),
    closePicker: () => setPickerOpen(false),
    openScanner: () => setScannerOpen(true),
    closeScanner: () => setScannerOpen(false),
    handleChangeCode,
    handleSelectAcademy,
    handleScanned,
    handleCancel,
    handleConfirm
  }
}

export default useGuestCode
