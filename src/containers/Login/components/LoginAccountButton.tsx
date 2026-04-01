import React from 'react'

import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { palette } from '@/theme'

const LoginAccountButton = ({ title, onPress }: { title: string, onPress: () => void }) => {

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  )
}

export default LoginAccountButton

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: palette.grey[700],
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: "#222222"
  }
})
