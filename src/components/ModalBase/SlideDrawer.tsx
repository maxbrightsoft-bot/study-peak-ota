import { palette } from '@/theme'
import React, { useEffect, useRef } from 'react'
import { View, Animated, TouchableOpacity, StyleSheet, Dimensions, Platform, BackHandler } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface SlideDrawerProps {
  visible: boolean
  children: React.ReactNode
  position?: 'left' | 'right'
  onClose?: () => void
}

const SlideDrawer: React.FC<SlideDrawerProps> = ({ visible, children, position = 'right', onClose }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose?.()
      return true
    })
    return () => subscription.remove()
  }, [visible, onClose])

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true
        })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_WIDTH,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start()
    }
  }, [visible])

  if (!visible) return null

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
            ...(position === 'left' ? { left: 0 } : { right: 0 })
          }
        ]}
      >
        {children}
      </Animated.View>
    </View>
  )
}

const styles = ScaledSheet.create({
  modalContainer: {},
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: 'white',
    flex: 1,
    zIndex: 99
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.grey[300]
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'white'
  }
})

export default SlideDrawer
