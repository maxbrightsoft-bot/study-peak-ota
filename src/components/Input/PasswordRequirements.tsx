import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'

interface PasswordRequirementsProps {
  password?: string
  hasSubmitted?: boolean
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password = '',
  hasSubmitted = false
}) => {
  const { t } = useTranslation()

  const rules = [
    {
      key: 'uppercase',
      label: t('password_rule_uppercase'),
      valid: /[A-Z]/.test(password)
    },
    {
      key: 'lowercase',
      label: t('password_rule_lowercase'),
      valid: /[a-z]/.test(password)
    },
    {
      key: 'number',
      label: t('password_rule_number'),
      valid: /\d/.test(password)
    },
    {
      key: 'length',
      label: t('password_rule_length'),
      valid: password.length >= 8
    }
  ]

  return (
    <View style={styles.container}>
      {rules.map((rule) => {
        const isGreen = rule.valid
        const isRed = !rule.valid && hasSubmitted
        const color = isGreen ? '#2e7d32' : isRed ? (palette.error.main || '#d32f2f') : (palette.grey[600] || '#637381')

        return (
          <View key={rule.key} style={styles.row}>
            <View style={styles.iconContainer}>
              {isGreen ? (
                <Ionicons name="checkmark" size={15} color={color} />
              ) : isRed ? (
                <Ionicons name="close" size={15} color={color} />
              ) : (
                <View style={[styles.dot, { backgroundColor: color }]} />
              )}
            </View>
            <Text style={[styles.text, { color }]}>{rule.label}</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    paddingLeft: 2,
    gap: 4
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  iconContainer: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5
  },
  text: {
    ...TYPO.caption,
    fontSize: 12,
    lineHeight: 16
  }
})

export default PasswordRequirements
