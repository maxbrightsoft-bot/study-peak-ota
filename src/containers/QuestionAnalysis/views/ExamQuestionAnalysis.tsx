import { ProblemKey } from '@/utils/enums'
import TrickyProblem from '../components/TrickyProblem'
import Vulnerable from '../components/Vulnerable'
import ProtractedProblem from '../components/ProtractedProblem'
import GradesByTerritory from '../components/GradesByTerritory'
import { CategoryResponse, ExamResult, LongTimeSpendQuestion } from '@/utils/types'
import { ScrollView, Text, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import { useTranslation } from 'react-i18next'

type Props = {
  resultData: ExamResult
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
        <TrickyProblem data={resultData} isPrint={isPrint} categories={categoryResponses} />
        <Vulnerable isPrint={isPrint} data={resultData} />
        <ProtractedProblem data={longTimeSpend} isPrint={isPrint} examResult={resultData} />
        <GradesByTerritory data={categoryResponses} isPrint={isPrint} />
      </View>
    </ScrollView>
  )
}

const styles = ScaledSheet.create({})

export default QuestionAnalysis
