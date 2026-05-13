import { palette } from '@/theme/colors'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  visible: boolean
  position?: 'left' | 'right'
  onClose?: () => void
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const WaitingExamStart = ({ visible, position = 'right', onClose }: Props) => {
  const { t } = useTranslation()
  const slideAnim = useRef(new Animated.Value(position === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH)).current

  const backdropOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : position === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(backdropOpacity, {
        toValue: visible ? 0.5 : 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start()
  }, [visible, position])

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.container}>
        <TouchableOpacity style={styles.exitButton} onPress={onClose}>
          <Text style={styles.exitText}>{t('exit')}</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>
            {t('live_exam_starting')}
          </Text>

          {/* <Text style={styles.timer}>
            00:03 <Text style={styles.subText}>후에 입장</Text>
          </Text> */}
        </View>
      </View>
    </Modal>
  )
}

export default WaitingExamStart

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },

  exitButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: '20@ms',
    paddingTop: '50@ms'
  },

  exitText: {
    fontSize: '14@ms',
    color: '#333'
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: palette.grey[900],
    textAlign: 'center',
    lineHeight: '28@ms',
    marginBottom: '100@ms'
  },

  timer: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: palette.main[600]
  },

  subText: {
    color: '#222',
    fontWeight: '400'
  }
})
