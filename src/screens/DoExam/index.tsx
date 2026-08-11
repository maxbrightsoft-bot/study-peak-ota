import DoExam from '@/containers/DoExam'

type Props = {
  route: any;
};

const DoExamScreen = ({ route }: Props) => {
  const examCode = route?.params?.examCode;
  const reqTime = route?.params?.reqTime;
  return <DoExam examCode={examCode} reqTime={reqTime}/>
}

export default DoExamScreen
