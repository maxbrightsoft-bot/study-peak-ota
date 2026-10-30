import React from "react";
import ExamResult from "@/containers/ExamResult/views";
import withMultiStudentSessionExamResult from "@/containers/ExamResult/hocs/withMultiStudentSessionExamResult";

type Props = {
  route?: any;
};

const MultiSessionExamResult = withMultiStudentSessionExamResult(ExamResult);

const ExamResultScreen = ({ route }: Props) => {
  return <MultiSessionExamResult route={route} />;
};

export default ExamResultScreen;