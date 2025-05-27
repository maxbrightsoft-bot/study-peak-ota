import CommonDialog from '@/components/ModalBase/CommonDialog'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-paper'
import useLiveResult from '../hooks/useLiveResult'
import { utcToLocalTime } from '@/utils/helpers'
import { palette, TYPO } from '@/theme'
import { Question } from '@/utils/types'

interface Props {
  title: string
  open: boolean
  examCode: string
  onClose?: () => void
  handleExamEnd: () => void
  handleDetailExamResult: () => void
}

const LiveResultDialog = ({
  title,
  open,
  onClose = () => {},
  examCode,
  handleExamEnd,
  handleDetailExamResult
}: Props) => {
  const { t, resultData, totalTime } = useLiveResult({ examCode })
  const totalScore = resultData?.questions.reduce((acc: number, cur: Question) => {
    return acc += cur?.score || 0
  } , 0)

  return (
    <CommonDialog onClose={onClose} isVisible={open} title={title}>
      <View style={styles.examInfo}>
        <Text style={styles.examTitle}>{resultData?.title || ""}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Text style={styles.examSubtitle}>{utcToLocalTime(resultData?.startTime, t('full_date_time_format'))}</Text>
          {/* <Text style={styles.examSubtitle}>{resultData?.finishTime}</Text> */}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Text style={styles.examDetails}>{`${t('exam_end')} ${totalTime}`}</Text>
          <Text style={styles.examDetails}>{t('total_questions_title', { total: resultData?.questions.length})}</Text>
        </View>
      </View>

      <View style={styles.scoreBlock}>
        <Text style={styles.score}>{t('score_format', { score: resultData?.score || 0 })}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Text style={{ ...styles.scoreText, color: palette.grey[500] }}>백분율</Text>
          <Text style={{ ...styles.scoreText, color: palette.grey[700] }}> {`${(+((resultData?.score || 0)/(totalScore || 0) * 100) || 0)?.toFixed(2)}%`}</Text>
        </View>

        {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Text style={{ ...styles.scoreText, color: palette.grey[500] }}>풀이 순서 효율</Text>
          <Text style={{ ...styles.scoreText, color: palette.grey[700] }}>68.89%</Text>
        </View> */}
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="contained" style={styles.confirmButton} onPress={handleExamEnd}>
          <Text style={styles.confirmText}>확인</Text>
        </Button>
        <Button mode="outlined" style={styles.detailButton} onPress={handleDetailExamResult}>
          <Text style={styles.detailText}>상세 보기</Text>
        </Button>
      </View>
    </CommonDialog>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 10
  },
  examInfo: {
    marginBottom: 24
  },
  examTitle: {
    ...TYPO.heading3,
    marginBottom: 8
  },
  examSubtitle: {
    ...TYPO.button4,
    color: palette.grey[500],
    marginBottom: 8
  },
  examDetails: {
    ...TYPO.button4,
    color: palette.grey[500]
  },
  scoreBlock: {
    borderWidth: 1,
    borderColor: palette.grey[100],
    borderRadius: 6,
    padding: 12,
    marginBottom: 24
  },
  score: {
    ...TYPO.heading2,
    color: palette.main[500],
    marginBottom: 8
  },
  scoreText: {
    ...TYPO.button3,
    marginBottom: 8
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16
  },
  confirmButton: {
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: palette.main[500],
    paddingHorizontal: 24,
    paddingVertical: 4
  },
  detailButton: {
    marginLeft: 8,
    borderRadius: 6,
    borderColor: palette.main[500],
    paddingHorizontal: 12,
    paddingVertical: 4,
    color: palette.main[500]
  },
  confirmText: {
    ...TYPO.button2,
    color: '#FFF'
  },
  detailText: {
    ...TYPO.button,
    color: palette.main[500]
  }
})

export default LiveResultDialog
