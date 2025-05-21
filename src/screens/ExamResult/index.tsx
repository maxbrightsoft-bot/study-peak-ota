import ExamResult from "@/containers/ExamResult/views"

type Props = {
  route: any
}

const ExamResultScreen = ({ route }: Props) => {
  const examCode = route?.params?.examCode
  return (
    <ExamResult examCode={examCode}/>
  )
}

export default ExamResultScreen