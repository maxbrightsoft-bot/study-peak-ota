import { palette } from '@/theme'
import { ceilTo } from '@/utils/helpers'
import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Divider } from 'react-native-paper'
import { MILLISECONDS_PER_HOUR } from '../configs/constants'
import { sum } from '../configs/helper'

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

  const accumulatedTime = ceilTo((data?.totalTime || 0) / MILLISECONDS_PER_HOUR, 2)

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
          {`${value >= 0 ? '+' : '-'}${ceilTo(Math.abs(value), 2)}${suffix}`}
        </Text>
        {arrow && <Text style={{ color, fontSize: 16, marginLeft: 4 }}>{arrow}</Text>}
      </View>
    )
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.card, { borderColor: palette.main[500] }]}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: palette.grey[900] }]}>{t('today_net_study_time')}</Text>
            <View style={styles.timeRow}>
              <Text style={[styles.timeValue, { color: palette.grey[900] }]}>{ceilTo(currentValue, 2)}</Text>
              <Text style={[styles.timeUnit, { color: palette.grey[500] }]}>{isTimerTab ? t('hour') : '%'}</Text>
            </View>
          </View>
          <Divider />
          <View style={styles.bottomRow}>
            <View style={styles.timeRow}>
              <Text style={[styles.subValue, { color: palette.grey[500] }]}>{t('compared_to_yesterday')}</Text>
              {renderChangeText(change, isTimerTab ? t('hour') : '%')}
            </View>
            <View style={styles.timeRow}>
              <Text style={[styles.subValue, { color: palette.grey[500] }]}>
                {isTimerTab ? t('accumulated') : t('total_number_questions_solved')}
              </Text>
              <Text style={[styles.subUnit, { color: palette.grey[900] }]}>
                {isTimerTab ? (
                  `${accumulatedTime}${t('hour')}`
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
        <Pressable onPress={onOpen}>
          <Text style={[styles.moreText, { color: palette.main[500] }]}>더보기</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default TodayStudyTimeCard

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 100
  },
  card: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  content: {
    gap: 8,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  title: {
    fontSize: 16,
    fontWeight: '700'
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700'
  },
  timeUnit: {
    fontSize: 14,
    fontWeight: '500'
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center'
  },
  subValue: {
    fontSize: 13,
    fontWeight: '600'
  },
  subUnitBold: {
    fontSize: 16,
    fontWeight: '700'
  },
  subUnit: {
    fontSize: 14,
    fontWeight: '600'
  },
  moreText: {
    fontSize: 16,
    fontWeight: '700',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600'
  },
  unitText: {
    fontSize: 14,
    color: palette.grey[500]
  }
})
