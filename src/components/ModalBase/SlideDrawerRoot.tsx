
import useAuthStore from '@/store/useAuthStore'
import { palette } from '@/theme'
import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions
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

const SlideDrawerRoot: React.FC<SlideDrawerProps> = ({
  visible,
  children,
  position = 'right',
  onClose
}) => {
  const isLoading = useAuthStore(state => state.isLoading)
  const isLoadingWithoutOverlay = useAuthStore(state => state.isLoadingWithoutOverlay)

  const slideAnim = useRef(
    new Animated.Value(position === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH)
  ).current

  const backdropOpacity = useRef(new Animated.Value(0)).current

  const [mounted, setMounted] = useState(visible)

  useEffect(() => {
    
    if (visible) {
      setMounted(true)
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue:
          visible ? 0 : position === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(backdropOpacity, {
        toValue: visible ? 0.5 : 0,
        duration: 300,
        useNativeDriver: false
      })
    ]).start()

    if (!visible) {
      const timeout = setTimeout(() => {
        setMounted(false)
      }, 300)

      return () => clearTimeout(timeout)
    }
  }, [visible, position])

  if (!mounted) return null

  return (
    <Portal>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity
              }
            ]}
          />
        </TouchableOpacity>

        
        <Animated.View
          style={[
            styles.drawer,
            {
              width: SCREEN_WIDTH,
              transform: [{ translateX: slideAnim }],
              top: 0,
              bottom: 0,
              [position]: 0
            }
          ]}
        >
          {children}

          {isLoading && <Loading fullScreen={false} />}
          {!isLoading && isLoadingWithoutOverlay && <Loading isOverlay={false} />}
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
    backgroundColor: 'white',
    zIndex: 1000,
    elevation: 1000
  }
})
