import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import BronzeMedal from '@/assets/iconJSX/bronzeMedal'
import SilverMedal from '@/assets/iconJSX/silverMedal'
import GoldMedal from '@/assets/iconJSX/goldMedal'

import { Ranking, RankingDataResponse } from '../configs/types'
import { formatTime, roundTo } from '../configs/helper'
import { palette } from '@/theme'
import { BRIEF_GRADE_OPTIONS } from '@/utils/constants'
import { formatGrade } from '@/utils/helpers'
import useAuthStore from '@/store/useAuthStore'
import { ActivityIndicator } from 'react-native-paper'

type Props = {
  loading: boolean
  data?: RankingDataResponse
  isTimerTab?: boolean
}

const iconMedal = (ranking: number) => {
  switch (ranking) {
    case 1:
    default:
      return <GoldMedal />
    case 2:
      return <SilverMedal />
    case 3:
      return <BronzeMedal />
  }
}

const MyRankingItem = ({ data, isTimerTab }: { data?: Ranking; isTimerTab: boolean }) => {
  const { language } = useAuthStore()
  const { t } = useTranslation()

  if (!data) return null

  return (
    <View style={styles.rankItem}>
      <View style={styles.rankIcon}>
        {data.rank ? data.rank > 100 ? <Text style={styles.rankText}>100+</Text> : iconMedal(data.rank) : null}
      </View>

      <View style={styles.rankInfo}>
        <View style={styles.row}>
          <Text style={styles.grayText}>{data.schoolName}</Text>
          <Text style={styles.grayText}>
            {`${
              !!data.grade &&
              t(
                ((label) => (label ? t(label) : formatGrade(data.grade, t, language.code)))(
                  BRIEF_GRADE_OPTIONS.find((o) => o.value === Number(data.grade))?.label
                )
              )
            } ${data.gradeYear ? `(${data.gradeYear})` : ''}`}
          </Text>
        </View>

        <Text style={styles.name}>{data.fullName}</Text>

        <Text style={styles.value}>
          {isTimerTab ? formatTime((data.totalTime || 0) / 1000, t) : `${roundTo(data.correctRate || 0, 2)}%`}
        </Text>
      </View>
    </View>
  )
}

const TopRankingItem = ({ data, isTimerTab }: { data: Ranking; isTimerTab: boolean }) => {
  const { language } = useAuthStore()
  const { t } = useTranslation()

  return (
    <View style={styles.rankItem}>
      <View style={styles.rankIcon}>{iconMedal(data.rank)}</View>

      <View style={styles.rankInfo}>
        <View style={styles.row}>
          <Text style={styles.grayText}>{data.schoolName}</Text>
          <Text style={styles.grayText}>
            {`${
              !!data.grade &&
              t(
                ((label) => (label ? t(label) : formatGrade(data.grade, t, language.code)))(
                  BRIEF_GRADE_OPTIONS.find((o) => o.value === Number(data.grade))?.label
                )
              )
            } ${data.gradeYear ? `(${data.gradeYear})` : ''}`}
          </Text>
        </View>

        <Text style={styles.name}>{data.fullName}</Text>

        <Text style={styles.value}>
          {isTimerTab ? formatTime((data.totalTime || 0) / 1000, t) : `${roundTo(data.correctRate || 0, 2)}%`}
        </Text>
      </View>
    </View>
  )
}

const Achievements = ({ data, loading, isTimerTab = true }: Props) => {
  const { t } = useTranslation()

  if (loading) {
    return (
      <View style={{ height: 300 }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.rowBetween}>
        <View style={styles.column}>
          <Text style={styles.title}>
            {t(isTimerTab ? 'today_net_study_time_ranking' : 'today_accuracy_rate_ranking')}
          </Text>
          {data?.topStudents?.map((item, idx) => (
            <TopRankingItem key={idx} data={item} isTimerTab={isTimerTab} />
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.title}>
            {t(isTimerTab ? 'overall_net_study_time_ranking' : 'overall_accuracy_rate_ranking')}
          </Text>
          {data?.topCumulativeStudents?.map((item, idx) => (
            <TopRankingItem key={idx} data={item} isTimerTab={isTimerTab} />
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.rowBetween}>
        <MyRankingItem data={data?.myRanking} isTimerTab={isTimerTab} />
        <MyRankingItem data={data?.myCumulativeRanking} isTimerTab={isTimerTab} />
      </View>
    </View>
  )
}

export default Achievements
const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 150
  },
  rowBetween: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    gap: 16
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    color: palette.grey[900]
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 16
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16
  },
  rankIcon: {
    width: 32,
    alignItems: 'center'
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280'
  },
  rankInfo: {
    gap: 4
  },
  row: {
    flexDirection: 'row',
    gap: 4
  },
  grayText: {
    fontSize: 11,
    fontWeight: '500',
    color: palette.grey[500]
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.main[500]
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.grey[700]
  }
})
