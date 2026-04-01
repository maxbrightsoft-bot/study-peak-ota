import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import TextField from '@/components/Input/TextField'
import useLoginEmail from '../hooks/useLoginEmail'
import { useTranslation } from 'react-i18next'
import CustomTouchable from '@/components/Button/CustomTouchable'
import CommonDialog from '@/components/ModalBase/CommonDialog'

type Props = {
  visible: boolean
  onClose: () => void
}
const LoginAccountDialog = ({ visible, onClose }: Props) => {
  const { t } = useTranslation()
  const { formik, showPassword, toggleShowPassword } = useLoginEmail()

  return (
    <CommonDialog
      isVisible={visible}
      onClose={onClose}
      title={t('sign_in')}
    >
      <View style={styles.form}>
        <View>
          <Text style={styles.label}>{t('email')}</Text>
          <TextField
            onChangeText={formik.handleChange('email')}
            value={formik.values.email}
            error={formik.touched.email && formik.errors.email}
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text style={styles.label}>{t('password')}</Text>
          <TextField
            onChangeText={formik.handleChange('password')}
            value={formik.values.password}
            error={formik.touched.password && formik.errors.password}
            secureTextEntry={!showPassword}
            rightComponent={
              <TouchableOpacity onPress={toggleShowPassword}>
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={palette.grey[500]} 
                />
              </TouchableOpacity>
            }
          />
        </View>

        <CustomTouchable
          style={styles.loginButton}
          onPress={() => formik.handleSubmit()}
        >
          <Text style={styles.loginButtonText}>
            {t('sign_in')}
          </Text>
        </CustomTouchable>
      </View>
    </CommonDialog>
  )
}

export default LoginAccountDialog

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 24,
  },
  title: {
    ...TYPO.h3,
    color: palette.grey[900],
    marginBottom: 8,
  },
  subtitle: {
    ...TYPO.body3,
    color: palette.grey[600],
    textAlign: 'center',
  },
  form: {
    gap: 12
  },
  inputSpacing: {
    marginTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: palette.grey[700],
    marginBottom: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: palette.main[600],
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.main[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    ...TYPO.button,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 32,
  },
  footerText: {
    ...TYPO.body3,
    color: palette.grey[600],
  },
  signUpText: {
    color: palette.main[500],
    fontWeight: 'bold',
  },
})
