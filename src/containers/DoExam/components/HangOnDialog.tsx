import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette } from '@/theme'
import { FC } from 'react'
import { Text, View } from 'react-native'

interface HangOnDialogProps {
  title: string
  content: string
  open: boolean
  onClose?: () => void
}

const HangOnDialog: FC<HangOnDialogProps> = ({ title, content, open, onClose = () => {} }) => {
  return (
    <CommonDialog onClose={onClose} isVisible={open} title={title} isVisibleHeader={false}>
      <View style={{ marginVertical: 16, marginHorizontal: 24 }}>
        <Text style={{ color: palette.main[500], fontWeight: 700, fontSize: 16, textAlign: "center" }}>{content}</Text>
      </View>
    </CommonDialog>
  )
}
export default HangOnDialog
