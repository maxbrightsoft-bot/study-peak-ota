import React, { FC } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, DataTable } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { CategoryResponse, TextbookResult } from '@/utils/types'
import { ProblemKey } from '@/utils/enums'
import {  totalTextbookSolveTimeCategories } from '../configs/helpers'
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
          <Text style={styles.boldText}>{item.name}</Text>
        </DataTable.Cell>
        <DataTable.Cell numeric>{item.percentageAmongStudents.toFixed(2)}%</DataTable.Cell>
        <DataTable.Cell numeric>{item.totalCorrectQuestions}</DataTable.Cell>
        <DataTable.Cell numeric>{item.totalQuestions}</DataTable.Cell>
        <DataTable.Cell numeric>{formatDuration(t, item.totalSolveTime)}</DataTable.Cell>
      </DataTable.Row>
    ))
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.header, !isOpen && styles.closedHeader]}
        onPress={() => changeOpen?.(isOpen ? undefined : keyOpen)}
      >
        <Text style={[styles.headerText, !isOpen && { color: '#97A1AF' }]}>{t('grades_by_area')}</Text>
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
              <DataTable.Header>
                <DataTable.Title style={{ borderRightWidth: 1, borderColor: palette.grey[300]}}>{t('categories')}</DataTable.Title>
                <DataTable.Title numeric>{t('correct_rate')}</DataTable.Title>
                <DataTable.Title numeric>{t('number_of_correct_answers')}</DataTable.Title>
                <DataTable.Title numeric>{t('total_number_of_problems')}</DataTable.Title>
                <DataTable.Title numeric>{t('total_solve_time')}</DataTable.Title>
              </DataTable.Header>
              {renderTableRows(formattedData)}
            </DataTable>
          ) : (
            <Text>{t('no_data')}</Text>
          )}
        </View>
      )}
    </View>
  )
}

const styles = ScaledSheet.create({
  wrapper: {
    borderWidth: 1,
    marginBottom: 150,
    borderColor: palette.grey[100],
    paddingHorizontal: '24@ms',
    paddingVertical: '12@ms',
    backgroundColor: palette.grey[50]
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closedHeader: {
    backgroundColor: '#FAFAFA'
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: palette.grey[500]
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
  contentContainer: {
    borderColor: '#ccc',
    marginTop: 12
  },
  column1: {
    borderRightWidth: 1, 
    borderColor: palette.grey[300],
  },
  boldText: {
    fontWeight: '600'
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
    backgroundColor: '#E0E0E0',
    marginTop: 6
  },
  row: {
  },
  track: {
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 3
  }
})

export default GradesByTerritory
