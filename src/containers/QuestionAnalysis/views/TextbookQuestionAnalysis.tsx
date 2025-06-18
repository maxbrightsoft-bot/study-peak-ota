import { ProblemKey } from '@/utils/enums'
import TrickyProblem from '../components/TextbookTrickyProblem'
import Vulnerable from '../components/TextbookVulnerable'
import ProtractedProblem from '../components/TextbookProtractedProblem'
import GradesByTerritory from '../components/TextbookGradesByTerritory'
import { CategoryResponse, LongTimeSpendQuestion, TextbookResult } from '@/utils/types'
import { ScrollView } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  resultData: TextbookResult
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
        isPrint={isPrint}
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
