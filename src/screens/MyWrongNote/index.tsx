import React from "react"
import MyWrongNote from "@/containers/MyWrongNote/views"

type Props = {
  route: any
}

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ""
    ? Number(value)
    : undefined

const MyWrongNoteScreen = ({ route }: Props) => {
  const params = route?.params
  return (
    <MyWrongNote
      initialExamSessionId={toNumber(params?.examSessionId)}
      initialStudentExamSessionId={toNumber(params?.studentExamSessionId)}
      initialQuestionSuperId={toNumber(params?.questionSuperId)}
      deepLinkKey={toNumber(params?.deepLinkKey)}
    />
  )
}

export default MyWrongNoteScreen
