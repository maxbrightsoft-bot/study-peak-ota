import React, { FC } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import OverallTabHeader from './OverallHeaderTab'
import HexagonChart from './HexagonChart'
import { checkEmptyValue } from '../configs/helpers'

export interface CategoriesOverallChartContainerProps {
  isLoading?: boolean
  myData: number[]
  id?: string
  title?: string
  avgData: number[]
  categories: any[]
  isPrint?: boolean
  formatTooltip: (val: any) => string
  xAxisLabelFormatter?: (val: string, option: any) => any
  onRendered?: () => void
}

const CategoriesOverallChartContainer: FC<CategoriesOverallChartContainerProps> = ({
  isLoading,
  myData,
  title,
  avgData,
  categories,
  isPrint,
  id
}) => {
  const { t } = useTranslation()

  if(!checkEmptyValue(myData)) return null

  return (
    <View style={styles.container}>
      <OverallTabHeader title={title || ''} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      ) : (
        <HexagonChart
          id={id || ""}
          myData={myData}
          avgData={avgData}
          categories={categories}
          isPrint={isPrint}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
  },
  loadingContainer: {
    height: 400,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default CategoriesOverallChartContainer
