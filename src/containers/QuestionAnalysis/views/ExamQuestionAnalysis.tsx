import { ProblemKey } from '@/utils/enums'
import TrickyProblem from '../components/TrickyProblem'
import Vulnerable from '../components/Vulnerable'
import ProtractedProblem from '../components/ProtractedProblem'
import GradesByTerritory from '../components/GradesByTerritory'
import { CategoryResponse, ExamResult, LongTimeSpendQuestion } from '@/utils/types'
import { ScrollView, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  resultData: ExamResult
  openProblem?: ProblemKey
  setOpenProblem: (key?: ProblemKey) => void
  categoryResponses: CategoryResponse[]
  isPrint?: boolean
  longTimeSpend: LongTimeSpendQuestion[]
}
const QuestionAnalysis = ({ resultData, openProblem, setOpenProblem, categoryResponses, longTimeSpend, isPrint = false }: Props) => {
  return (
    <ScrollView style={styles.container}>
      <TrickyProblem
        keyOpen={ProblemKey.TrickyProblem}
        data={resultData}
        isPrint={isPrint}
        openProblem={openProblem}
        changeOpen={setOpenProblem}
      />
      <Vulnerable
        keyOpen={ProblemKey.Vulnerable}
        data={resultData}
        openProblem={openProblem}
        changeOpen={setOpenProblem}
      />
      <ProtractedProblem
        keyOpen={ProblemKey.ProtractedProblem}
        data={longTimeSpend}
        isPrint={isPrint}
        examResult={resultData}
        openProblem={openProblem}
        changeOpen={setOpenProblem}
      />
      <GradesByTerritory
        keyOpen={ProblemKey.GradesByTerritory}
        data={categoryResponses}
        isPrint={isPrint}
        resultData={resultData}
        openProblem={openProblem}
        changeOpen={setOpenProblem}
      />
    </ScrollView>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingBottom: "40@ms"
  }
})

export default QuestionAnalysis
