import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getDataApi,
  getRankingDataApi,
  getSubjectDataApi,
  getSubjectListApi,
  getPerformanceSummaryApi,
  getPerformanceAnalysisApi,
  getPerformanceWeaknessApi,
  getPerformanceDailyApi
} from '../apiClients'
import { MILLISECONDS_PER_HOUR, Mode, timeTypeOptions, TOP_WEAKNESS_LIMIT } from '../../../configs/constants'
import {
  getCurrentTimeOptions,
  getDefaultCurrentTimeOption,
  getMonthTimeStampArray,
  getRandomColors,
  getRandomRGB,
  getWeekCountOfMonth,
  getWeekOfMonth,
  getWeekOfMonthFromISOWeek,
  getWeekTimestampArray,
  getYearTimeStampArray,
  getDayTimestampArray,
  rgbToHex,
  roundTo
} from '../../../configs/helper'
import {
  Category,
  DataResponse,
  PerformanceAnalysisResponse,
  PerformanceDailyResponse,
  PerformanceRequest,
  PerformanceSummaryResponse,
  PerformanceWeaknessResponse,
  QuestionData,
  RankingDataResponse,
  StudyTimeDistribution,
  Subject,
  SubjectDataNumberResponse,
  SubjectDataQuestionResponse,
  SubjectResponse,
} from '../../../configs/types'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { Role } from '@/utils/enums'
import useAuthStore from '@/store/useAuthStore'
import { getErrorMessage, toast } from '@/utils/helpers'
import { useFocusEffect } from '@react-navigation/native'

type Props = {
  studentId?: number
  mode?: Mode
}

type SubjectOptionItem = Pick<SubjectResponse, 'id' | 'name'>

