import ExamResult from "@/containers/ExamResult/views"

type Props = {
  route: any
}

const ExamResultScreen = ({ route }: Props) => {
  const examCode = route?.params?.examCode
  const studentExamSessionId = route?.params?.studentExamSessionId
  const examSessionId = route?.params?.examSessionId
  return (
    <ExamResult examCode={examCode} studentExamSessionId={studentExamSessionId} examSessionId={examSessionId}/>
  )
}

export default ExamResultScreen