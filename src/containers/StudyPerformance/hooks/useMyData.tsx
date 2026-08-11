import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TabList } from '../configs/constants'
import useAuthStore from '@/store/useAuthStore'
import { Role } from '@/utils/enums'
import { useTranslation } from 'react-i18next'
import { apiUploadImageFile } from '@/containers/ExamResultList/apiClients'
import { getErrorMessage, toast } from '@/utils/helpers'
import { createNoteApi } from '@/containers/ExamResultList/apiClients/noteService'
import { ConversationQuestion, ExamSessionResponse, NoteRequest } from '@/utils/types'
import { useFocusEffect } from '@react-navigation/native'
import {
  getListCourseByStudentApi,
  getListExamByCourseApi,
  getListQuestionByExamApi
} from '@/containers/Chat/apiClient/examService'
import { Course } from '@/containers/Chat/configs/types'
import * as ImagePicker from 'expo-image-picker';
import { FlatList } from 'react-native'

const useMyData = () => {
  const user = useAuthStore(state => state.user)
  const setLoading = useAuthStore(state => state.setLoading)
  const setLoadingWithoutOverlay = useAuthStore(state => state.setLoadingWithoutOverlay)
  const academyDomain = user?.academyDomain
  const isSuperAdmin = useMemo(() => (user?.roles || []).includes(Role.Admin) && !academyDomain, [user?.roles, academyDomain])
  const isLearningSpace = user?.isLearningSpace
  const isAcademy = isLearningSpace || !!academyDomain
  const isAdminOrNonAcademy = !isAcademy || isSuperAdmin
  const contentRef = useRef<FlatList>(null)
  const { t } = useTranslation()
  const [selected, setSelected] = useState(TabList[0].value)
  const [isReadyPrint, setReadyPrint] = useState(false)
  const [isClickPrint, setClickPrint] = useState(false)
  const [openCreateNote, setOpenCreateNote] = useState(false)
  const [examList, setListExam] = useState<ExamSessionResponse[]>([])
  const [courseIdSelected, setCourseIdSelected] = useState<string>()
  const [examSessionIdSelected, setExamSessionIdSelected] = useState<string>()
  const [questions, setQuestion] = useState<Array<ConversationQuestion>>()
  const [courses, setCourses] = useState<Array<Course>>()
  const [imageUrl, setImageUrl] = useState('')

  const handleOpenCreateNote = () => {
    setOpenCreateNote(true)
  }

  const handleUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (result.canceled || !result.assets.length) return;

      setLoadingWithoutOverlay(true);
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("upload", {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
      } as any);
      const res = await apiUploadImageFile(formData)
      setImageUrl(res?.data?.url)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoadingWithoutOverlay(false)
    }
  }

  const handleChangeExam = (value: string) => {
    setExamSessionIdSelected(value)
  }

  const handleChangeCourse = (value: string) => {
    setCourseIdSelected(value)
    getListExamByCourse({ courseId: value || undefined })
  }

  const handleCloseCreateNote = () => {
    setOpenCreateNote(false)
    setImageUrl('')
  }

  const handleRemoveImage = () => {
    setImageUrl('')
  }

  const handlePrint = () => {
    if (!isReadyPrint || !isClickPrint) return

    setTimeout(() => {
      handleTogglePrint()
      setLoading(false)
    }, 300)
  }

  const handleReadyPrint = () => {
    setReadyPrint(true)
  }

  const handleTogglePrint = () => {
    setClickPrint((prev) => !prev)
  }

  const handleChangeTab = (newValue: any) => {
    setSelected(newValue)
    setReadyPrint(false)
    setClickPrint(false)
  }

  const handleSaveNote = async ({
    content,
    questionId,
    examSessionId,
    studentExamSessionId,
    courseId
  }: {
    content: string
    questionId?: number | null
    examSessionId?: number
    studentExamSessionId?: number
    courseId?: number
  }) => {
    try {
      if (content.trim().length === 0) return

      const data: NoteRequest = {
        content,
        questionId: questionId === null ? undefined : questionId,
        examSessionId,
        studentExamSessionId,
        courseId,
        imageUrl
      }

      await createNoteApi(data)

      toast.success(t('create_note_successfully'))
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      handleCloseCreateNote()
    }
  }

  const getListCourseByStudent = async () => {
    setLoading(true)
    try {
      const res = await getListCourseByStudentApi({ studentId: user?.id || 0 })
      setCourses(res.data.items || [])
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }

  const getListExamByCourse = async ({ courseId }: { courseId?: string }) => {
    setLoadingWithoutOverlay(true)
    try {
      const res = await getListExamByCourseApi({ courseId })
      setListExam(res.data.items || [])
      setExamSessionIdSelected(undefined)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoadingWithoutOverlay(false)
  }

  const getListQuestionByExam = async ({ examId }: { examId: string }) => {
    setLoadingWithoutOverlay(true)
    try {
      const res = await getListQuestionByExamApi({ id: examId })
      setQuestion(res.data.items || [])
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoadingWithoutOverlay(false)
  }

  useEffect(() => {
    if (isClickPrint && isReadyPrint) {
      setLoading(true)
      handlePrint()
    }
  }, [isReadyPrint, isClickPrint])

  useEffect(() => {
    if (!examSessionIdSelected || !openCreateNote) return
    getListQuestionByExam({ examId: examSessionIdSelected.split('.')?.[0] })
  }, [examSessionIdSelected, openCreateNote])

  useEffect(() => {
    if (openCreateNote) {
      getListExamByCourse({})
    }
  }, [openCreateNote])

  const courseOptions = useMemo(() => {
    if (!courses) return []
    return courses.map(({ id, name }) => ({
      label: name,
      value: id
    }))
  }, [courses])

  const questionOptions = useMemo(() => {
    if (!questions || !examList) return []
    return questions.map(({ id, questionOrder, parentQuestionId, parentQuestionOrder = 0 }) => ({
      label: t('question_order', {
        number: !!parentQuestionId ? `${parentQuestionOrder + 1}.${questionOrder + 1}` : questionOrder + 1
      }),
      value: id
    }))
  }, [questions])

  const examOptions = useMemo(() => {
    if (!examList) return []
    return examList.map(({ id, studentExamSessionId, studentAttemptNumber, studentTotalAttemptTime, title }) => ({
      label: `${title} ${studentTotalAttemptTime > 1 ? `#${studentAttemptNumber + 1}/${studentTotalAttemptTime}` : ''}`,
      value: `${id}.${studentExamSessionId}`
    }))
  }, [examList])

  useFocusEffect(
    useCallback(() => {
      getListCourseByStudent()
      setSelected(TabList[0].value)
      contentRef.current?.scrollToOffset({
        offset: 0,
        animated: true
      })
      return () => {
        setOpenCreateNote(false)
        setExamSessionIdSelected(undefined)
        setCourseIdSelected(undefined)
        setQuestion(undefined)
        setImageUrl('')
        setListExam([])
      }
    }, [])
  )

  return {
    t,
    selected,
    contentRef,
    handlePrint,
    examOptions,
    examList,
    imageUrl,
    questions,
    academyDomain,
    courseOptions,
    examSessionIdSelected,
    handleChangeExam,
    handleChangeCourse,
    questionOptions,
    handleSaveNote,
    handleReadyPrint,
    handleTogglePrint,
    handleChangeTab,
    openCreateNote,
    courseIdSelected,
    handleUploadImage,
    handleRemoveImage,
    handleOpenCreateNote,
    handleCloseCreateNote,
    isAdminOrNonAcademy
  }
}

export default useMyData
