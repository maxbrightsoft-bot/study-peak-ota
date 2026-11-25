import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Routes } from '@/navigators/RouteName'
import useAuthStore from '@/store/useAuthStore'
import { EXAM_CHANNEL } from '@/utils/constants'
import { ExamEvent, ExamStatus } from '@/utils/enums'
import { GRADE_OPTIONS } from '@/containers/StepLogin/configs/constants'
import { joinGuestExamApi, startGuestExamApi } from '../apiClients'
import { GUEST_FULL_NAME_MAX, GUEST_SCHOOL_NAME_MAX, GUEST_WAIT_POLL_MS } from '../configs/constants'
import { getGuestErrorMessage, getGuestErrorStatus, isTeacherNotJoinedError, isValidGuestPhone } from '../configs/helpers'
import { GuestAcademy, GuestExamInfo, GuestInfoFormValues } from '../configs/types'
import { startGuestPusher, stopGuestPusher } from '../utils/guestPusher'
import { clearGuestSession, GuestSession, setGuestSession } from '../utils/guestSession'

type JoinData = { status?: ExamStatus; lateStatus?: ExamStatus; isLate?: boolean }

const INITIAL_VALUES: GuestInfoFormValues = {
  fullName: '',
  grade: '',
  schoolName: '',
  parentPhone: '',
  studentPhone: '',
  consent: false
}

/** Pending session: the guest waits for the teacher, like a student. */
const isWaitingForTeacher = (data?: JoinData) => (data?.status || data?.lateStatus) === ExamStatus.Pending && !data?.isLate

const useGuestInfo = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const exam: GuestExamInfo | undefined = route.params?.exam
  const academy: GuestAcademy | undefined = route.params?.academy
  const subscribeChannel = useAuthStore(state => state.subscribeChannel)
  const unsubscribeChannelSafe = useAuthStore(state => state.unsubscribeChannelSafe)
  const [submitError, setSubmitError] = useState<string>()
  const [waitingSession, setWaitingSession] = useState<GuestSession>()
  const [isConsentOpen, setConsentOpen] = useState<boolean>(false)
  const enteredRef = useRef<boolean>(false)

  useEffect(() => {
    // Opened without a checked code (should not happen): start over.
    if (!exam || !academy) navigation.replace(Routes.UnAuth.GuestCode)
  }, [])

  const gradeOptions = useMemo(() => GRADE_OPTIONS.map(i => ({ ...i, label: t(i.label) })), [t])

  // The exam replaces this screen: Back from the exam goes to the code screen, not to a filled form.
  const enterExam = useCallback(
    (session: GuestSession) => {
      if (enteredRef.current) return
      enteredRef.current = true
      navigation.replace(Routes.UnAuth.GuestExam, { examCode: session.code })
    },
    [navigation]
  )

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().trim().required(t('full_name_is_required')).max(GUEST_FULL_NAME_MAX, t('full_name_is_required')),
    grade: Yup.number()
      .typeError(t('student_grade_is_required'))
      .required(t('student_grade_is_required'))
      .min(1, t('student_grade_is_required')),
    schoolName: Yup.string()
      .trim()
      .required(t('school_name_is_required'))
      .max(GUEST_SCHOOL_NAME_MAX, t('school_name_is_required')),
    parentPhone: Yup.string()
      .trim()
      .required(t('parent_phone_number_is_invalid'))
      .test('is-valid-phone', t('parent_phone_number_is_invalid'), value => isValidGuestPhone(value)),
    studentPhone: Yup.string()
      .trim()
      .test('is-valid-phone', t('phone_number_is_not_valid'), value => !value || isValidGuestPhone(value)),
    consent: Yup.boolean().oneOf([true], t('guest_consent_required'))
  })

  const formik = useFormik<GuestInfoFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema,
    onSubmit: async values => {
      if (!academy || !exam) return
      setSubmitError(undefined)
      try {
        // Never start on top of an older guest token (a token on a {code} route gets 403).
        await clearGuestSession()
        const res = await startGuestExamApi(academy, exam.code, {
          fullName: values.fullName.trim().replace(/\s+/g, ' '),
          grade: Number(values.grade),
          schoolName: values.schoolName.trim(),
          parentPhone: values.parentPhone.trim(),
          studentPhone: values.studentPhone.trim() || null,
          consent: values.consent
        })
        const session: GuestSession = {
          token: res.data.accessToken,
          code: exam.code,
          domain: academy.isLearningSpace ? '' : academy.domain,
          isLearningSpace: academy.isLearningSpace
        }
        await setGuestSession(session)
        await startGuestPusher(session)
        try {
          const joinRes = await joinGuestExamApi(session.code)
          if (isWaitingForTeacher(joinRes.data?.data)) setWaitingSession(session)
          else enterExam(session)
        } catch (joinErr) {
          // The teacher has not opened the exam yet: wait (the poll below retries the join).
          if (isTeacherNotJoinedError(joinErr)) setWaitingSession(session)
          else throw joinErr
        }
      } catch (err) {
        // The 401 path (token already revoked) is handled by the interceptor.
        if (getGuestErrorStatus(err) !== 401) setSubmitError(getGuestErrorMessage(t, err))
      }
    }
  })

  // Pending: enter on the teacher's start event, with a slow join poll as a fallback.
  useEffect(() => {
    if (!waitingSession) return
    let isActive = true
    const pusher = useAuthStore.getState().pusher
    const channelName =
      pusher && waitingSession.domain
        ? `${EXAM_CHANNEL}-${waitingSession.code}-${waitingSession.domain.trim().toUpperCase()}`
        : undefined
    const handleStart = (data: { Status?: ExamStatus; status?: ExamStatus } | null) => {
      const status = data?.Status ?? data?.status
      if (isActive && (status === ExamStatus.InProgress || status === ExamStatus.Completed)) enterExam(waitingSession)
    }
    const getEventHandlers = () => [{ eventName: ExamEvent.StartExam, handler: handleStart }]
    if (pusher && channelName) subscribeChannel(pusher, channelName, getEventHandlers).catch(() => { })
    const timer = setInterval(async () => {
      try {
        const res = await joinGuestExamApi(waitingSession.code)
        if (isActive && !isWaitingForTeacher(res.data?.data)) enterExam(waitingSession)
      } catch {
        // A 401 ends the guest flow in the interceptor; anything else: try again on the next tick.
      }
    }, GUEST_WAIT_POLL_MS)
    return () => {
      isActive = false
      clearInterval(timer)
      if (pusher && channelName) unsubscribeChannelSafe(pusher, channelName, getEventHandlers)
    }
  }, [waitingSession])

  // Leaving the form while waiting (Back): the session was never used, so drop it.
  useEffect(
    () => () => {
      if (!enteredRef.current) {
        clearGuestSession()
        stopGuestPusher()
      }
    },
    []
  )

  return {
    t,
    exam,
    academy,
    formik,
    gradeOptions,
    submitError,
    isWaiting: !!waitingSession,
    isConsentOpen,
    openConsent: () => setConsentOpen(true),
    closeConsent: () => setConsentOpen(false),
    goToCode: () => navigation.goBack()
  }
}

export default useGuestInfo
