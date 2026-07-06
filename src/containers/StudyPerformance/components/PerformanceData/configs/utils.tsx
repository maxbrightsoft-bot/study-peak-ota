import React from 'react'
import { View, Text } from 'react-native'
import moment from 'moment'
import { ss } from '../styles/styles'

export const getCategoryLabel = (item: any) =>
  item?.questionTypeName || item?.subCategoryName || item?.name || item?.categoryName || '-'

export const getStrengthLabel = (item: any) =>
  typeof item === 'string' ? item : `${getCategoryLabel(item)}${item?.accuracy ? ` ${item.accuracy}%` : ''}`

export const getClampedPercent = (value: number) => Math.max(0, Math.min(100, value || 0))

export const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <View style={ss.emptyState}>
    <Text style={ss.emptyTitle}>{title}</Text>
    <Text style={ss.emptyDesc}>{description}</Text>
  </View>
)

export const getPrefix = (timeType: number) => {
  if (timeType === 3) return 'day'
  if (timeType === 0) return 'week'
  if (timeType === 2) return 'year'
  return 'month'
}

export const tPeriod = (t: any, timeType: number, key: string, fallback?: string) => {
  return t(`${getPrefix(timeType)}.${key}`, t(`month.${key}`, fallback))
}

export const getChartBarLabel = (timeType: number, timestamp: number, idx: number, t: any): string => {
  if (timeType === 3) {
    const h = idx * 3
    return `${String(h).padStart(2, '0')}h`
  }
  if (timeType === 0) {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const dayKey = days[idx]
    return dayKey ? t(dayKey) : moment(timestamp).format('ddd')
  }
  if (timeType === 1) return `${t('week_short')}${idx + 1}`
  if (timeType === 2) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const monthKey = months[idx]
    return monthKey ? t(monthKey) : moment().month(idx).format('MMM')
  }
  return moment(timestamp).format('MM/DD')
}
