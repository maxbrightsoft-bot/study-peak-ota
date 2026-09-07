import React, { useEffect, useRef } from 'react'
import { TouchableOpacity, Animated, StyleSheet } from 'react-native'
import { ms } from 'react-native-size-matters'

export interface PremiumSwitchProps {
  value: boolean
  onValueChange: (v: boolean) => void
  disabled?: boolean
}

export const PremiumSwitch: React.FC<PremiumSwitchProps> = ({ value, onValueChange, disabled }) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [value])

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E9ECEF', '#5F30AA'],
  })

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, ms(20)],
  })

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
    >
      <Animated.View style={[styles.switchTrack, { backgroundColor }]}>
        <Animated.View style={[styles.switchThumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  switchTrack: {
    width: ms(46),
    height: ms(26),
    borderRadius: ms(13),
    padding: ms(2),
    justifyContent: 'center',
  },
  switchThumb: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
})

export default PremiumSwitch
