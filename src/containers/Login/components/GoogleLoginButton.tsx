import React from 'react'

import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import IconGoogle from '@/assets/icons/google.svg'
import { palette } from '@/theme'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'

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

const styles = ScaledSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: palette.grey[700],
    borderWidth: '1@ms',
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '6@ms',
    justifyContent: 'center'
  },
  googleIcon: {
    width: '20@ms',
    height: '20@ms',
    marginRight: '8@ms'
  },
  googleButtonText: {
    fontSize: '16@ms',
    fontWeight: '500',
    color: "#222222"
  }
})
