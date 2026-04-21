import { useMemo } from 'react'

import { Formik } from 'formik'
import * as Yup from 'yup'
import { ScheduleFormData, ScheduleResponse } from '../../configs/type'
import _ from 'lodash'
import { DEFAULT_SCHEDULE_FORM_DATA } from '../../configs/constants'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { timeSpanToLocalMoment } from '@/utils/helpers'
import moment from 'moment'
import ScheduleForm from '../ScheduleForm'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (values: ScheduleFormData) => void
  schedule?: ScheduleResponse
  t: any
  selectedDate: {
    startDate: string
    endDate: string
    currentDate: string
    isTotalMonth: boolean
  }
}

const schema = (t: any) =>
  Yup.object().shape({
    date: Yup.date().required(t('date_required')),
    startTime: Yup.string().required(t('start_time_required')),
    endTime: Yup.string().required(t('end_time_required')),
    title: Yup.string().required(t('title_required'))
  })

const CreateNewScheduleDialog = ({ t, onClose, open, onSubmit, schedule, selectedDate }: Props) => {
  const convertScheduleRequest = (): ScheduleFormData | undefined => {
    if (!schedule) return undefined
    return {
      ...schedule,
      date: schedule.date ? moment.utc(schedule.date).local() : null,
      startTime: schedule.startTime ? timeSpanToLocalMoment(schedule.startTime, schedule.date) : null,
      endTime: schedule.endTime ? timeSpanToLocalMoment(schedule.endTime, schedule.date) : null
    }
  }

  const scheduleRequest = useMemo(convertScheduleRequest, [JSON.stringify(schedule)])

  return (
    <CommonDialog
      isVisible={open}
      onClose={onClose}
      submitText={t('next')}
      title={!!scheduleRequest ? t('update_schedule') : t('add_new_schedule')}
    >
      <Formik initialValues={DEFAULT_SCHEDULE_FORM_DATA} validationSchema={() => schema(t)} onSubmit={onSubmit}>
        {(formikProp) => (
          <ScheduleForm
            open={open}
            formikProp={formikProp}
            scheduleRequest={scheduleRequest}
            onClose={onClose}
            selectedDate={selectedDate}
          />
        )}
      </Formik>
    </CommonDialog>
  )
}

export default CreateNewScheduleDialog
