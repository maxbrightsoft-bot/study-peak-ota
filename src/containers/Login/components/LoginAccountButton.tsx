import React from 'react'

import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

const LoginAccountButton = ({ title, onPress }: { title: string, onPress: () => void }) => {

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  )
}

export default LoginAccountButton

const styles = ScaledSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: palette.grey[700],
    borderWidth: '1@ms',
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '6@ms',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: '16@ms',
    fontWeight: '500',
    color: "#222222"
  }
})
