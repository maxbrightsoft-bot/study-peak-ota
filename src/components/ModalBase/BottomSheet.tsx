import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ReactNode } from 'react'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import Loading from '../Loading'
import useAuthStore from '@/store/useAuthStore'
import ModalBase from './ModalBase'

interface PropsBottomSheet {
  isVisible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  titleChildren?: ReactNode
  closeChildren?: ReactNode
  scrollable?: boolean
}

function BottomSheet(props: PropsBottomSheet) {
  const { isVisible, onClose, children, title, titleChildren, closeChildren, scrollable = false } = props
  const { isLoading } = useAuthStore()

  return (
    <ModalBase
      isVisible={isVisible}
      onClose={onClose}
      position="bottom"
      styleContainer={styles.container}
    >
      <View style={styles.header}>
        {titleChildren ?? <Text style={styles.title}>{title}</Text>}
        {closeChildren ?? (
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={20} />
          </TouchableOpacity>
        )}
      </View>

      {scrollable ? (
        <ScrollView
          style={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          bounces={false}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}

      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {isLoading ? <Loading fullScreen={false} /> : null}
      </View>
    </ModalBase>
  )
}

export default BottomSheet

const styles = ScaledSheet.create({
  container: {
    paddingBottom: '20@ms',
    minHeight: 200
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20@ms',
    paddingVertical: '14@ms',
    flexShrink: 0
  },
  scrollContent: {
    flexShrink: 1
  },
  title: {
    fontSize: '16@ms',
    fontWeight: '600'
  }
})