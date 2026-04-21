import { useEffect, useMemo, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { GRADE_OPTIONS } from '@/containers/StepLogin/configs/constants'
import { useTranslation } from 'react-i18next'
import { registerAccountApi } from '@/services'
import useAuthStore from '@/store/useAuthStore'
import { getErrorMessage, toast } from '@/utils/helpers'
import { getDataStorage } from '@/utils/storage'
import { KEEP_LOGIN } from '@/utils/constants'
import { LoginEmailRequest } from '@/utils/types'
import { Role } from '@/utils/enums'
import useLogin from './useLogin'
import { apiLoginEmail } from '../apiClients/accountService'

type RegisterValues = {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phoneNumber: string
  parentName: string
  parentPhoneNumber: string
  schoolName: string
  grade: string
  major: string
}

export const TOTAL_REGISTER_STEPS = 4

const useRegisterEmail = ({ mode, setMode }: { mode: "login" | "register", setMode: React.Dispatch<React.SetStateAction<"login" | "register">> }) => {
  const { setLoading } = useAuthStore()
  const [registerStep, setRegisterStep] = useState(1)
  const { handleLogin } = useLogin();
  const { t } = useTranslation()

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('invalid_email'))
      .required(t('email_required')),

    password: Yup.string()
      .min(6, t('password_min_length'))
      .matches(/[0-9]/, t('password_must_contain_number'))
      .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, t('password_must_contain_special_char'))
      .required(t('new_password_required')),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('password_not_match'))
      .required(t('confirm_password_required')),

    fullName: Yup.string().required(t('full_name_required')),

    phoneNumber: Yup.string()
      .matches(/^[0-9]{9,11}$/, t('phone_number_is_not_valid'))
      .required(t('phone_number_is_required')),

  })

  const formik = useFormik<RegisterValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: '',
      parentName: '',
      parentPhoneNumber: '',
      schoolName: '',
      grade: '',
      major: '',
    },

    validationSchema,

    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...data } = values

        setLoading(true)
        await registerAccountApi(data)
        const keepLogin = await getDataStorage(KEEP_LOGIN);
        const loginData: LoginEmailRequest = {
          email: values.email,
          password: values.password,
          role: Role.Student,
          isKeepMeLoggedIn: keepLogin === 'true'
        };
        await handleLogin(async () => {
          const response = await apiLoginEmail(loginData);
          return response.data;
        }, false);
        toast.success(t('account_created_successfully'))
      } catch (error) {
        toast.error(getErrorMessage(t, error))
      } finally {
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    if (mode === 'login') {
      formik.resetForm()
      setRegisterStep(1)
    }
  }, [mode])


  const setField = (field: keyof RegisterValues, value: string) => {
    formik.setFieldValue(field, value)
  }

  const getError = (field: keyof RegisterValues) => {
    return formik.errors[field]

  }

  const validateStep = async (step: number) => {
    const stepFields: Record<number, (keyof RegisterValues)[]> = {
      1: ['email', 'password', 'confirmPassword'],
      2: ['fullName', 'phoneNumber', 'schoolName'],
      3: ['parentName', 'parentPhoneNumber'],
      4: ['grade', 'major'],
    }

    const fields = stepFields[step]

    const hasError = fields.some((field) => formik.errors[field])


    return !hasError
  }

  const subjectOptions = useMemo(() => {
    return [
      {
        label: t("liberal_arts"),
        value: t("liberal_arts"),
      },
      {
        label: t("science"),
        value: t("science"),
      },
    ];
  }, [t]);

  const gradeOptions = useMemo(() => {
    return [
      ...GRADE_OPTIONS.map((i) => ({
        ...i,
        label: typeof i.label === "string" ? t(i.label) : i.label,
      })),
    ];
  }, [t]);

  const handleNext = async () => {
    const isValid = await validateStep(registerStep)
    if (!isValid) return

    if (registerStep < TOTAL_REGISTER_STEPS) {
      setRegisterStep(prev => prev + 1)
    } else {
      formik.handleSubmit()
    }
  }

  const handleBack = () => {
    if (registerStep > 1) {
      setRegisterStep(prev => prev - 1)
    }
  }

  return {
    formik,
    setField,
    getError,
    registerStep,
    validateStep,
    subjectOptions,
    gradeOptions,
    handleNext,
    handleBack
  }
}

export default useRegisterEmail