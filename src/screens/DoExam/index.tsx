import DoExam from '@/containers/DoExam'

type Props = {
  route: any;
};

const DoExamScreen = ({ route }: Props) => {
  const examCode = route?.params?.examCode;
  return <DoExam examCode={examCode}/>
}

export default DoExamScreen
