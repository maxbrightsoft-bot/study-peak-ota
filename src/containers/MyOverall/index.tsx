import React, { FC, useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import OverallChartContainer, { OverallChartContainerProps } from './components/OverallChartContainer'
import CategoriesOverallChartContainer, {
  CategoriesOverallChartContainerProps
} from './components/CategoriesOverallChartContainer'
import OverallTimeChartContainer, { OverallTimeChartContainerProps } from './components/OverallTimeChartContainer'
import { ExamResult } from '@/utils/types'
import { useTranslation } from 'react-i18next'
import { SubjectType } from '@/utils/enums'

interface OverallTabProps {
  resultData: ExamResult | undefined
  overallChartContainerProps: OverallChartContainerProps
  categoriesOverallChartContainerProps: CategoriesOverallChartContainerProps
  subcategoriesOverallChartContainerProps?: CategoriesOverallChartContainerProps
  overallTimeChartContainerProps: OverallTimeChartContainerProps
  questionTypesOverallChartContainerProps?: CategoriesOverallChartContainerProps
  isPrint?: boolean
  onRendered?: () => void
}

const MyOverall: FC<OverallTabProps> = ({
  resultData,
  categoriesOverallChartContainerProps,
  subcategoriesOverallChartContainerProps,
  questionTypesOverallChartContainerProps,
  overallChartContainerProps,
  overallTimeChartContainerProps,
  isPrint,
  onRendered
}) => {
  const { t } = useTranslation()
  const [overallChartRendered, setOverallChartRendered] = useState<boolean>(false)
  const [categoriesOverallChartRendered, setCategoriesOverallChartRendered] = useState<boolean>(false)
  const [subcategoriesOverallChartRendered, setSubcategoriesOverallChartRendered] = useState<boolean>(false)
  const [questionTypesOverallChartRendered, setQuestionTypesOverallChartRendered] = useState<boolean>(false)
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

  const handleSubcategoriesOverallChartRendered = () => {
    setSubcategoriesOverallChartRendered(true)
  }
  const handleQuestionTypesOverallChartRendered = () => {
    setQuestionTypesOverallChartRendered(true)
  }

  useEffect(() => {
    if (
      overallChartRendered &&
      categoriesOverallChartRendered &&
      overallTimeChartsRendered &&
      subcategoriesOverallChartRendered &&
      (resultData?.type != SubjectType.Math || questionTypesOverallChartRendered)
    ) {
      onRendered?.()
    }
  }, [
    resultData?.type,
    overallChartRendered,
    categoriesOverallChartRendered,
    overallTimeChartsRendered,
    subcategoriesOverallChartRendered,
    questionTypesOverallChartRendered
  ])

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
            id="my-average-data"
            title={t('my_average_data')}
          />
        </View>
        <View style={styles.fullWidth}>
          <CategoriesOverallChartContainer
            {...subcategoriesOverallChartContainerProps}
            onRendered={handleSubcategoriesOverallChartRendered}
            isPrint={isPrint}
            id="subcategories-data"
            title={t('subcategories_data')}
          />
        </View>
        <View style={styles.fullWidth}>
          <CategoriesOverallChartContainer
            {...questionTypesOverallChartContainerProps}
            onRendered={handleQuestionTypesOverallChartRendered}
            isPrint={isPrint}
            id="question-types-data"
            title={t('question_types_data')}
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
    flexDirection: 'column'
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
