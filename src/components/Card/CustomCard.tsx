import React from 'react'
import { View, Pressable, StyleSheet, ViewStyle, GestureResponderEvent } from 'react-native'
import { Shadow } from 'react-native-shadow-2'
import { ScaledSheet } from 'react-native-size-matters'

interface CustomCardProps {
  children: React.ReactNode
  style?: any
  onPress?: (e: GestureResponderEvent) => void
  radius?: number
}

const CustomCard = ({ children, style, onPress, radius = 20 }: CustomCardProps) => {
  return (
    <Pressable onPress={onPress}>
      <Shadow
        stretch
        startColor="rgba(0,0,0,0.035)"
        endColor="rgba(0,0,0,0)"
        offset={[0, 1]}
        distance={10}
        containerStyle={{ flex: 1 }}
        style={{ flex: 1 }}
      >
        <View style={[styles.card, { borderRadius: radius }, style]}>{children}</View>
      </Shadow>
    </Pressable>
  )
}

export default CustomCard

const styles = ScaledSheet.create({
  card: {
    backgroundColor: '#FFFFFF'
  }
})
