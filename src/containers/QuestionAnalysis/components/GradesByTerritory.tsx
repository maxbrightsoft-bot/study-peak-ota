import React, { FC } from 'react'
import { View, Text, ScrollView, useWindowDimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import { CategoryResponse } from '@/utils/types'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { formatDuration } from '@/utils/helpers'

type Props = {
  data: CategoryResponse[]
  isPrint: boolean
}

const GradesByTerritory = ({ data, isPrint }: Props) => {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()
  const tableWidth = width - 40

  const styles = ScaledSheet.create({
    wrapper: {
      borderRadius: '14@ms',
      overflow: 'hidden',
      backgroundColor: '#FFF'
    },
    header: {
      justifyContent: 'center',
      backgroundColor: palette.bg[100],
      paddingVertical: '12@ms',
      borderBottomWidth: '1@ms',
      borderColor: palette.grey[100]
    },
    headerText: {
      fontSize: '14@ms',
      fontWeight: 'bold',
      color: '#171719',
      textAlign: 'center'
    },
    contentContainer: {
      backgroundColor: '#FFF'
    },
    row: {
      flexDirection: 'row',
      minHeight: '44@ms',
      backgroundColor: '#FFF'
    },
    headerRow: {
      backgroundColor: palette.bg[100],
      borderBottomWidth: '1@ms',
      borderBottomColor: palette.grey[100]
    },
    rowBorder: {
      borderBottomWidth: '1@ms',
      borderBottomColor: palette.grey[200]
    },
    cell: {
      padding: '12@ms',
      justifyContent: 'center',
      borderRightWidth: '1@ms',
      borderRightColor: palette.grey[100]
    },
    cellCategory: {
      width: tableWidth / 3
    },
    cellNumeric: {
      width: tableWidth / 3,
      alignItems: 'center'
    },
    cellLast: {
      borderRightWidth: '1@ms',
      borderRightColor: palette.grey[100]
    },
    headerCell: {
      backgroundColor: palette.bg[100],
      justifyContent: 'center',
      alignItems: 'center'
    },
    headerCellText: {
      fontSize: '13@ms',
      fontWeight: 600,
      color: palette.grey[500]
    },
    cellText: {
      fontSize: '12@ms',
      fontWeight: '500',
      color: palette.grey[700]
    },
    boldText: {
      fontWeight: '700',
      color: palette.grey[900]
    },
    textCenter: {
      textAlign: 'center'
    },
    noDataContainer: {
      paddingVertical: '20@ms',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF'
    },
    noDataText: {
      color: palette.grey[500],
      textAlign: 'center',
      fontSize: '14@ms'
    }
  })

  const renderTableRows = (data: CategoryResponse[]) => {
    return data.map((item, index) => (
      <View key={item.id} style={[styles.row, index < data.length - 1 && styles.rowBorder]}>
        <View style={[styles.cell, styles.cellCategory]}>
          <Text style={[styles.cellText, styles.boldText, { paddingLeft: 8 }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        <View style={[styles.cell, styles.cellNumeric, { borderRightWidth: 0 }]}>
          <Text style={[styles.cellText, styles.boldText]}>{item?.percentageAmongStudents?.toFixed(2)}%</Text>
        </View>

        <View style={[styles.cell, styles.cellNumeric]}>
          <Text style={styles.cellText}>{item.totalSolvedTime ? formatDuration(t, item.totalSolvedTime) : ''}</Text>
        </View>
      </View>
    ))
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }]}>
        <Text style={styles.headerText}>{t('grades_by_area')}</Text>
        {data.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 11, color: palette.grey[500] }}>{t('scroll_horizontal', 'Vuốt ngang')}</Text>
            <Ionicons name="swap-horizontal" size={14} color={palette.grey[500]} />
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        {data.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              <View style={[styles.row, styles.headerRow]}>
                <View style={[styles.cell, styles.cellCategory, styles.headerCell]}>
                  <Text style={[styles.headerCellText]}>{t('categories')}</Text>
                </View>
                <View style={[styles.cell, styles.cellNumeric, styles.headerCell]}>
                  <Text style={[styles.headerCellText, styles.textCenter]}>{t('correct_rate')}</Text>
                </View>
                <View style={[styles.cell, styles.cellNumeric, styles.headerCell]}>
                  <Text style={[styles.headerCellText, styles.textCenter]}>{t('total_solve_time')}</Text>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={true}>{renderTableRows(data)}</ScrollView>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t('no_data')}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default GradesByTerritory
