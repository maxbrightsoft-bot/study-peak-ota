import React, { FC } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, DataTable } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { CategoryResponse, TextbookResult } from '@/utils/types'
import { ProblemKey } from '@/utils/enums'
import { totalTextbookSolveTimeCategories } from '../configs/helpers'
import { formatDuration } from '@/utils/helpers'
import { CategoryFormat } from '../configs/types'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  data: CategoryResponse[]
  keyOpen: ProblemKey
  resultData: TextbookResult
  openProblem?: ProblemKey
  changeOpen?: (key?: ProblemKey) => void
  isPrint: boolean
}

const GradesByTerritory = ({ data, keyOpen, openProblem, changeOpen, resultData, isPrint }: Props) => {
  const { t } = useTranslation()
  const formattedData = totalTextbookSolveTimeCategories(resultData, data)
  const isOpen = openProblem === ProblemKey.GradesByTerritory || isPrint

  const renderTableRows = (data: CategoryFormat[]) => {
    return data.map((item) => (
      <DataTable.Row key={item.id} style={styles.row}>
        <DataTable.Cell style={styles.column1}>
          <Text style={[styles.cellText, styles.boldText]}>{item.name}</Text>
        </DataTable.Cell>
        <DataTable.Cell numeric>
          <Text style={[styles.cellText, styles.boldText]}>{item?.percentageAmongStudents?.toFixed(2)}%</Text>
        </DataTable.Cell>
        {/* <DataTable.Cell numeric>
                <Text style={styles.cellText}>{item.totalCorrectQuestions}</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Text style={styles.cellText}>{item.totalQuestions}</Text>
              </DataTable.Cell> */}
        <DataTable.Cell numeric>
          <Text style={styles.cellText}>{formatDuration(t, item.totalSolveTime)}</Text>
        </DataTable.Cell>
      </DataTable.Row>
    ))
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
        <Text style={[styles.headerText, !isOpen && { color: palette.grey[500] }]}>{t('grades_by_area')}</Text>
        {isOpen ? (
          <Ionicons name="chevron-up" size={24} color="#E0E0E0" />
        ) : (
          <Ionicons name="chevron-down" size={24} color="#E0E0E0" />
        )}
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.contentContainer}>
          {formattedData.length ? (
            <DataTable>
              <DataTable.Header style={{ backgroundColor: palette.grey[50] }}>
                <DataTable.Title style={{ borderRightWidth: 1, borderColor: palette.grey[300] }}>
                  <Text style={styles.cellText}>{t('categories')}</Text>
                </DataTable.Title>
                <DataTable.Title numeric>
                  <Text style={styles.cellText}>{t('correct_rate')}</Text>
                </DataTable.Title>
                <DataTable.Title numeric>
                  <Text style={styles.cellText}>{t('total_solve_time')}</Text>
                </DataTable.Title>
              </DataTable.Header>
              {renderTableRows(formattedData)}
            </DataTable>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>{t('no_data')}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = ScaledSheet.create({
  wrapper: {
    marginBottom: 150,
    backgroundColor: '#FFF'
  },
  header: {
    paddingHorizontal: '24@ms',
    paddingVertical: '12@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.grey[50]
  },
  closedHeader: {
    backgroundColor: '#FAFAFA'
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: palette.grey[700]
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700'
  },
  contentContainer: {},
  column1: {
    borderRightWidth: 1,
    borderColor: palette.grey[100]
  },
  boldText: {
    color: palette.grey[900]
  },
  cellText: {
    fontWeight: 600,
    color: palette.grey[700]
  },
  categoryContainer: {
    marginBottom: 12
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  categoryName: {
    fontWeight: '600',
    fontSize: 14
  },
  percentText: {
    fontWeight: '500',
    textAlign: 'right'
  },
  trackContainer: {
    height: 6,
    backgroundColor: '#FFF',
    marginTop: 6
  },
  row: {},
  track: {
    height: 6,
    backgroundColor: '#FFF',
    borderRadius: 3
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

export default GradesByTerritory
