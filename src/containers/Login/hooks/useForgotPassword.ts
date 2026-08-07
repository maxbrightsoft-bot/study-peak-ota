import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { apiForgotPassword, apiResetPassword } from '../apiClients/accountService';
import { getErrorMessage, toast } from '@/utils/helpers';

export type ForgotPasswordStep = 'email' | 'reset';

type Props = {
  onOpenLoginAccountDialog: () => void
  onClose: () => void
}

const useForgotPassword = ({ onOpenLoginAccountDialog, onClose }: Props) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const emailValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('invalid_email_address'))
      .required(t('email_required')),
  });

  const resetValidationSchema = Yup.object().shape({
    otp: Yup.string()
      .required(t('verification_code_required')),
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
    },
    validationSchema: emailValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await apiForgotPassword(values.email);
        const key = res.data?.key;

        if (key) {
          resetFormik.setFieldValue('key', key);
        }
        toast.success(t('verification_code_sent'));
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
      key: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: resetValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await apiResetPassword({
          key: resetFormik.values.key,
          email: emailFormik.values.email,
          otp: values.otp,
          newPassword: values.newPassword,
        });
        toast.success(t('password_reset_success'));
        onOpenLoginAccountDialog()
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
    emailFormik.resetForm();
    resetFormik.resetForm();
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const res = await apiForgotPassword(emailFormik.values.email);
      const key = res.data?.key;

      if (key) {
        resetFormik.setFieldValue('key', key);
      }
      toast.success(t('verification_code_sent'));
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
