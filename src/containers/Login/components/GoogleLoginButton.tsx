import React from 'react'

import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import IconGoogle from '@/assets/icons/google.svg'
import { palette } from '@/theme'
import { useTranslation } from 'react-i18next'

const GoogleLoginButton = ({ loginWithGoogle }: { loginWithGoogle: () => void }) => {
  const { t } = useTranslation()
  return (
    <TouchableOpacity style={styles.googleButton} onPress={loginWithGoogle}>
      <IconGoogle style={styles.googleIcon} />
      <Text style={styles.googleButtonText}>{t('login_with_google')}</Text>
    </TouchableOpacity>
  )
}

export default GoogleLoginButton

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: palette.grey[700],
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center'
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: "#222222"
  }
})
