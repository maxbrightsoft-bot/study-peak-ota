export const TabList = [
  {
    label: 'time_data',
    value: 0
  },
  {
    label: 'performance_data',
    value: 1
  },
]


export const TOTAL_SECONDS_IN_A_MINUTE = 60
export const TOTAL_SECONDS_IN_AN_HOUR = 60 * 60

export const timeTypeOptions = (t?: any) => [
  {
    label: t('weekly_data'),
    value: 0
  },
  {
    label: t('monthly_data'),
    value: 1
  },
  {
    label: t('yearly_data'),
    value: 2
  },
]

export enum TypeText { 'study', 'average', 'compare' }

export enum Mode { Timer, Question }

export const MILLISECONDS_PER_HOUR = 60 * 60 * 1000