import React, { FC, useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import OverallChartContainer from './components/OverallChartContainer'
import CategoriesOverallChartContainer from './components/CategoriesOverallChartContainer'
import OverallTimeChartContainer from './components/OverallTimeChartContainer'

interface OverallTabProps {
  overallChartContainerProps: any
  categoriesOverallChartContainerProps: any
  overallTimeChartContainerProps: any
  isPrint?: boolean
  onRendered?: () => void
}

const MyOverall: FC<OverallTabProps> = ({
  categoriesOverallChartContainerProps,
  overallChartContainerProps,
  overallTimeChartContainerProps,
  isPrint,
  onRendered
}) => {
  const [overallChartRendered, setOverallChartRendered] = useState<boolean>(false)
  const [categoriesOverallChartRendered, setCategoriesOverallChartRendered] = useState<boolean>(false)
  const [overallTimeChartsRendered, setOverallTimeChartsRendered] = useState<boolean>(false)

  const handleOverallChartRendered = () => {
    setOverallChartRendered(true)
  }
  const handleCategoriesOverallChartRendered = () => {
    setCategoriesOverallChartRendered(true)
  }
  const handleOverallTimeChartsRendered = () => {
    setOverallTimeChartsRendered(true)
  }

  useEffect(() => {
    if (overallChartRendered && categoriesOverallChartRendered && overallTimeChartsRendered) {
      onRendered?.()
    }
  }, [overallChartRendered, categoriesOverallChartRendered, overallTimeChartsRendered])

  return (
    <ScrollView style={[styles.container, isPrint && { marginTop: 230 }]}>
      <View style={styles.fullRow}>
        <View style={styles.fullWidth}>
          <OverallChartContainer
            {...overallChartContainerProps}
            onRendered={handleOverallChartRendered}
            isPrint={isPrint}
          />
        </View>
        <View style={styles.fullWidth}>
          <CategoriesOverallChartContainer
            {...categoriesOverallChartContainerProps}
            onRendered={handleCategoriesOverallChartRendered}
            isPrint={isPrint}
          />
        </View>
      </View>
      <View style={styles.fullWidth}>
        <OverallTimeChartContainer
          {...overallTimeChartContainerProps}
          onRendered={handleOverallTimeChartsRendered}
          isPrint={isPrint}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  printRow: {
    flexDirection: 'row'
  },
  fullRow: {
    flexDirection: 'column'
  },
  halfWidth: {
    width: '50%'
  },
  fullWidth: {
    width: '100%'
  }
})

export default MyOverall
