import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Ionicons } from '@expo/vector-icons'
import useLoginPhoneNumber from '../hooks/useLoginPhoneNumber'
import { Text } from 'react-native-paper'
import TextField from '@/components/Input/TextField'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import { goBack } from '@/navigators/NavigationHelpers'

const LoginParentPhone = () => {
  const { t, showPassword, handleLoginPhoneNumber, handleClickShowPassword } = useLoginPhoneNumber()
  const phoneRegExp =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

  const formik = useFormik({
    initialValues: { phoneNumber: '', password: '' },
    validationSchema: Yup.object({
      phoneNumber: Yup.string()
        .required(t('phone_number_is_required'))
        .matches(phoneRegExp, t('phone_number_is_not_valid')),
      password: Yup.string().required(t('password_required'))
    }),
    onSubmit: (values) => {
      handleLoginPhoneNumber(values)
    }
  })

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.labelText} variant="labelLarge">
          {t('id')}
        </Text>
        <TextField
          placeholderTextColor="#43A047"
          style={styles.input}
          onChangeText={formik.handleChange('phoneNumber')}
          value={formik.values.phoneNumber}
          error={formik.errors.phoneNumber}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.labelText} variant="labelLarge">
          {t('password')}
        </Text>
        <TextField
          placeholderTextColor="#43A047"
          secureTextEntry={!showPassword}
          style={styles.input}
          onChangeText={formik.handleChange('password')}
          value={formik.values.password}
          error={formik.errors.password}
        />
        <TouchableOpacity style={styles.icon} onPress={handleClickShowPassword}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#607D8B" />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.navButton} onPress={() => goBack()}>
          <Ionicons name="chevron-back" size={20} color="#FFF" />
          <Text style={styles.backText}>{t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => formik.handleSubmit()}>
          <Text style={styles.buttonText}>{t('confirmation')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default LoginParentPhone

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '24@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navButton: {
    borderRadius: '6@ms',
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.grey[500]
  },

  labelText: {
    width: '80@ms'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: '1@ms',
    borderColor: '#E0E0E0',
    borderRadius: '10@ms',
    paddingHorizontal: '10@ms',
    marginBottom: '20@ms'
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: "12@ms",
    width: "100%"
  },
  input: {
    flex: 1,
    fontSize: '16@ms',
    color: '#000'
  },
  icon: {
    padding: '5@ms'
  },
  button: {
    backgroundColor: palette.main[500],
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '10@ms',
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: '16@ms'
  },
  backText: {
    fontWeight: 'bold',
    fontSize: '16@ms',
    color: '#FFF'
  }
})
