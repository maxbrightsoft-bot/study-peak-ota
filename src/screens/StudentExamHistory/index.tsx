import React from "react";
import StudentExamHistory from "@/containers/StudentExamHistory/views";

type Props = {
  route: any
}

const StudentExamHistoryScreen = ({ route }: Props) => {
  const examCode = route?.params?.examCode
  const examSessionId = route?.params?.examSessionId
  return (
    <StudentExamHistory examCode={examCode} examSessionId={examSessionId} />
  )
}

export default StudentExamHistoryScreen