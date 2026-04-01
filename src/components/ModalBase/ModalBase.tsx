import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleProp,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from 'react-native'
import { ReactNode, useEffect } from 'react'
import { ScaledSheet } from 'react-native-size-matters'

interface PropsModalClose {
  isVisible: boolean
  onClose: () => void
  children: ReactNode
  styleContainer?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
}

function ModalBase(props: PropsModalClose) {
  const { isVisible, onClose, children, styleContainer } = props

  useEffect(() => {
    if (!isVisible) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose()
      return true
    })
    return () => subscription.remove()
  }, [isVisible])

  if (!isVisible) return null

  return (
    <View style={styles.overlay}>
      <StatusBar backgroundColor="rgba(0,0,0,0.3)" />

      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose() }}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
        pointerEvents="box-none"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.viewContainer, styleContainer]}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  )
}

export default ModalBase

const styles = ScaledSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '15@ms'
  },
  viewContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '10@ms',
    overflow: 'hidden'
  }
})