import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

type LoginTextButtonProps = {
  title: string
  prefix?: string
  onPress: () => void
}

const LoginTextButton = ({ title, prefix, onPress }: LoginTextButtonProps) => {
  const label = prefix ? `${prefix} ${title}` : title
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.prefix}>
        {prefix ? `${prefix} ` : null}
        <Text style={styles.text}>{title}</Text>
      </Text>
    </TouchableOpacity>
  )
}

export default LoginTextButton

const styles = ScaledSheet.create({
  button: {
    alignSelf: 'center',
    minHeight: 44,
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    marginTop: '8@ms',
    justifyContent: 'center'
  },
  prefix: {
    fontSize: '14@ms',
    fontWeight: '400',
    color: palette.grey[600]
  },
  text: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.main[600]
  }
})
