import { t } from "i18next"
import _ from "lodash"
import moment from "moment"
import { useState, useRef, useMemo, useEffect } from "react"

import {
  updateTimerByIdApi,
  updateSuperTimerByIdApi,
  updateTimersApi,
  updateSuperTimersApi,
  getTimerByIdApi,
  getSuperTimerByIdApi,
  getTimersApi,
  getSuperTimersApi
} from "../../services/api/subjectService"

import { formatTime, getTime } from "../configs/fn"

import {
  Timer,
  SubjectTimerRequest,
  SubjectTimersRequest,
  RecordItem,
  TimeLine
} from "../configs/types"

import { SubjectTimerResponse } from "../../utils/types"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import { TimerStatus } from "@/utils/enums"
import { DATE_TIME_MIN_VALUE } from "@/utils/constants"

const useTimeUpdate = (
  open: boolean,
  onClose: () => void,
  data?: SubjectTimerResponse
) => {
  const { user, setLoading } = useAuthStore()
  const [currentTimeLines, setCurrentTimeLines] = useState<Timer[]>([])
  const [loading, setIsLoading] = useState(false)
  const [value, setValue] = useState(0)
  const [selectedDate, setSelectedDate] = useState<moment.Moment>()
  const [timeErrors, setTimeErrors] = useState<Record<number, boolean>>({})

  const today = moment()
  const originTimeLine = useRef<Timer[]>([])

  const academyDomain = user?.academyDomain?.toLowerCase?.() ?? ""
  const onAcademy = academyDomain || user?.isLearningSpace

  const handleTimeErrors = (index: number, val: boolean) => {
    setTimeErrors(prev => ({ ...prev, [index]: val }))
  }

  const getTimerDetail = async () => {
    if (!data) return
    setIsLoading(true)
    try {
      const getTimer = onAcademy ? getTimerByIdApi : getSuperTimerByIdApi
      const res = await getTimer(data.id, data.timerId)
      setCurrentTimeLines([res.data])
      originTimeLine.current = [res.data]
    } catch (error) {
      toast.error(getErrorMessage(t, error))
      setCurrentTimeLines([])
      originTimeLine.current = []
    } finally {
      setIsLoading(false)
    }
  }

  const getTimersByDate = async () => {
    if (!data || !selectedDate) return
    setIsLoading(true)

    const startDate = selectedDate.clone().startOf("day").utc().valueOf()
    const endDate = selectedDate.clone().endOf("day").utc().valueOf()

    try {
      const getTimers = onAcademy ? getTimersApi : getSuperTimersApi
      const res = await getTimers(data.id, { startDate, endDate })
      setCurrentTimeLines(res.data?.items ?? [])
      originTimeLine.current = res.data?.items ?? []
    } catch (error) {
      toast.error(getErrorMessage(t, error))
      setCurrentTimeLines([])
      originTimeLine.current = []
    } finally {
      setIsLoading(false)
    }
  }

  const updateTimer = async () => {
    if (!data || !currentTimeLines[0]) return
    setLoading(true)
    try {
      const reqData: SubjectTimerRequest = {
        id: data.timerId,
        records: currentTimeLines[0].records.map(r => ({
          id: r.id,
          startedAt: moment.utc(r.startedAt).valueOf(),
          stoppedAt: moment.utc(r.stoppedAt).valueOf()
        }))
      }

      const update = onAcademy ? updateTimerByIdApi : updateSuperTimerByIdApi
      await update(data.id, data.timerId, reqData)
      await getTimerDetail()
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoading(false)
    }
  }

  const updateTimers = async () => {
    if (!data || !selectedDate) return
    setLoading(true)
    try {
      const reqData: SubjectTimersRequest = {
        startDate: selectedDate.clone().startOf("day").utc().valueOf(),
        endDate: selectedDate.clone().endOf("day").utc().valueOf(),
        timers: currentTimeLines
          .map(timer => ({
            ...timer,
            records: timer.records.map(r => ({
              id: r.id,
              startedAt: moment.utc(r.startedAt).valueOf(),
              stoppedAt: moment.utc(r.stoppedAt).valueOf()
            }))
          }))
          .filter(t => t.records.length > 0)
      }

      const update = onAcademy ? updateTimersApi : updateSuperTimersApi
      await update(data.id, reqData)
      await getTimersByDate()
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoading(false)
    }
  }

  /* ===================== HANDLERS ===================== */

  const handleUpdateTime = (item: RecordItem, newTime: moment.Moment) => {
    const timer = currentTimeLines[item.timerIndex]
    const record = _.clone(timer.records[item.recordIndex])

    if (item.status === TimerStatus.Started)
      record.startedAt = newTime.utc().toISOString()
    else record.stoppedAt = newTime.utc().toISOString()

    if (record.stoppedAt !== DATE_TIME_MIN_VALUE) {
      record.totalTime = moment
        .utc(record.stoppedAt)
        .diff(moment.utc(record.startedAt), "milliseconds")
    }

    const records = [
      ...timer.records.slice(0, item.recordIndex),
      record,
      ...timer.records.slice(item.recordIndex + 1)
    ]

    const newTimer = {
      ...timer,
      records,
      duration: records.reduce((a, c) => a + c.totalTime, 0)
    }

    setCurrentTimeLines(prev => [
      ...prev.slice(0, item.timerIndex),
      newTimer,
      ...prev.slice(item.timerIndex + 1)
    ])
  }

  const handleAddRecord = (item: RecordItem, newRecord: TimeLine) => {
    const timer = currentTimeLines[item.timerIndex]

    const records = [
      ...timer.records.slice(0, item.recordIndex),
      newRecord,
      ...timer.records.slice(item.recordIndex)
    ]

    const newTimer = {
      ...timer,
      records,
      duration: records.reduce((a, c) => a + c.totalTime, 0)
    }

    setCurrentTimeLines(prev => [
      ...prev.slice(0, item.timerIndex),
      newTimer,
      ...prev.slice(item.timerIndex + 1)
    ])
  }

  const handleDeleteRecord = (item: RecordItem) => {
    const timer = currentTimeLines[item.timerIndex]

    const records = [
      ...timer.records.slice(0, item.recordIndex),
      ...timer.records.slice(item.recordIndex + 1)
    ]

    const newTimer = {
      ...timer,
      records,
      duration: records.reduce((a, c) => a + c.totalTime, 0)
    }

    setCurrentTimeLines(prev => [
      ...prev.slice(0, item.timerIndex),
      newTimer,
      ...prev.slice(item.timerIndex + 1)
    ])
  }

  const handleRemoveTimer = (timerIndex: number) => {
    setCurrentTimeLines(prev => [
      ...prev.slice(0, timerIndex),
      ...prev.slice(timerIndex + 1)
    ])
  }

  const handleAddTimer = (timerIndex: number, newTimer: Timer) => {
    setCurrentTimeLines(prev => [
      ...prev.slice(0, timerIndex),
      newTimer,
      ...prev.slice(timerIndex)
    ])
  }

  const handleAddNextTimer = (newTimer: Timer) => {
    setCurrentTimeLines(prev => [...prev, newTimer])
  }

  const handleChangeDate = (date: Date) => {
    setSelectedDate(moment(date))
  }

  const handleChange = (newValue: number) => {
    setValue(newValue)
    setCurrentTimeLines([])
  }

  const handleClose = () => {
    onClose()
    setValue(0)
  }

  const handleUpdateTimerRecords = () => {
    value ? updateTimers() : updateTimer()
  }

  const flatData = useMemo(() => {
    return currentTimeLines.flatMap((timer, timerIndex) =>
      timer.records.flatMap((r, recordIndex) => {
        const items: RecordItem[] = [
          {
            id: r.id,
            timer,
            time: r.startedAt,
            recordIndex,
            timerIndex,
            status: TimerStatus.Started,
            isStart: recordIndex === 0
          }
        ]

        if (r.stoppedAt !== DATE_TIME_MIN_VALUE) {
          items.push({
            id: r.id,
            timer,
            time: r.stoppedAt,
            recordIndex,
            timerIndex,
            status:
              recordIndex === timer.records.length - 1 &&
              (timer.status === TimerStatus.Stopped || timer.limitedTimeReached)
                ? TimerStatus.Stopped
                : TimerStatus.Paused,
            isStart: false
          })
        }

        return items
      })
    )
  }, [currentTimeLines, selectedDate?.valueOf(), value])

  const totalTime = useMemo(() => {
    return formatTime(
      Math.floor(
        currentTimeLines.reduce((a, c) => a + getTime(c), 0) / 1000
      ),
      t
    )
  }, [currentTimeLines, t])

  const isEdited = useMemo(
    () =>
      JSON.stringify(originTimeLine.current) !==
      JSON.stringify(currentTimeLines),
    [currentTimeLines]
  )

  const isTimeError = useMemo(
    () => Object.values(timeErrors).some(Boolean),
    [timeErrors]
  )

  useEffect(() => {
    if (value === 1) setSelectedDate(today)
  }, [value])

  useEffect(() => {
    if (!open) {
      setCurrentTimeLines([])
      setSelectedDate(undefined)
    }
  }, [open])

  useEffect(() => {
    if (open && value === 0) getTimerDetail()
  }, [open, value, data?.id, data?.timerId])

  useEffect(() => {
    if (open && value === 1) getTimersByDate()
  }, [open, value, selectedDate?.valueOf(), data?.id])

  return {
    isTimeError,
    value,
    selectedDate,
    loading,
    flatData,
    isEdited,
    totalTime,
    currentTimeLines,
    today,
    handleUpdateTimerRecords,
    handleChangeDate,
    handleAddNextTimer,
    handleClose,
    handleDeleteRecord,
    handleAddRecord,
    handleUpdateTime,
    handleAddTimer,
    handleRemoveTimer,
    handleChange,
    handleTimeErrors
  }
}

export default useTimeUpdate
