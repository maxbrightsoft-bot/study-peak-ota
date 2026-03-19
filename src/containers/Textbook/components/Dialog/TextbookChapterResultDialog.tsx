import CommonDialog from '@/components/ModalBase/CommonDialog'
import TextbookMyAnswer from '@/containers/MyAnswer/views/TextbookMyAnswer'
import useTextbookChapterResult from '../../hooks/useTextbookChapterResult'
import { Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'

type Props = {
  open: boolean
  onClose: () => void
  chapterId?: number
}
const TextbookChapterResultDialog = ({ open, onClose, chapterId }: Props) => {
  const { t } = useTranslation()
  const { textbookResult, effectSize } = useTextbookChapterResult({ chapterId })

  return (
    <CommonDialog title={t('solution_results')} isVisible={open} onClose={onClose}>
      <View style={{ maxHeight: 342, marginHorizontal: -24, marginTop: -24 }}>
        {textbookResult && <TextbookMyAnswer data={textbookResult} effectSize={effectSize} />}
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.text}>{t('cancel')}</Text>
        </TouchableOpacity>
      </View>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: "#FFF",
    padding: 12
  },
  button: {
    marginBottom: -24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12
  },
  text: {
    color: palette.main[600],
    fontSize: 14,
    lineHeight: 22,
    fontWeight: 500
  }
})

export default TextbookChapterResultDialog
