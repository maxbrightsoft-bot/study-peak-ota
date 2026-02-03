import { palette } from '@/theme'
import React, { useEffect, useRef } from 'react'
import {
  View,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Platform
} from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface SlideDrawerProps {
  visible: boolean
  children: React.ReactNode
  position?: 'left' | 'right'
  onClose?: () => void
}

const SlideDrawerRoot: React.FC<SlideDrawerProps> = ({
  visible,
  children,
  position = 'right',
  onClose
}) => {
  const slideAnim = useRef(
    new Animated.Value(position === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH)
  ).current

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
    <Modal
      visible={visible}
      transparent
      animationType="none"
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdropOpacity }
            ]}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
              [position]: 0
            }
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  )
}

export default SlideDrawerRoot

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backdrop: {
    flex: 1,
    backgroundColor: palette.grey[900]
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    zIndex: 1000
  }
})
