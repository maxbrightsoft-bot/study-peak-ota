import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getDataApi,
  getQuestionDataApi,
  getQuestionOverallDataApi,
  getQuestionRankingDataApi,
  getQuestionSubjectDataApi,
  getRankingDataApi,
  getSubjectDataApi,
  getSubjectListApi
} from '../apiClients'
import { MILLISECONDS_PER_HOUR, Mode, timeTypeOptions } from '../configs/constants'
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
} from '../configs/helper'
import {
  Category,
  DataResponse,
  Option,
  QuestionAnswerOverallResponse,
  RankingDataResponse,
  StudyTimeDistribution,
  Subject,
  SubjectDataNumberResponse,
  SubjectDataQuestionResponse,
  SubjectResponse
} from '../configs/types'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import _ from 'lodash'
import { Role } from '@/utils/enums'
import useAuthStore from '@/store/useAuthStore'
import { getErrorMessage, toast } from '@/utils/helpers'

type Props = {
  studentId?: number
  mode?: Mode
}

const useStudyPerformanceData = ({ mode = Mode.Timer, studentId }: Props) => {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const academyDomain = user?.academyDomain
  const [visible, setVisible] = useState(false)
  const isStudent = user?.roles?.includes(Role.Student)
  const isSuperAdmin = (user?.roles || []).includes(Role.Admin) && !academyDomain

  const isLearningSpace = user?.isLearningSpace

  const handleToggle = () => {
    setVisible((prev) => !prev)
  }

  const isAcademy = isLearningSpace || !!academyDomain
  const isAdminOrNonAcademy = !isAcademy || isSuperAdmin

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
  const [overallData, setOverallData] = useState<QuestionAnswerOverallResponse>()

  const [subjectData, setSubjectData] = useState<any>()
  const [subjectCumulativeData, setSubjectCumulativeData] = useState<any>()

  const [subjects, setSubjects] = useState<SubjectResponse[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number>()
  const timeTypes = useMemo(() => timeTypeOptions(t), [t])

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

  const subjectDataRequest = useMemo(() => {
    switch (timeType) {
      case 0:
        return {
          studentId,
          pTimes: getWeekTimestampArray(currentTime),
          sTimes: getWeekTimestampArray(currentTime - 1)
        }
      case 1:
        const pYear = moment().year()
        const sYear = currentTime === 0 ? moment().add(-1, 'y').year() : moment().year()
        return {
          studentId,
          pTimes: getMonthTimeStampArray(currentTime, pYear),
          sTimes: getMonthTimeStampArray(currentTime > 0 ? currentTime - 1 : 11, sYear)
        }
      case 2:
        return {
          studentId,
          pTimes: getYearTimeStampArray(currentTime),
          sTimes: getYearTimeStampArray(currentTime - 1)
        }
      case 3:
        return {
          studentId,
          pTimes: getDayTimestampArray(currentTime),
          sTimes: getDayTimestampArray(moment(currentTime).subtract(1, 'day').valueOf())
        }
      default:
        return { pTimes: [], sTimes: [] }
    }
  }, [timeType, currentTime, studentId, timeTypes])

  const handleGetData = async () => {
    if (mode === Mode.Question && !selectedSubject) return
    setLoadingData(true)
    try {
      const res =
        mode === Mode.Timer
          ? await getDataApi(isAdminOrNonAcademy, {
              ...subjectDataRequest,
              retrieveCumulative: false
            })
          : await getQuestionDataApi(selectedSubject!, {
              ...subjectDataRequest,
              retrieveCumulative: false
            })
      setData(res.data)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoadingData(false)
  }

  const handleGetSubjectData = async () => {
    if (mode === Mode.Question && !selectedSubject) return
    setLoadingSubjectData(true)

    try {
      const res =
        mode === Mode.Timer
          ? await getSubjectDataApi(isAdminOrNonAcademy, {
              ...subjectDataRequest,
              retrieveCumulative: false
            })
          : await getQuestionSubjectDataApi(selectedSubject!, {
              ...subjectDataRequest,
              retrieveCumulative: false
            })
      setSubjectData(res.data)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoadingSubjectData(false)
  }

  const handleGetSubjectCumulativeData = async () => {
    if (mode === Mode.Question && !selectedSubject) return
    setLoadingSubjectCumulativeData(true)
    try {
      const dataRequest = {
        studentId,
        pTimes: [moment().startOf('day').valueOf(), moment().endOf('day').valueOf()],
        sTimes: [moment().add(-1, 'd').startOf('day').valueOf(), moment().add(-1, 'd').endOf('day').valueOf()]
      }
      const res =
        mode === Mode.Timer
          ? await getSubjectDataApi(isAdminOrNonAcademy, {
              ...dataRequest,
              retrieveCumulative: true
            })
          : await getQuestionSubjectDataApi(selectedSubject!, {
              ...dataRequest,
              retrieveCumulative: true
            })

      setSubjectCumulativeData(res?.data)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoadingSubjectCumulativeData(false)
  }

  const handleGetRankingData = async () => {
    setLoadingRankingData(true)
    try {
      const dataRequest = {
        studentId,
        startTime: moment().startOf('day').valueOf(),
        endTime: moment().endOf('day').valueOf()
      }
      const res =
        mode === Mode.Timer
          ? await getRankingDataApi(isAdminOrNonAcademy, dataRequest)
          : await getQuestionRankingDataApi(dataRequest)
      setRankingData(res.data)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoadingRankingData(false)
  }

  const getSubjectList = async () => {
    if (mode !== Mode.Question) return
    setLoadingSubjects(true)
    try {
      const res = await getSubjectListApi(isAdminOrNonAcademy)
      setSubjects(res.data.items || [])
      if (res.data.items && res.data.items.length > 0) {
        setSelectedSubject(res.data.items[0]?.id)
      }
    } catch (error) {
      setSubjects([])
      toast.error(getErrorMessage(t, error))
    }
    setLoadingSubjects(false)
  }

  const handleGetOverallData = async () => {
    if (mode !== Mode.Question) return
    setLoadingData(true)
    try {
      const res = await getQuestionOverallDataApi({
        studentId,
        startTime: moment().startOf('day').valueOf(),
        endTime: moment().endOf('day').valueOf()
      })
      setOverallData(res.data)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoadingData(false)
  }

  useEffect(() => {
    if (!selectedSubject && mode === Mode.Question) return
    handleGetData()
    handleGetSubjectData()
  }, [timeType, currentTime, selectedSubject, load])

  useEffect(() => {
    handleGetSubjectCumulativeData()
  }, [selectedSubject, load])

  useEffect(() => {
    handleGetRankingData()
    getSubjectList()
    handleGetOverallData()
  }, [load])

  const studyTimeDistributionData: StudyTimeDistribution[] = useMemo(() => {
    if (!subjectData || !subjectData.pData) return []

    const cloneSubjectData = _.clone(subjectData)
    if (mode === Mode.Question) {
      const total =
        cloneSubjectData?.pData?.reduce(
          (acc: number, cur: StudyTimeDistribution) => acc + (cur?.totalAnsweredQuestions || 0),
          0
        ) || 1
      return cloneSubjectData?.categories
        ?.map((cat: Category, idx: number) => ({
          ...cat,
          ...cloneSubjectData?.pData[idx],
          correctRate: roundTo(cloneSubjectData.pData[idx]?.correctRate || 0, 2),
          percentage: roundTo(((cloneSubjectData.pData[idx]?.totalAnsweredQuestions || 0) / (total || 1)) * 100, 4)
        }))
        ?.sort((a: StudyTimeDistribution, b: StudyTimeDistribution) => (b?.correctRate || 0) - (a?.correctRate || 0))
    } else {
      const total = cloneSubjectData.pData.reduce((acc: number, cur: number) => acc + cur, 0) || 1

      return cloneSubjectData.subjects
        .map((subject: Subject, idx: number) => {
          const current = cloneSubjectData.pData[idx] || 0
          const previous = cloneSubjectData.sData?.[idx] || 0
          return {
            ...subject,
            hours: current / MILLISECONDS_PER_HOUR,
            lastHours: previous / MILLISECONDS_PER_HOUR,
            change: current / MILLISECONDS_PER_HOUR - previous / MILLISECONDS_PER_HOUR,
            percentage: roundTo((current / (total || 1)) * 100, 4)
          }
        })
        .sort((a: StudyTimeDistribution, b: StudyTimeDistribution) => (b?.hours || 0) - (a?.hours || 0))
    }
  }, [JSON.stringify(subjectData), mode])

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
          monthName: moment()
            .month(currentTime)
            .format('MMM'),
          month: currentTime + 1
        })} ~${t('week_of_month', {
          week:getWeekOfMonth(moment().month(currentTime).endOf('month')),
          monthName: moment()
            .month(currentTime)
            .format('MMM'),
          month: currentTime + 1
        })}`
      case 2:
        return currentTimeOptions.find((i) => i.value === currentTime)?.label
      case 3:
        return moment(currentTime).format('DD/MM/YYYY')
      default:
        return ''
    }
  }, [timeType, currentTime, currentTimeOptions])

  const titleTooltipChart = useMemo(() => {
    switch (timeType) {
      case 0:
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

      case 1:
        return {
          pTitle: moment().month(currentTime).format('MMM'),
          sTitle: moment()
            .month(currentTime - 1)
            .format('MMM')
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
  }, [timeType, currentTime, t, labelStudyTimeChart, timeTypes])

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

  const getColorSubjects = () => {
    return studyTimeDistributionData.map((i) => {
      if (i.color) return i.color
      else {
        const [r, g, b] = getRandomRGB()
        return rgbToHex(r, g, b)
      }
    })
  }

  const colorSubjects = useMemo(
    () => (mode === Mode.Question ? getRandomColors(studyTimeDistributionData?.length || 0) : getColorSubjects()),
    [JSON.stringify(studyTimeDistributionData), mode]
  )

  const subjectStudyTimeData = useMemo(() => {
    if (!subjectCumulativeData) return []

    if (mode === Mode.Question) {
      const data = subjectCumulativeData?.categories?.map((item: SubjectDataQuestionResponse, index: number) => ({
        ...item,
        ...subjectCumulativeData?.pData?.[index],
        change:
          (subjectCumulativeData?.pData?.[index]?.totalAnsweredQuestions || 0) -
          (subjectCumulativeData?.sData?.[index]?.totalAnsweredQuestions || 0)
      }))
      return data
    } else {
      const data = subjectCumulativeData?.subjects?.map((item: SubjectDataNumberResponse, index: number) => ({
        ...item,
        hours: subjectCumulativeData.pData[index] / MILLISECONDS_PER_HOUR,

        lastHours: subjectCumulativeData.sData[index] / MILLISECONDS_PER_HOUR,
        change:
          subjectCumulativeData.pData[index] / MILLISECONDS_PER_HOUR -
          subjectCumulativeData.sData[index] / MILLISECONDS_PER_HOUR
      }))
      return data
    }
  }, [JSON.stringify(subjectCumulativeData), mode])

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
    const currentIndex = currentTimeOptions.findIndex((i: any) => i.value === currentTime)
    if (currentIndex > 0) {
      handleChangeCurrentTime(currentTimeOptions[currentIndex - 1].value)
    }
  }

  const handleNext = () => {
    if (isDisableNavigation(currentTime, 'NEXT')) return
    const currentIndex = currentTimeOptions.findIndex((i: any) => i.value === currentTime)
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
    studyTimeDistributionData: _.clone(studyTimeDistributionData),
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
    ...(mode === Mode.Question && {
      overallData,
      subjectOptions: subjects?.map((s) => ({
        label: s.name,
        value: s.id
      })),
      currentTimeOptions,
      selectedSubject,
      handleChangeSubject
    })
  }
}

export default useStudyPerformanceData
