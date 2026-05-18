import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleProp,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  ViewStyle
} from 'react-native'
import { ReactNode, useEffect } from 'react'
import { ScaledSheet } from 'react-native-size-matters'
import { Portal } from 'react-native-paper'
import useAuthStore from '@/store/useAuthStore'
import Loading from '../Loading'

interface PropsModalClose {
  isVisible: boolean
  onClose: () => void
  children: ReactNode
  styleContainer?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
  disableInnerTouchable?: boolean
  position?: 'center' | 'bottom'
}

function ModalBase(props: PropsModalClose) {
  const { isVisible, onClose, children, styleContainer, disableInnerTouchable, position = 'center' } = props
  const { height } = useWindowDimensions()
  const { isLoading, isLoadingWithoutOverlay } = useAuthStore()

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
    <Portal>
      <View style={styles.overlay}>
        <StatusBar backgroundColor="rgba(0,0,0,0.3)" />

        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose() }}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={position === 'bottom' ? styles.bottomView : styles.centeredView}
          pointerEvents="box-none"
        >
          <View
            style={[
              position === 'bottom' ? styles.bottomContainer : styles.viewContainer,
              { maxHeight: height * 0.9 },
              styleContainer
            ]}
          >
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
      {isLoading && <Loading isOverlay />}
      {!isLoading && isLoadingWithoutOverlay && <Loading />}
    </Portal>
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
  bottomView: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%'
  },
  viewContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '10@ms',
    overflow: 'hidden'
  },
  bottomContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden'
  }
})