import useAuthStore from '@/store/useAuthStore'
import { palette } from '@/theme'
import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeModules,
  Platform
} from 'react-native'
import { Portal } from 'react-native-paper'
import Loading from '../Loading'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface SlideDrawerProps {
  visible: boolean
  children: React.ReactNode
  position?: 'left' | 'right'
  onClose?: () => void
}

const SlideDrawerRoot: React.FC<SlideDrawerProps> = ({ visible, children, position = 'right', onClose }) => {
  const { isLoading, isLoadingWithoutOverlay } = useAuthStore()
  const slideAnim = useRef(new Animated.Value(position === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH)).current
  const { StatusBarManager } = NativeModules
  const [statusBarHeight, setStatusBarHeight] = useState(0)
  const backdropOpacity = useRef(new Animated.Value(0)).current

  const [mounted, setMounted] = useState(visible)

  useEffect(() => {
    if (visible) {
      setMounted(true)
    }

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
    ]).start(() => {
      if (!visible) setMounted(false)
    })
  }, [visible, position])

  useEffect(() => {
    if (Platform.OS === 'ios') {
      StatusBarManager.getHeight(({ height }: { height: number }) => {
        setStatusBarHeight(height)
      })
    }
  }, [])

  if (!mounted) return null

  return (
    <Portal>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
              top: statusBarHeight,
              bottom: 0,
              [position]: 0
            }
          ]}
        >
          {children}
          {isLoading && <Loading fullScreen={false} />}
          {isLoadingWithoutOverlay && <Loading isOverlay={false} />}
        </Animated.View>
      </View>
    </Portal>
  )
}

export default SlideDrawerRoot

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.grey[900]
  },
  drawer: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'white',
    zIndex: 1000
  }
})