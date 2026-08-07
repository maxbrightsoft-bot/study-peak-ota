import { memo, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import TextField from '@/components/Input/TextField'
import { Question } from '@/utils/types'
import { QuestionAnswerType } from '@/utils/enums'
import { useTranslation } from 'react-i18next'

type Props = {
  initValue: any
  question: Question
  updateQuestionAnswer: ({
    questionId,
    value,
    questionAnswerType
  }: {
    questionId: number
    value: any
    questionAnswerType?: QuestionAnswerType
  }) => void
}

const ShortAnswerInput = ({ initValue, question, updateQuestionAnswer }: Props) => {
  const { t } = useTranslation()
  const [value, setValue] = useState(initValue)
  const onChange = (newValue: string) => {
    setValue(newValue)
  }

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TextField
          style={{ flex: 1, marginVertical: 12, borderWidth: 1, borderColor: palette.grey[300], borderRadius: 6 }}
          value={value}
          onChangeText={onChange}
        />
        {!!question.unit && (
          <Text style={styles.textAnswerValue}>{question.unit}</Text>
        )}
      </View>
      {value !== initValue && <TouchableOpacity
        style={[styles.button, styles.confirmButton]}
        onPress={() =>
          updateQuestionAnswer({
            questionId: question.id,
            value: value
          })
        }
      >
        <Text style={styles.confirmButtonText}>{t('registration')}</Text>
      </TouchableOpacity>}
    </View>
  )
}

const styles = ScaledSheet.create({
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '8@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: palette.grey[100],
    paddingVertical: '12@ms',
  },
  confirmButton: {
    backgroundColor: palette.main[500],
    marginBottom: '12@ms',
  },
  cancelButtonText: {
    ...TYPO.button2,
    color: palette.grey[700]
  },
  confirmButtonText: {
    ...TYPO.button2,
    color: 'white'
  },
  textAnswerValue: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#333'
  }
})

export default memo(ShortAnswerInput)
