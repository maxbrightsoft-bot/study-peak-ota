import { Text, TouchableOpacity, View } from 'react-native'
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
}

function BottomSheet(props: PropsBottomSheet) {
  const { isVisible, onClose, children, title, titleChildren, closeChildren } = props
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

      {children}

      <View pointerEvents="none">
        {isLoading ? <Loading fullScreen={false} /> : null}
      </View>
    </ModalBase>
  )
}

export default BottomSheet

const styles = ScaledSheet.create({
  container: {
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
  }
})