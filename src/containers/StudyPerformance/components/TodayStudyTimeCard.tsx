import { palette } from '@/theme'
import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Divider } from 'react-native-paper'
import { ceilTo, formatAccumulatedTime, formatAccumulatedTimeSplit, sum } from '../configs/helper'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  data: any
  isTimerTab?: boolean
  onOpen?: () => void
}

const TodayStudyTimeCard: React.FC<Props> = ({ data, isTimerTab, onOpen }) => {
  const { t } = useTranslation()
  const pData = isTimerTab ? data?.pData : data?.pData?.filter((i: any) => !!i?.correctRate)
  const sData = isTimerTab ? data?.sData : data?.sData?.filter((i: any) => i?.correctRate)

  const currentValue = isTimerTab
    ? sum(pData, undefined, true)
    : sum(pData, 'correctRate', false) / (pData?.length || 1)

  const lastValue = isTimerTab ? sum(sData, undefined, true) : sum(sData, 'correctRate', false) / (sData?.length || 1)

  const change = currentValue - lastValue

  const accumulatedTime = formatAccumulatedTime(data?.totalTime || 0, t)

  const totalAnsweredQuestions = sum(data?.pData, 'totalAnsweredQuestions', false)

  const renderChangeText = (value: number, suffix = '') => {
    const color = value >= 0 ? palette.success.main : palette.error.main
    const arrow =
      value > 0 ? (
        <MaterialIcons name="arrow-drop-up" size={24} color={palette.success.main} />
      ) : value < 0 ? (
        <MaterialIcons name="arrow-drop-down" size={24} color={palette.error.main} />
      ) : null

    return (
      <View style={styles.changeRow}>
        <Text style={[styles.changeText, { color }]}>
          {suffix === '%' ? `${value >= 0 ? '+' : '-'}${ceilTo(Math.abs(value), 2)}%` : `${value >= 0 ? '+' : '-'}${formatAccumulatedTime(Math.abs(value) * 3600000, t)}`}
        </Text>
        {arrow && <Text style={{ color, fontSize: 16}}>{arrow}</Text>}
      </View>
    )
  }

  return (
    <TouchableOpacity style={styles.wrapper} onPress={onOpen}>
      <View style={[styles.card]}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.title, { color: '#FFF', width: 100 }]}>{isTimerTab ? t('today_net_study_time') : t('today_correct_answer_rate')}</Text>
            <View style={styles.timeRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.timeValue, { color: '#FFF' }]}>{isTimerTab ? formatAccumulatedTimeSplit(currentValue * 3600000, t).value : ceilTo(currentValue, 2)}</Text>
                <Text style={[styles.timeUnit, { color: '#FFF' }]}>{isTimerTab ? formatAccumulatedTimeSplit(currentValue * 3600000, t).unit : '%'}</Text>
              </View>
              <View style={{ backgroundColor: palette.main[400], width: 1, height: 14 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.subValue, { color: '#FFF' }]}>{t('compared_to_yesterday')}</Text>
                {renderChangeText(change, isTimerTab ? 'time' : '%')}
              </View>
            </View>
          </View>
          <Divider style={{ backgroundColor: palette.main[500] }} />
          <View style={styles.bottomRow}>
            <Text style={[styles.subValue, { color: '#FFF' }]}>
              {isTimerTab ? t('accumulated') : t('total_number_questions_solved')}
            </Text>

            <View style={styles.timeRow}>
              <Text style={[styles.subUnit, { color: '#FFF' }]}>
                {isTimerTab ? (
                  `${accumulatedTime}`
                ) : (
                  <>
                    {totalAnsweredQuestions}
                    <Text style={styles.unitText}>{` ${t('question(s)')}`}</Text>
                  </>
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default TodayStudyTimeCard

const styles = ScaledSheet.create({
  wrapper: {},
  card: {
    paddingHorizontal: '20@ms',
    paddingVertical: '12@ms',
    backgroundColor: palette.main[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8@ms'
  },
  content: {
    gap: '8@ms',
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '16@ms'
  },
  title: {
    fontSize: '16@ms',
    fontWeight: '700'
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  timeValue: {
    fontSize: '16@ms',
    fontWeight: '700'
  },
  timeUnit: {
    fontSize: '14@ms',
    fontWeight: '500'
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '16@ms',
    alignItems: 'center'
  },
  subValue: {
    fontSize: '13@ms',
    fontWeight: '600'
  },
  subUnitBold: {
    fontSize: '16@ms',
    fontWeight: '700'
  },
  subUnit: {
    fontSize: '14@ms',
    fontWeight: '400'
  },
  moreText: {
    fontSize: '16@ms',
    fontWeight: '700'
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  changeText: {
    fontSize: '14@ms',
    fontWeight: '600'
  },
  unitText: {
    fontSize: '14@ms',
    color: "#FFF"
  }
})
