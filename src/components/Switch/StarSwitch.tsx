import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import { TouchableRipple } from 'react-native-paper'

type Props = {
  onSwitch: () => void
  isStar: boolean
  isDisable: boolean
}
const StarSwitch = ({ onSwitch, isStar, isDisable }: Props) => {
  const [isOn, setIsOn] = React.useState(isStar)
  const translateX = React.useRef(new Animated.Value(isStar ? 30 : 0)).current

  const toggleSwitch = () => {
    Animated.timing(translateX, {
      toValue: isOn ? 0 : 30,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.circle)
    }).start()
    setIsOn((prev) => !prev)
    onSwitch()
  }

  return (
    <TouchableRipple onPress={isDisable ? undefined : toggleSwitch} style={styles.switchContainer} borderless>
      <View
        style={{
          ...styles.track,
          backgroundColor: palette.grey[100]
        }}
      >
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]}>
          <Ionicons name="star" size={18} color={isOn ? palette.warning.light : palette.grey[700]} />
        </Animated.View>
      </View>
    </TouchableRipple>
  )
}

const styles = StyleSheet.create({
  switchContainer: {
    width: 60,
    height: 30,
    justifyContent: 'center'
  },
  track: {
    width: 60,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center'
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 2,
    left: 2,
    elevation: 2
  }
})

export default StarSwitch
