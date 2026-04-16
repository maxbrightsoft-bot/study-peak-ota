import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { palette, TYPO } from '@/theme'
import GoogleLoginButton from '../components/GoogleLoginButton'
import LogoEN from '@/assets/icons/with-slogan_full-logo_eng.svg'
import LogoKO from '@/assets/icons/with-slogan_full-logo_kor.svg'
import useAuthStore from '@/store/useAuthStore'
import { Language } from '@/utils/enums'
import { AppleButton } from '@invertase/react-native-apple-authentication';
import useLogin from '../hooks/useLogin'
import LoginAccountButton from '../components/LoginAccountButton'
import LoginAccountDialog from '../components/LoginAccountDialog'
import { useTranslation } from 'react-i18next'
// import PhoneNumberLoginButton from '../components/PhoneNumberLoginButton'

const Login = () => {
  const { t } = useTranslation()
  const { language } = useAuthStore()
  const { loginWithGoogle, onAppleButtonPress, openLoginAccountDialog, handleOpenLoginAccountDialog, handleCloseLoginAccountDialog } = useLogin()

  const isEnglish = language?.code === Language.en;
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isEnglish ? <LogoEN style={styles.logo} /> : <LogoKO style={styles.logo} />}
        <View style={styles.text1}>
          <Text style={{ ...TYPO.body3, ...styles.title }}>
            {t('study_face_maker_description_1')}
            {'\n'}
            <Text style={{ ...TYPO.body3, ...styles.title }}>{t('study_face_maker_description_2')}</Text>
          </Text>
        </View>

        <Text style={styles.description}>{t('study_face_maker')}</Text>
        <View style={{ gap: 8, width: '100%' }}>
          {Platform.OS === 'ios' && <AppleButton
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            style={{ width: '100%', height: 55 }}
            onPress={onAppleButtonPress}
          />}
          <GoogleLoginButton loginWithGoogle={loginWithGoogle} />
          <LoginAccountButton title={t('login_with_email')} onPress={handleOpenLoginAccountDialog} />
          {/* <PhoneNumberLoginButton /> */}
        </View>
      </View>
      <LoginAccountDialog visible={openLoginAccountDialog} onOpen={handleOpenLoginAccountDialog} onClose={handleCloseLoginAccountDialog} />
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  logo: {
    textAlign: 'center',
    width: 216,
    height: 71,
  },
  content: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  text1: {
    marginTop: 20,
    marginBottom: 8
  },
  title: {
    textAlign: 'center',
    color: palette.grey[900],
    paddingHorizontal: 45
  },
  bold: {
    fontWeight: 'bold'
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: palette.grey[900],
    lineHeight: 23,
    marginBottom: 100,
    paddingHorizontal: 45
  },
  highlight: {
    color: palette.main[500],
    fontWeight: '600'
  }
})
