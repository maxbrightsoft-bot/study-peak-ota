import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Role } from '@/utils/enums';
import { LoginEmailRequest } from '@/utils/types';
import { apiLoginEmail } from '../apiClients/accountService';
import useLogin from './useLogin';
import { useState } from 'react';
import { ACADEMY_DOMAIN, PASSWORD_POLICY } from '@/utils/constants';
import { getDataStorage } from '@/utils/storage';
import useAuthStore from '@/store/useAuthStore';

const useLoginEmail = () => {
  const { t } = useTranslation();
  const { handleLogin } = useLogin();
  const setWeakPassword = useAuthStore(state => state.setWeakPassword)
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('invalid_email_address'))
      .required(t('email_required')),
    password: Yup.string()
      .required(t('password_required')),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const isKeepMeLoggedIn = true;
      const loginData: LoginEmailRequest = {
        email: values.email,
        password: values.password,
        role: Role.Student,
        isKeepMeLoggedIn,
      };
      await handleLogin(async () => {
        const academyDomain = await getDataStorage(ACADEMY_DOMAIN);
        const response = await apiLoginEmail(loginData, !academyDomain, academyDomain);
        return response.data;
      }, false);
      // Check password policy after login (password is still in form values)
      setWeakPassword(!PASSWORD_POLICY.test(values.password))
    },
  });

  return {
    formik,
    isLoading: false,
    showPassword,
    toggleShowPassword,
  };
};

export default useLoginEmail;