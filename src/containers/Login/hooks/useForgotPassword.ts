import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { forgotPasswordApi, resetPasswordApi, verifyResetPasswordOtpApi } from '../apiClients/accountService';
import { getErrorMessage, toast } from '@/utils/helpers';
import useAuthStore from '@/store/useAuthStore';

export type ForgotPasswordStep = 'email' | 'verify_otp' | 'reset';

type Props = {
  onOpenLoginAccountDialog: () => void
  onClose: () => void
}

const useForgotPassword = ({ onOpenLoginAccountDialog, onClose }: Props) => {
  const { t } = useTranslation();
  const setLoading = useAuthStore(state => state.setLoading);
  const loading = useAuthStore(state => state.isLoading);
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [key, setKey] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const emailValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('invalid_email_address'))
      .required(t('email_required')),
    sendToType: Yup.string().required()
  });

  const otpValidationSchema = Yup.object().shape({
    otp: Yup.string()
      .required(t('verification_code_required')),
  });

  const resetValidationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(6, t('password_min_length'))
      .matches(/[0-9]/, t('password_must_contain_number'))
      .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, t('password_must_contain_special_char'))
      .required(t('new_password_required')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], t('passwords_do_not_match'))
      .required(t('confirm_password_required')),
  });

  const emailFormik = useFormik({
    initialValues: {
      email: '',
      sendToType: 'main'
    },
    validationSchema: emailValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await forgotPasswordApi({email: values.email});
        const resKey = res.data?.key;

        if (resKey) {
          setKey(resKey);
        }
        toast.success(t('please_check_your_mailbox'));
        setStep('verify_otp');
      } catch (error) {
        toast.error(getErrorMessage(t, error));
      } finally {
        setLoading(false);
      }
    },
  });

  const otpFormik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: otpValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await verifyResetPasswordOtpApi({
          email: emailFormik.values.email,
          key,
          otp: values.otp,
        });
        setStep('reset');
      } catch (error) {
        toast.error(getErrorMessage(t, error));
      } finally {
        setLoading(false);
      }
    },
  });

  const resetFormik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: resetValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await resetPasswordApi({
          email: emailFormik.values.email,
          key,
          otp: otpFormik.values.otp,
          newPassword: values.newPassword,
        });
        toast.success(t('password_reset_success'));
        onOpenLoginAccountDialog();
        onClose();
      } catch (error) {
        toast.error(getErrorMessage(t, error));
      } finally {
        setLoading(false);
      }
    },
  });

  const handleReset = () => {
    setStep('email');
    setKey('');
    emailFormik.resetForm();
    otpFormik.resetForm();
    resetFormik.resetForm();
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const res = await forgotPasswordApi({ email: emailFormik.values.email });
      const resKey = res.data?.key;

      if (resKey) {
        setKey(resKey);
      }
      toast.success(t('please_check_your_mailbox'));
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    loading,
    emailFormik,
    otpFormik,
    resetFormik,
    showNewPassword,
    showConfirmPassword,
    toggleShowNewPassword,
    toggleShowConfirmPassword,
    handleReset,
    handleResendCode,
    setStep,
  };
};

export default useForgotPassword;
