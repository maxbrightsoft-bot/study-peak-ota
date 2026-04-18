import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Role } from '@/utils/enums';
import { LoginEmailRequest } from '@/utils/types';
import { apiLoginEmail } from '../apiClients/accountService';
import useLogin from './useLogin';
import { useState } from 'react';
import { getErrorMessage, toast } from '@/utils/helpers';
import { KEEP_LOGIN } from '@/utils/constants';
import { getDataStorage } from '@/utils/storage';

const useLoginEmail = () => {
  const { t } = useTranslation();
  const { handleLogin } = useLogin();
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
      const keepLogin = await getDataStorage(KEEP_LOGIN);
      const loginData: LoginEmailRequest = {
        email: values.email,
        password: values.password,
        role: Role.Student,
        isKeepMeLoggedIn: keepLogin === 'true'
      };
      try {
        await handleLogin(async () => {
          const response = await apiLoginEmail(loginData);
          return response.data;
        });
      } catch (error) {
        toast.error(getErrorMessage(t, error));
      }
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