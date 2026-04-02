import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import Modal from 'react-native-modal/dist/modal'
import { ReactNode, useEffect, useState } from 'react'
import { ScaledSheet } from 'react-native-size-matters'
import Loading from '../Loading'
import useAuthStore from '@/store/useAuthStore'
import { Ionicons } from '@expo/vector-icons'

interface PropsModalClose {
  isVisible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  titleChildren?: ReactNode
  closeChildren?: ReactNode
  styleContainer?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
}
function BottomSheet(props: PropsModalClose) {
  const { isVisible, onClose, children, title, titleChildren, closeChildren, styleContainer, style } = props
  const { isLoading } = useAuthStore()

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={150}
      animationOutTiming={0}
      backdropTransitionInTiming={150}
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
      avoidKeyboard
    >
      <View style={styles.container}>
        <View style={styles.header}>
          {titleChildren ? titleChildren : <Text style={styles.title}>{title}</Text>}
          {closeChildren ? (
            closeChildren
          ) : (
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} />
            </TouchableOpacity>
          )}
        </View>

        {children}

        <View pointerEvents="none">{isLoading ? <Loading fullScreen={false} /> : null}</View>
      </View>
    </Modal>
  )
}

export default BottomSheet

const styles = ScaledSheet.create({
  modalContainer: {},
  modal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    minHeight: 200
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  title: {
    fontSize: 16,
    fontWeight: '600'
  },
  viewContainer: {
    borderRadius: '10@ms'
  }
})
