import React, { useCallback } from 'react'
import { View, Text, Platform, TouchableOpacity } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Routes } from '@/navigators/RouteName'
import { dropGuestState } from '@/containers/GuestExam/utils/guestNavigation'
import { palette, TYPO } from '@/theme'
import GoogleLoginButton from '../components/GoogleLoginButton'
import LogoEN from '@/assets/icons/with-slogan_full-logo_eng.svg'
import LogoKO from '@/assets/icons/with-slogan_full-logo_kor.svg'
import useAuthStore from '@/store/useAuthStore'
import useResponsive from '@/hooks/useResponsive'
import { Language } from '@/utils/enums'
import { AppleButton } from '@invertase/react-native-apple-authentication';
import useLogin from '../hooks/useLogin'
import LoginAccountButton from '../components/LoginAccountButton'
import LoginAccountDialog from '../components/LoginAccountDialog'
import LoginTextButton from '../components/LoginTextButton'
import { LoginAccountMode } from '../configs/types'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'

const Login = () => {
  const { t } = useTranslation()
  const { language } = useAuthStore()
  const { isTablet, formMaxWidth } = useResponsive()
  const { loginWithGoogle, onAppleButtonPress, openLoginAccountDialog, loginAccountMode, handleOpenLoginAccountDialog, handleCloseLoginAccountDialog } = useLogin()

  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()

  // Back on the login screen: no guest token, answer backup or guest Pusher connection may survive.
  useFocusEffect(
    useCallback(() => {
      dropGuestState()
    }, [])
  )

  const isEnglish = language?.code === Language.en;
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.takeExam, { top: insets.top + 12 }]}
        onPress={() => navigation.navigate(Routes.UnAuth.GuestCode)}
        accessibilityRole="button"
      >
        <Ionicons name="create-outline" size={18} color={palette.main[600]} />
        <Text style={styles.takeExamText}>{t('take_exam')}</Text>
      </TouchableOpacity>
      <View style={[styles.content, formMaxWidth ? { maxWidth: formMaxWidth, width: '100%', alignSelf: 'center' } : undefined]}>
        {isEnglish ? <LogoEN style={styles.logo} /> : <LogoKO style={styles.logo} />}
        <View style={styles.text1}>
          <Text style={[TYPO.body3, styles.title ]}>
            {t('study_face_maker_description_1')}
            {'\n'}
            <Text style={[TYPO.body3, styles.title ]}>{t('study_face_maker_description_2')}</Text>
          </Text>
        </View>

        <Text style={[styles.description, isTablet && { marginBottom: 48 }]}>{t('study_face_maker')}</Text>
        <View style={{ gap: 8, width: '100%' }}>
          {Platform.OS === 'ios' && <AppleButton
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.SIGN_IN}
            style={{ width: '100%', height: 55 }}
            onPress={onAppleButtonPress}
          />}
          <GoogleLoginButton loginWithGoogle={loginWithGoogle} />
          <LoginAccountButton
            title={t('sign_in_with_password')}
            onPress={() => handleOpenLoginAccountDialog(LoginAccountMode.Login)}
          />
        </View>
        <LoginTextButton
          prefix={t('no_account_yet')}
          title={t('sign_up_now')}
          onPress={() => handleOpenLoginAccountDialog(LoginAccountMode.Register)}
        />
      </View>
      <LoginAccountDialog
        visible={openLoginAccountDialog}
        mode={loginAccountMode}
        onOpen={() => handleOpenLoginAccountDialog(LoginAccountMode.Login)}
        onClose={handleCloseLoginAccountDialog} />
    </View>
  )
}

export default Login

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  logo: {
    textAlign: 'center',
    width: '216@ms',
    height: '71@ms',
  },
  content: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '24@ms'
  },
  text1: {
    marginTop: '20@ms',
    marginBottom: '8@ms'
  },
  title: {
    textAlign: 'center',
    color: palette.grey[900],
    paddingHorizontal: '45@ms'
  },
  bold: {
    fontWeight: 'bold'
  },
  description: {
    textAlign: 'center',
    fontSize: '16@ms',
    fontWeight: 600,
    color: palette.grey[900],
    lineHeight: '23@ms',
    marginBottom: '100@ms',
    paddingHorizontal: '45@ms'
  },
  takeExam: {
    position: 'absolute',
    left: '16@ms',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
    paddingHorizontal: '14@ms',
    paddingVertical: '8@ms',
    borderRadius: '20@ms',
    borderWidth: 1,
    borderColor: palette.main[300],
    backgroundColor: palette.main[50]
  },
  takeExamText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.main[600]
  },
  highlight: {
    color: palette.main[500],
    fontWeight: '600'
  }
})
