import React, { FC } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LongTimeSpendQuestion, TextbookResult } from '@/utils/types'
import { ProblemKey } from '@/utils/enums'
import { formatTimeSecond } from '@/utils/helpers'
import MathRender from '@/components/MathRender'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  data: LongTimeSpendQuestion[]
  examResult: TextbookResult
  isPrint: boolean
}

const ProtractedProblem: FC<Props> = ({ data, examResult, isPrint }) => {
  const { t } = useTranslation()

  const renderRow = ({ item }: { item: LongTimeSpendQuestion }) => {
    const timeDiff = item.topDuration - item.duration
    const isBetter = timeDiff > 0
    const studentQuestion = examResult?.studentQuestionResults?.find((i) => i.id === item.id)
    const category = studentQuestion?.categories?.[0]

    return (
      <View style={styles.itemContainer}>
        <View style={styles.column1}>
          <Text style={styles.label}>
            {t('problem')} {item.questionOrder + 1}
          </Text>
          {category?.name && <Text style={styles.category}>{category.name}</Text>}
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
      <View
        style={{
          justifyContent: 'center',
          backgroundColor: palette.bg[100],
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderColor: palette.grey[100]
        }}
      >
        <Text style={[styles.headerText]}>
          {t('problems_that_took_a_long_time')}
        </Text>
      </View>

      <View>
        {data.length > 0 ? (
          <FlatList
            data={data}
            renderItem={renderRow}
            keyExtractor={(item) => `${item.id}`}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t('no_data')}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default ProtractedProblem

const styles = ScaledSheet.create({
  wrapper: {
    borderRadius: '14@ms',
    overflow: 'hidden',
    backgroundColor: '#FFF'
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
    fontSize: '14@ms',
    fontWeight: 'bold',
    color: '#171719',
    textAlign: 'center'
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#E4E7EC'
  },
  column1: {
    width: '90@ms',
    paddingRight: '8@ms'
  },
  label: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#414E62'
  },
  category: {
    fontSize: '12@ms',
    color: '#18442A',
    fontWeight: '500',
    marginTop: '2@ms'
  },
  column2: {
    flex: 1
  },
  subLabel: {
    fontSize: '12@ms',
    color: '#97A1AF'
  },
  timeValue: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#414E62',
    marginBottom: '4@ms'
  },
  timeDiff: {
    fontSize: '13@ms',
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

