import useAuthStore from '@/store/useAuthStore'
import { palette } from '@/theme'
import React, { useEffect, useRef, useState, useContext } from 'react'
import { NavigationContext } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  View,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  BackHandler
} from 'react-native'
import { Portal } from 'react-native-paper'
import Loading from '../Loading'
import { ScaledSheet } from 'react-native-size-matters'

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
  const navigation = useContext(NavigationContext)

  const slideAnim = useRef(
    new Animated.Value(position === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH)
  ).current

  const backdropOpacity = useRef(new Animated.Value(0)).current

  const [mounted, setMounted] = useState(visible)

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
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            {navigation ? (
              <NavigationContext.Provider value={navigation}>
                {children}
              </NavigationContext.Provider>
            ) : (
              children
            )}
          </SafeAreaView>

          {isLoading && <Loading fullScreen={false} />}
          {!isLoading && isLoadingWithoutOverlay && <Loading isOverlay={false} />}
        </Animated.View>
      </View>
    </Portal>
  )
}

export default SlideDrawerRoot

const styles = ScaledSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.grey[900]
  },
  drawer: {
    position: 'absolute',
    backgroundColor: 'white',
    zIndex: 1000,
    elevation: '1000@ms'
  }
})
