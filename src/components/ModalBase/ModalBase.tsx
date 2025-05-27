import { StyleProp, View, ViewStyle } from 'react-native'
import Modal from 'react-native-modal/dist/modal'
import { ReactNode, useEffect, useState } from 'react'
import { ScaledSheet } from 'react-native-size-matters'
import Toast from 'react-native-toast-message'
import Loading from '../Loading'
import useAuthStore from '@/store/useAuthStore'

interface PropsModalClose {
  isVisible: boolean
  onClose: () => void
  children: ReactNode
  styleContainer?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
}
function ModalBase(props: PropsModalClose) {
  const { isVisible, onClose, children, styleContainer, style } = props
  const [canRenderContent, setCanRenderContent] = useState(false)
  const { isLoading } = useAuthStore()

  return (
    <Modal
      isVisible={isVisible}
      backdropTransitionOutTiming={0}
      backdropOpacity={0.3}
      onBackdropPress={onClose}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={300}
      animationOutTiming={300}
      useNativeDriver
      avoidKeyboard
      onModalShow={() => setCanRenderContent(true)}
      onModalHide={() => setCanRenderContent(false)}
      style={[styles.modalContainer, style]}
    >
      <Toast position="bottom" />
      <View style={[styles.viewContainer, styleContainer, { opacity: canRenderContent ? 1 : 0 }]}>
        {children}
        {isLoading && <Loading fullScreen={false} />}
      </View>
    </Modal>
  )
}

export default ModalBase

const styles = ScaledSheet.create({
  modalContainer: {
  },
  container: {
    paddingHorizontal: '15@ms'
  },
  viewContainer: {
    borderRadius: '10@ms'
  }
})
