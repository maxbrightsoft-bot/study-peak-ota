import React, { FC } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ExamResult, LongTimeSpendQuestion, TextbookResult } from '@/utils/types'
import { ProblemKey } from '@/utils/enums'
import { formatTimeSecond } from '@/utils/helpers'
import MathRender from '@/components/MathRender'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  data: LongTimeSpendQuestion[]
  keyOpen: ProblemKey
  examResult: TextbookResult
  openProblem?: ProblemKey
  changeOpen?: (key?: ProblemKey) => void
  isPrint: boolean
}

const ProtractedProblem: FC<Props> = ({ keyOpen, data, openProblem, changeOpen, examResult, isPrint }) => {
  const { t } = useTranslation()
  const isOpen = openProblem === keyOpen || isPrint

  const renderRow = ({ item }: { item: LongTimeSpendQuestion }) => {
    const timeDiff = item.topDuration - item.duration
    const isBetter = timeDiff > 0

    return (
      <View style={styles.itemContainer}>
        <View style={styles.column1}>
          <Text style={styles.label}>
            {t('problem')} {item.questionOrder + 1}
          </Text>
        </View>
        <View style={styles.column2}>
          <Text style={styles.subLabel}>{t('my_time')}</Text>
          <Text style={styles.timeValue}>{formatTimeSecond(item.duration, t)}</Text>

          <Text style={styles.subLabel}>{t('top_time')}</Text>
          <Text style={styles.timeValue}>{formatTimeSecond(item.topDuration, t)}</Text>

          {item.duration && item.topDuration && (
            <>
              <Text style={styles.subLabel}>{t('time_comparison')}</Text>
              <Text style={[styles.timeDiff, { color: isBetter ? '#18442A' : '#D32F2F' }]}>
                {`${isBetter ? '' : '+'}${formatTimeSecond(Math.abs(timeDiff), t)}`}
              </Text>
            </>
          )}
        </View>

        {item.questionText && (
          <View style={{ marginTop: 12 }}>
            <MathRender content={item.questionText} />
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.header,
          !isOpen ? styles.closedHeader : { borderBottomWidth: 1, borderColor: palette.grey[100] }
        ]}
        onPress={() => changeOpen?.(isOpen ? undefined : keyOpen)}
      >
        <Text style={[styles.headerText, !isOpen && { color: palette.grey[500] }]}>
          {t('problems_that_took_a_long_time')}
        </Text>
        {isOpen ? (
          <Ionicons name="chevron-up" size={24} color="#E0E0E0" />
        ) : (
          <Ionicons name="chevron-down" size={24} color="#E0E0E0" />
        )}
      </TouchableOpacity>

      {isOpen && (
        <>
          {data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={renderRow}
              keyExtractor={(item) => `${item.id}`}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>{t('no_data')}</Text>
            </View>
          )}
        </>
      )}
    </View>
  )
}

export default ProtractedProblem

const styles = ScaledSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: palette.grey[100],
    backgroundColor: palette.grey[50]
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: '24@ms',
    paddingVertical: '12@ms',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closedHeader: {
    backgroundColor: '#FAFAFA'
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: palette.grey[700]
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: '24@ms',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EC'
  },
  column1: {
    width: 120,
    paddingRight: 12
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#414E62'
  },
  category: {
    fontSize: 13,
    textAlign: 'center',
    color: '#18442A',
    fontWeight: '500',
    marginTop: 4
  },
  column2: {
    flex: 1
  },
  subLabel: {
    fontSize: 12,
    color: '#97A1AF'
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#414E62',
    marginBottom: 4
  },
  timeDiff: {
    fontSize: 13,
    fontWeight: '600'
  },
  noDataContainer: {
    paddingVertical: '12@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  noDataText: {
    color: palette.grey[500],
    textAlign: 'center'
  }
})
