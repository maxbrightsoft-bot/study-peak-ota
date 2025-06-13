import { t } from 'i18next'
import React, { Dispatch, FC, RefObject, SetStateAction } from 'react'
import { Text, View } from 'react-native'
import ExamOverView from '../components/ExamOverView'
import ExamMyAnswer from '@/containers/MyAnswer/views/ExamMyAnswer'
import TextbookMyAnswer from '@/containers/MyAnswer/views/TextbookMyAnswer'
import {
  CategoryResponse,
  ExamResult,
  LongTimeSpendQuestion,
  QuestionTimeCategoryData,
  TextbookResult
} from '@/utils/types'
import { ScaledSheet } from 'react-native-size-matters'
import ExamQuestionAnalysis from '@/containers/QuestionAnalysis/views/ExamQuestionAnalysis'
import TextbookQuestionAnalysis from '@/containers/QuestionAnalysis/views/TextbookQuestionAnalysis'
import { ProblemKey } from '@/utils/enums'
import TextbookOverView from '../components/TextbookOverView'
import { palette, TYPO } from '@/theme'
import MyOverall from '@/containers/MyOverall'

interface Props {
  contentRef: RefObject<View>
  resultData?: ExamResult
  textbookResult?: TextbookResult
  categoryResponses: CategoryResponse[]
  chapterId?: number
  overallChartContainer: {
    isLoading: boolean
    myData: number[]
    avgData: number[]
    categories: string[]
    xAxisLabelFormatter: (_: string, data: any) => string | string[][]
    formatTooltip: (dataProps: any) => string
  }
  categoriesOverallChartContainer: {
    isLoading: boolean
    myData: number[]
    avgData: number[]
    categories: string[]
    xAxisLabelFormatter: (_: string, { dataPointIndex }: any) => string | string[][]
    formatTooltip: (dataProps: any) => string
  }
  overallTimeChartContainer: {
    isLoading: boolean
    categories: QuestionTimeCategoryData[]
  }
  openProblem: ProblemKey | undefined
  longTimeSpend: LongTimeSpendQuestion[]
  setOpenProblem: Dispatch<SetStateAction<ProblemKey | undefined>>
}

const PrintExamResult: FC<Props> = ({
  resultData,
  textbookResult,
  chapterId,
  overallTimeChartContainer,
  overallChartContainer,
  categoriesOverallChartContainer,
  categoryResponses,
  contentRef,
  openProblem,
  longTimeSpend,
  setOpenProblem
}) => {
  return (
    <View ref={contentRef} collapsable={false}>
      <View style={styles.contentWrapper}>
        <View style={styles.overviewItem}>
          <View>
            <Text style={{ ...TYPO.heading1, color: palette.grey[700] }}>{resultData?.student.fullName}</Text>
            <Text style={{ ...TYPO.body1, color: palette.grey[500] }}>{resultData?.student.email}</Text>
          </View>
          <Text style={{ ...TYPO.body1, color: palette.grey[500] }}>{resultData?.title}</Text>
        </View>
        {chapterId
          ? textbookResult && <TextbookOverView t={t} resultData={textbookResult} />
          : resultData && <ExamOverView t={t} resultData={resultData} />}
        {chapterId
          ? null
          : resultData && (
              <MyOverall
                isPrint={true}
                overallChartContainerProps={overallChartContainer}
                categoriesOverallChartContainerProps={categoriesOverallChartContainer}
                overallTimeChartContainerProps={overallTimeChartContainer}
              />
            )}
        {chapterId
          ? textbookResult && <TextbookMyAnswer data={textbookResult} />
          : resultData && <ExamMyAnswer data={resultData} categories={categoryResponses} />}
        {chapterId
          ? textbookResult && (
              <TextbookQuestionAnalysis
                longTimeSpend={longTimeSpend}
                openProblem={openProblem}
                setOpenProblem={setOpenProblem}
                categoryResponses={categoryResponses}
                resultData={textbookResult}
                isPrint={true}
              />
            )
          : resultData && (
              <ExamQuestionAnalysis
                longTimeSpend={longTimeSpend}
                openProblem={openProblem}
                setOpenProblem={setOpenProblem}
                categoryResponses={categoryResponses}
                resultData={resultData}
                isPrint={true}
              />
            )}
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    padding: '24@ms',
    overflow: 'hidden'
  },
  contentWrapper: {
    marginBottom: '24@ms',
    backgroundColor: '#FFF'
  },
  overviewItem: {
    paddingTop: '24@ms',
    paddingHorizontal: '24@ms',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

export default PrintExamResult
