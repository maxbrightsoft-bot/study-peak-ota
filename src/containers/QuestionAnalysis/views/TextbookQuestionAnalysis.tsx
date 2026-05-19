import TrickyProblem from '../components/TrickyProblem'
import Vulnerable from '../components/Vulnerable'
import ProtractedProblem from '../components/ProtractedProblem'
import GradesByTerritory from '../components/GradesByTerritory'
import { CategoryResponse, LongTimeSpendQuestion, TextbookResult } from '@/utils/types'
import { ScrollView, Text, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import { useTranslation } from 'react-i18next'

import { QuestionAnswerType } from '@/utils/enums'

type Props = {
  resultData: TextbookResult
  categoryResponses: CategoryResponse[]
  isPrint?: boolean
  longTimeSpend: LongTimeSpendQuestion[]
}
const QuestionAnalysis = ({ resultData, categoryResponses, longTimeSpend, isPrint = false }: Props) => {
  const { t } = useTranslation()
  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 200
      }}
    >
      <View
        style={{
          borderRadius: 6,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFF',
          paddingVertical: 8,
          marginBottom: 10
        }}
      >
        <Text style={{ color: palette.main[600], fontSize: 16, fontWeight: 600 }}>{t('problem_analysis')}</Text>
      </View>
      <View style={{ gap: 28 }}>
        <TrickyProblem data={resultData?.studentQuestionResults ?? []} questionGroups={(resultData as any)?.questionGroups ?? []} isPrint={isPrint} categories={categoryResponses ?? []} />
        <Vulnerable isPrint={isPrint} data={resultData?.studentQuestionResults ?? []} />
        <ProtractedProblem data={longTimeSpend ?? []} isPrint={isPrint} questions={resultData?.studentQuestionResults ?? []} />
        <GradesByTerritory data={categoryResponses ?? []} isPrint={isPrint} />
      </View>
    </ScrollView>
  )
}

const styles = ScaledSheet.create({})

export default QuestionAnalysis

