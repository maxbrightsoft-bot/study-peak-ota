import { Text, TouchableOpacity, View } from 'react-native'
import { Button } from 'react-native-paper'
import useLiveResult from '../hooks/useLiveResult'
import { utcToLocalTime } from '@/utils/helpers'
import { palette, TYPO } from '@/theme'
import Loading from '@/components/Loading'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  open: boolean
  examCode: string
  onClose?: () => void
  handleExamEnd: () => void
  handleDetailExamResult: () => void
}

const LiveResultDialog = ({ open, onClose = () => {}, examCode, handleExamEnd, handleDetailExamResult }: Props) => {
  const { t, examResult, totalTime, resultData, isLoading } = useLiveResult({ examCode })

  return (
    <SlideDrawerRoot onClose={onClose} visible={open}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="close" size={20} color={palette.grey[900]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>{t('exam_end')}</Text>
        </View>
        <View></View>
      </View>
      {isLoading && <Loading isOverlay={false} />}

      <View style={styles.container}>
        <Text style={styles.examTitle}>{examResult?.title || ''}</Text>

        <Text style={styles.score}>{t('score_format', { score: examResult?.score || 0 })}</Text>

        <Text style={styles.percentage}>{t('percentage_among_students')}: {examResult?.percentageAmongStudents?.toFixed(2) || 0}%</Text>

        <View style={styles.infoBlock}>
          <InfoRow label={t('exam_date')} value={utcToLocalTime(examResult?.startTime, t('full_date_time_format'))} />
          <InfoRow label={t('exam_duration')} value={totalTime} />
          <InfoRow label={t('number_of_questions')} value={`${resultData?.questions?.length || 0} ${t('questions')}`} />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            style={styles.outlineButton}
            labelStyle={styles.outlineText}
            onPress={handleDetailExamResult}
          >
            {t('view_details')}
          </Button>

          <Button mode="contained" style={styles.filledButton} labelStyle={styles.filledText} onPress={handleExamEnd}>
            {t('exam_end')}
          </Button>
        </View>
      </View>
    </SlideDrawerRoot>
  )
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
)

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: '24@ms',
    paddingTop: '24@ms',
    paddingBottom: '16@ms'
  },
  examTitle: {
    ...TYPO.heading3,
    textAlign: 'center',
    marginBottom: '12@ms'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    ...TYPO.button2,
    color: palette.main[500]
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '20@ms'
  },
  score: {
    fontSize: '36@ms',
    fontWeight: '700',
    textAlign: 'center',
    color: palette.main[600],
    marginBottom: '6@ms'
  },
  percentage: {
    textAlign: 'center',
    color: palette.grey[500],
    marginBottom: '24@ms'
  },
  infoBlock: {
    marginBottom: '24@ms'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '12@ms'
  },
  infoLabel: {
    ...TYPO.button4,
    color: palette.grey[500]
  },
  infoValue: {
    ...TYPO.button4,
    color: palette.grey[800]
  },
  buttonContainer: {
    gap: '12@ms'
  },
  outlineButton: {
    borderRadius: '12@ms',
    paddingVertical: '8@ms',
    borderColor: palette.main[500]
  },
  outlineText: {
    color: palette.main[500]
  },
  filledButton: {
    borderRadius: '12@ms',
    paddingVertical: '8@ms',
    backgroundColor: palette.main[600]
  },
  filledText: {
    color: '#FFF'
  }
})

export default LiveResultDialog