const useStudyPerformanceData = ({ mode = Mode.Timer, studentId }: Props) => {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const academyDomain = user?.academyDomain
  const isStudent = user?.roles?.includes(Role.Student)
  const isSuperAdmin = (user?.roles || []).includes(Role.Admin) && !academyDomain
  const isLearningSpace = Boolean(user?.isLearningSpace)

  // Tenant user (Academy or My Study Space) vs SuperAdmin/non-tenant for timer endpoints
  const isTenantUser = isLearningSpace || !!academyDomain
  const isAdminOrNonAcademy = !isTenantUser || isSuperAdmin

  const [visible, setVisible] = useState(false)
  const [load, setLoad] = useState<boolean>(false)

  const [loadingData, setLoadingData] = useState(false)
  const [loadingSubjectData, setLoadingSubjectData] = useState(false)
  const [loadingSubjectCumulativeData, setLoadingSubjectCumulativeData] = useState(false)
  const [loadingRankingData, setLoadingRankingData] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)

  const [timeType, setTimeType] = useState(timeTypeOptions(t)?.[0].value)
  const [currentTime, setCurrentTime] = useState(getDefaultCurrentTimeOption(t, timeType))

  const [data, setData] = useState<DataResponse>()
  const [rankingData, setRankingData] = useState<RankingDataResponse>()

  const [summaryData, setSummaryData] = useState<PerformanceSummaryResponse>()
  const [performanceData, setPerformanceData] = useState<PerformanceAnalysisResponse>()
  const [weaknessData, setWeaknessData] = useState<PerformanceWeaknessResponse>()
  const [dailyData, setDailyData] = useState<PerformanceDailyResponse>()

  const [loadingDaily, setLoadingDaily] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [loadingWeakness, setLoadingWeakness] = useState(false)

  const [subjectData, setSubjectData] = useState<SubjectDataNumberResponse | SubjectDataQuestionResponse>()
  const [subjectCumulativeData, setSubjectCumulativeData] = useState<SubjectDataNumberResponse | SubjectDataQuestionResponse>()

  const [subjects, setSubjects] = useState<SubjectOptionItem[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number>()

  // Monotonic request counters ignore out-of-order responses across filter or space switches
  const subjectsReqRef = useRef(0)
  const perfReqRef = useRef(0)
  const dailyReqRef = useRef(0)

  const handleToggle = () => {
    setVisible((prev) => !prev)
  }

  const handleChangeTimeType = (value: number) => {
    setTimeType(value)
    setCurrentTime(getDefaultCurrentTimeOption(t, value))
  }

  const handleChangeCurrentTime = (value: number) => {
    setCurrentTime(value)
  }

  const handleChangeSubject = (value: number) => {
    setSelectedSubject(value)
  }

  const subjectDataRequest = useMemo<PerformanceRequest>(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    switch (timeType) {
      case 0:
        return {
          studentId,
          timezone,
          pTimes: getWeekTimestampArray(currentTime),
          sTimes: getWeekTimestampArray(currentTime - 1)
        }
      case 1: {
        const pYear = moment().year()
        const sYear = currentTime === 0 ? moment().add(-1, 'y').year() : moment().year()
        return {
          studentId,
          timezone,
          pTimes: getMonthTimeStampArray(currentTime, pYear),
          sTimes: getMonthTimeStampArray(currentTime > 0 ? currentTime - 1 : 11, sYear)
        }
      }
      case 2:
        return {
          studentId,
          timezone,
          pTimes: getYearTimeStampArray(currentTime),
          sTimes: getYearTimeStampArray(currentTime - 1)
        }
      case 3:
        return {
          studentId,
          timezone,
          pTimes: getDayTimestampArray(currentTime),
          sTimes: getDayTimestampArray(moment(currentTime).subtract(1, 'day').valueOf())
        }
      default:
        return { studentId, timezone, pTimes: [], sTimes: [] }
    }
  }, [timeType, currentTime, studentId])

  const handleGetData = async () => {
    if (mode !== Mode.Timer) return
    setLoadingData(true)
    try {
      const res = await getDataApi(isAdminOrNonAcademy, {
        ...subjectDataRequest,
        retrieveCumulative: false
      })
      setData(res.data)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoadingData(false)
    }
  }

  const handleGetSubjectData = async () => {
    if (mode !== Mode.Timer) return
    setLoadingSubjectData(true)
    try {
      const res = await getSubjectDataApi(isAdminOrNonAcademy, {
        ...subjectDataRequest,
        retrieveCumulative: false
      })
      setSubjectData(res.data)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoadingSubjectData(false)
    }
  }

  const handleGetSubjectCumulativeData = async () => {
    if (mode !== Mode.Timer) return
    setLoadingSubjectCumulativeData(true)
    try {
      const dataRequest = {
        studentId,
        pTimes: [moment().startOf('day').valueOf(), moment().endOf('day').valueOf()],
        sTimes: [moment().add(-1, 'd').startOf('day').valueOf(), moment().add(-1, 'd').endOf('day').valueOf()]
      }
      const res = await getSubjectDataApi(isAdminOrNonAcademy, {
        ...dataRequest,
        retrieveCumulative: true
      })
      setSubjectCumulativeData(res?.data)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoadingSubjectCumulativeData(false)
    }
  }

  const handleGetRankingData = async () => {
    if (mode !== Mode.Timer) return
    setLoadingRankingData(true)
    try {
      const dataRequest = {
        studentId,
        startTime: moment().startOf('day').valueOf(),
        endTime: moment().endOf('day').valueOf()
      }
      const res = await getRankingDataApi(isAdminOrNonAcademy, dataRequest)
      setRankingData(res.data)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoadingRankingData(false)
    }
  }

  const getSubjectList = async () => {
    if (mode !== Mode.Question) return
    const reqId = ++subjectsReqRef.current
    setLoadingSubjects(true)
    try {
      const res = await getSubjectListApi(isAdminOrNonAcademy)
      if (reqId !== subjectsReqRef.current) return

      const items: SubjectOptionItem[] = res.data?.items || []
      setSubjects(items)
      setSelectedSubject((prev) => {
        if (items.length === 0) return undefined
        if (prev !== undefined && items.some((item) => item.id === prev)) return prev
        return items[0].id
      })
    } catch (error) {
      if (reqId !== subjectsReqRef.current) return
      setSubjects([])
      toast.error(getErrorMessage(t, error))
    } finally {
      if (reqId === subjectsReqRef.current) {
        setLoadingSubjects(false)
      }
    }
  }

  const handleGetPerformanceData = async () => {
    if (mode !== Mode.Question || selectedSubject === undefined) return
    const reqId = ++perfReqRef.current
    setLoadingSummary(true)
    setLoadingAnalysis(true)
    setLoadingWeakness(true)

    try {
      const [summaryRes, analysisRes, weaknessRes] = await Promise.all([
        getPerformanceSummaryApi(selectedSubject, subjectDataRequest),
        getPerformanceAnalysisApi(selectedSubject, subjectDataRequest),
        getPerformanceWeaknessApi(selectedSubject, { ...subjectDataRequest, topLimit: TOP_WEAKNESS_LIMIT })
      ])

      if (reqId !== perfReqRef.current) return
      setSummaryData(summaryRes.data)
      setPerformanceData(analysisRes.data)
      setWeaknessData(weaknessRes.data)
    } catch (error) {
      if (reqId !== perfReqRef.current) return
      toast.error(getErrorMessage(t, error))
    } finally {
      if (reqId === perfReqRef.current) {
        setLoadingSummary(false)
        setLoadingAnalysis(false)
        setLoadingWeakness(false)
      }
    }
  }

  /**
   * Fetches fixed daily data (today stats + week activity + peer comparison).
   * Uses all subjects — does NOT depend on selectedSubject.
   * Called once on load/focus, NOT when subject changes.
   */
  const handleGetDailyData = async () => {
    if (mode !== Mode.Question) return
    const reqId = ++dailyReqRef.current
    setLoadingDaily(true)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const res = await getPerformanceDailyApi({ timezone: tz, studentId })
      if (reqId !== dailyReqRef.current) return
      setDailyData(res.data)
    } catch (error) {
      if (reqId !== dailyReqRef.current) return
      toast.error(getErrorMessage(t, error))
    } finally {
      if (reqId === dailyReqRef.current) {
        setLoadingDaily(false)
      }
    }
  }

  // Clear cached data immediately when switching workspace, user account, or viewed student
  useEffect(() => {
    subjectsReqRef.current += 1
    perfReqRef.current += 1
    dailyReqRef.current += 1
    setSubjects([])
    setSelectedSubject(undefined)
    setSummaryData(undefined)
    setPerformanceData(undefined)
    setWeaknessData(undefined)
    setDailyData(undefined)
  }, [user?.id, academyDomain, isLearningSpace, studentId])

  useEffect(() => {
    if (mode === Mode.Timer) {
      handleGetData()
      handleGetSubjectData()
      return
    }
    if (selectedSubject === undefined) return
    handleGetPerformanceData()
  }, [timeType, currentTime, selectedSubject, user?.id, studentId, load])

  useEffect(() => {
    if (mode !== Mode.Timer) return
    handleGetSubjectCumulativeData()
  }, [selectedSubject, user?.id, studentId, load])

  useEffect(() => {
    if (mode === Mode.Timer) {
      handleGetRankingData()
      return
    }
    getSubjectList()
    handleGetDailyData()
  }, [user?.id, academyDomain, isLearningSpace, studentId, load])

  useEffect(() => {
    if (mode !== Mode.Timer) return
    const isAnyLoading = loadingData || loadingSubjectData || loadingSubjectCumulativeData || loadingRankingData
    let timeout: ReturnType<typeof setTimeout>

    if (isAnyLoading) {
      timeout = setTimeout(() => {
        setLoadingData(false)
        setLoadingSubjectData(false)
        setLoadingSubjectCumulativeData(false)
        setLoadingRankingData(false)
      }, 10000)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [mode, loadingData, loadingSubjectData, loadingSubjectCumulativeData, loadingRankingData])

  useFocusEffect(
    useCallback(() => {
      setLoad((prev) => !prev)
    }, [])
  )

  const studyTimeDistributionData: StudyTimeDistribution[] = useMemo(() => {
    if (!subjectData || !subjectData.pData) return []

    if (mode === Mode.Question && 'categories' in subjectData) {
      const qPData = subjectData.pData as QuestionData[]
      const total =
        qPData.reduce((acc, cur) => acc + (cur?.totalAnsweredQuestions || 0), 0) || 1
      return subjectData.categories
        .map((cat: Category, idx: number) => ({
          ...cat,
          ...(qPData[idx] || {}),
          change: 0,
          correctRate: roundTo(qPData[idx]?.correctRate || 0, 2),
          percentage: roundTo(((qPData[idx]?.totalAnsweredQuestions || 0) / total) * 100, 4)
        }))
        .sort((a: StudyTimeDistribution, b: StudyTimeDistribution) => (b?.correctRate || 0) - (a?.correctRate || 0))
    }

    if (!('subjects' in subjectData)) return []
    const numericPData = subjectData.pData as number[]
    const numericSData = subjectData.sData as number[]
    const total = numericPData.reduce((acc, cur) => acc + cur, 0) || 1

    return subjectData.subjects
      .map((subject: Subject, idx: number) => {
        const current = numericPData[idx] || 0
        const previous = numericSData?.[idx] || 0
        return {
          ...subject,
          hours: current / MILLISECONDS_PER_HOUR,
          lastHours: previous / MILLISECONDS_PER_HOUR,
          change: current / MILLISECONDS_PER_HOUR - previous / MILLISECONDS_PER_HOUR,
          percentage: roundTo((current / total) * 100, 4)
        }
      })
      .sort((a: StudyTimeDistribution, b: StudyTimeDistribution) => (b?.hours || 0) - (a?.hours || 0))
  }, [subjectData, mode])

  const categoryStudyTimeCharts = useMemo(() => {
    switch (timeType) {
      case 0:
        return [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')]
      case 1:
        return Array.from({ length: getWeekCountOfMonth(currentTime) }, (_, i) => t('week_number', { week: i + 1 }))
      case 2:
        return Array.from({ length: 12 }, (_, i) => moment().month(i).format('MMM'))
      case 3:
        return Array.from({ length: 8 }, (_, i) => `${(i * 3).toString().padStart(2, '0')}:00`)
      default:
        return []
    }
  }, [timeType, currentTime, t])

  const currentTimeOptions = useMemo(() => getCurrentTimeOptions(t, timeType), [timeType, t])

  const labelStudyTimeChart = useMemo(() => {
    switch (timeType) {
      case 0:
        return `${t('day_of_month', {
          day: moment().isoWeek(currentTime).startOf('week').format('DD'),
          monthName: moment().format('MMM'),
          month: moment().month() + 1
        })} ~ ${t('day_of_month', {
          day: moment().isoWeek(currentTime).endOf('week').format('DD'),
          monthName: moment().format('MMM'),
          month: moment().month() + 1
        })}`
      case 1:
        return `${t('week_of_month', {
          week: getWeekOfMonth(moment().month(currentTime).startOf('month')),
          monthName: moment().month(currentTime).format('MMM'),
          month: currentTime + 1
        })} ~${t('week_of_month', {
          week: getWeekOfMonth(moment().month(currentTime).endOf('month')),
          monthName: moment().month(currentTime).format('MMM'),
          month: currentTime + 1
        })}`
      case 2:
        return currentTimeOptions.find((i) => i.value === currentTime)?.label
      case 3:
        return moment(currentTime).format('DD/MM/YYYY')
      default:
        return ''
    }
  }, [timeType, currentTime, currentTimeOptions, t])

  const titleTooltipChart = useMemo(() => {
    switch (timeType) {
      case 0: {
        const month = moment().month()
        const prevTime = moment().isoWeek(currentTime - 1)
        const isSameMonth = prevTime.month() === month
        return {
          pTitle: labelStudyTimeChart,
          sTitle: t('week_of_month', {
            week: isSameMonth ? 1 : getWeekOfMonthFromISOWeek(currentTime - 1),
            monthName: moment().month(month).format('MMM'),
            month
          })
        }
      }
      case 1:
        return {
          pTitle: moment().month(currentTime).format('MMM'),
          sTitle: moment().month(currentTime - 1).format('MMM')
        }
      case 2:
        return {
          pTitle: t('year_number', { year: currentTime }),
          sTitle: t('year_number', { year: currentTime - 1 })
        }
      case 3:
        return {
          pTitle: moment(currentTime).format('DD/MM/YYYY'),
          sTitle: moment(currentTime).subtract(1, 'day').format('DD/MM/YYYY')
        }
      default:
        return {}
    }
  }, [timeType, currentTime, t, labelStudyTimeChart])

  const labelComparisonChart = useMemo(() => {
    switch (timeType) {
      case 0:
        return t('study_time_compared_to_last_week')
      case 1:
        return t('study_time_compared_to_last_month')
      case 2:
        return t('study_time_compared_to_last_year')
      case 3:
        return t('study_time_compared_to_last_day')
      default:
        return ''
    }
  }, [timeType, t])

  const colorSubjects = useMemo(() => {
    if (mode === Mode.Question) return getRandomColors(studyTimeDistributionData.length)
    return studyTimeDistributionData.map((i) => {
      if (i.color) return i.color
      const [r, g, b] = getRandomRGB()
      return rgbToHex(r, g, b)
    })
  }, [studyTimeDistributionData, mode])

  const subjectStudyTimeData = useMemo(() => {
    if (!subjectCumulativeData) return []

    if (mode === Mode.Question && 'categories' in subjectCumulativeData) {
      const qPData = subjectCumulativeData.pData as QuestionData[]
      const qSData = subjectCumulativeData.sData as QuestionData[]
      return subjectCumulativeData.categories.map((item, index) => ({
        ...item,
        ...(qPData?.[index] || {}),
        change:
          (qPData?.[index]?.totalAnsweredQuestions || 0) -
          (qSData?.[index]?.totalAnsweredQuestions || 0)
      }))
    }

    if (!('subjects' in subjectCumulativeData)) return []
    const numericPData = subjectCumulativeData.pData as number[]
    const numericSData = subjectCumulativeData.sData as number[]
    return subjectCumulativeData.subjects.map((item, index) => ({
      ...item,
      hours: (numericPData?.[index] || 0) / MILLISECONDS_PER_HOUR,
      lastHours: (numericSData?.[index] || 0) / MILLISECONDS_PER_HOUR,
      change: ((numericPData?.[index] || 0) - (numericSData?.[index] || 0)) / MILLISECONDS_PER_HOUR
    }))
  }, [subjectCumulativeData, mode])

  const subjectOptions = useMemo(
    () =>
      subjects.map((s) => ({
        label: s.id === 0 ? t('filter_all', s.name) : s.name,
        value: s.id
      })),
    [subjects, t]
  )

  const isDisableNavigation = useCallback(
    (time: number, type: 'PREVIOUS' | 'NEXT' = 'PREVIOUS') => {
      if (type === 'PREVIOUS') {
        return time === currentTimeOptions[0]?.value
      }
      return time === currentTimeOptions[currentTimeOptions.length - 1]?.value
    },
    [currentTimeOptions]
  )

  const handlePrevious = () => {
    if (isDisableNavigation(currentTime, 'PREVIOUS')) return
    const currentIndex = currentTimeOptions.findIndex((i) => i.value === currentTime)
    if (currentIndex > 0) {
      handleChangeCurrentTime(currentTimeOptions[currentIndex - 1].value)
    }
  }

  const handleNext = () => {
    if (isDisableNavigation(currentTime, 'NEXT')) return
    const currentIndex = currentTimeOptions.findIndex((i) => i.value === currentTime)
    if (currentIndex >= 0 && currentIndex < currentTimeOptions.length - 1) {
      handleChangeCurrentTime(currentTimeOptions[currentIndex + 1].value)
    }
  }

  return {
    t,
    data,
    isStudent,
    colorSubjects,
    rankingData,
    categoryStudyTimeCharts,
    labelStudyTimeChart,
    labelComparisonChart,
    subjectCumulativeData,
    loadingData,
    visible,
    handleToggle,
    studyTimeDistributionData,
    loadingSubjectData,
    loadingRankingData,
    subjectStudyTimeData,
    loadingSubjectCumulativeData,
    titleTooltipChart,
    timeType,
    isAdminOrNonAcademy,
    currentTime,
    handlePrevious,
    handleNext,
    loadingSubjects,
    isDisableNavigation,
    handleChangeTimeType,
    handleChangeCurrentTime,
    subjectOptions,
    currentTimeOptions,
    selectedSubject,
    handleChangeSubject,
    summaryData,
    performanceData,
    weaknessData,
    todayData: dailyData?.today ?? summaryData?.today ?? null,
    subjectDataRequest,
    loadingSummary,
    loadingAnalysis,
    loadingWeakness,
    loadingToday: loadingDaily,
    dailyData,
    loadingDaily
  }
}

export default useStudyPerformanceData
