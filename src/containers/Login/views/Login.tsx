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
// import PhoneNumberLoginButton from '../components/PhoneNumberLoginButton'

const Login = () => {
  const { language } = useAuthStore()
  const { loginWithGoogle, onAppleButtonPress } = useLogin()

  const isEnglish = language.code === Language.en;
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isEnglish ? <LogoEN style={styles.logo} /> : <LogoKO style={styles.logo} />}
        <View style={styles.text1}>
          <Text style={{ ...TYPO.body3, ...styles.title }}>
            스터디 피크는 오프라인의 공부 데이터를
            {'\n'}
            <Text style={{ ...TYPO.body3, ...styles.title }}>축적, 분석, 공유하기 위한</Text>
          </Text>
        </View>

        <Text style={styles.description}>공부 페이스 메이커 입니다.</Text>
        <View style={{ gap: 8, width: '100%' }}>
          {Platform.OS === 'ios' && <AppleButton
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            style={{ width: '100%', height: 55 }}
            onPress={onAppleButtonPress}
          />}
          <GoogleLoginButton loginWithGoogle={loginWithGoogle} />
          {/* <PhoneNumberLoginButton /> */}
        </View>
      </View>
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
