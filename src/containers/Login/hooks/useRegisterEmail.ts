import { useEffect, useMemo, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { GRADE_OPTIONS } from '@/containers/StepLogin/configs/constants'
import { useTranslation } from 'react-i18next'
import { registerAccountApi } from '@/services/api/authService'
import useAuthStore from '@/store/useAuthStore'
import { getErrorMessage, toast } from '@/utils/helpers'
import { LoginAccountMode } from '../configs/types'

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

export const formatRegisterPayload = (values: any) => {
  const { confirmPassword, ...data } = values

  return {
    ...data,
    email: data.email?.trim(),
    fullName: data.fullName?.trim(),
    phoneNumber: data.phoneNumber?.trim()?.replace(/\D/g, ''),
    parentName: data.parentName?.trim() || null,
    parentPhoneNumber: data.parentPhoneNumber?.trim()
      ? data.parentPhoneNumber.trim().replace(/\D/g, '')
      : null,
    schoolName: data.schoolName?.trim() || null,
    grade: data.grade ? Number(data.grade) : null,
    major: data.major?.trim() || null,
  }
}

export const getRegisterErrorMessage = (t: any, error: any): string => {
  if (error?.isSilent) return ''

  const status = error?.response?.status
  const data = error?.response?.data

  if (status === 400 && data?.errors && typeof data.errors === 'object') {
    const errorEntries = Object.entries(data.errors)
    for (const [field, messages] of errorEntries) {
      if (Array.isArray(messages) && messages.length > 0) {
        const msg = messages[0] as string
        if (field.includes('grade') || field.includes('Grade')) {
          return t('invalid_grade')
        }
        if (field.includes('phoneNumber') || field.includes('PhoneNumber')) {
          return t('phone_number_is_not_valid')
        }
        if (field.includes('email') || field.includes('Email')) {
          return t('invalid_email')
        }
        if (typeof msg === 'string') return msg
      }
    }
  }

  const title =
    (typeof data?.title === 'string' ? data.title : '') ||
    (typeof data?.message === 'string' ? data.message : '')

  if (title) {
    if (title.includes('이미 존재') || title.toLowerCase().includes('already exist')) {
      return t('duplicate_email')
    }
    if (title.includes('전화번호') || title.toLowerCase().includes('phone number')) {
      return t('phone_number_is_not_valid')
    }
    if (title.includes('실패 생성') || title.toLowerCase().includes('create user fail')) {
      return t('password_must_contain_special_char')
    }
  }

  return getErrorMessage(t, error, t('an_unexpected_error_has_occurred'))
}

const useRegisterEmail = ({
  mode,
  setMode,
  visible,
  onSuccess,
}: {
  mode: LoginAccountMode
  setMode: React.Dispatch<React.SetStateAction<LoginAccountMode>>
  onSuccess?: (email: string) => void
  visible?: boolean
}) => {
  const setLoading = useAuthStore((state) => state.setLoading)
  const [registerStep, setRegisterStep] = useState(1)
  const [apiError, setApiError] = useState<string | null>(null)
  const { t } = useTranslation()

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('invalid_email'))
      .required(t('email_required')),

    password: Yup.string()
      .min(6, t('password_min_length'))
      .matches(/[a-z]/, t('password_rule_lowercase'))
      .matches(/[A-Z]/, t('password_rule_uppercase'))
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
        setApiError(null)
        const payload = formatRegisterPayload(values)

        setLoading(true)
        await registerAccountApi(payload)
        toast.success(t('account_created_successfully'))
        onSuccess?.(values.email)
        setMode(LoginAccountMode.Login)
      } catch (error: any) {
        const errorMsg = getRegisterErrorMessage(t, error)
        setApiError(errorMsg)
        toast.error(errorMsg)

        const title = (error?.response?.data?.title as string) || ''
        if (
          title.includes('이미 존재') ||
          title.toLowerCase().includes('already exist') ||
          errorMsg === t('duplicate_email')
        ) {
          formik.setFieldError('email', errorMsg)
          formik.setFieldTouched('email', true, false)
          setRegisterStep(1)
        }
      } finally {
        setLoading(false)
      }
    },
  })

  const resetRegister = () => {
    formik.resetForm()
    setRegisterStep(1)
    setApiError(null)
  }

  useEffect(() => {
    if (visible === false || mode === LoginAccountMode.Login) {
      resetRegister()
    }
  }, [mode, visible])

  const setField = (field: keyof RegisterValues, value: any) => {
    if (apiError) setApiError(null)
    formik.setFieldValue(field, value)
  }

  const getError = (field: keyof RegisterValues) => {
    return formik.errors[field]
  }

  const stepFields: Record<number, (keyof RegisterValues)[]> = {
    1: ['email', 'password', 'confirmPassword'],
    2: ['fullName', 'phoneNumber', 'schoolName'],
    3: ['parentName', 'parentPhoneNumber'],
    4: ['grade', 'major'],
  }

  const validateStep = async (step: number): Promise<boolean> => {
    setApiError(null)

    for (let s = 1; s <= step; s++) {
      const flds = stepFields[s] || []
      flds.forEach((f) => formik.setFieldTouched(f, true, false))
    }

    const errors = await formik.validateForm()

    if (step === TOTAL_REGISTER_STEPS) {
      for (let s = 1; s < TOTAL_REGISTER_STEPS; s++) {
        const prevFlds = stepFields[s] || []
        const hasPrevError = prevFlds.some((f) => Boolean(errors[f]))
        if (hasPrevError) {
          setRegisterStep(s)
          return false
        }
      }
    }

    const fields = stepFields[step] || []
    const hasError = fields.some((field) => Boolean(errors[field]))

    return !hasError
  }

  const subjectOptions = useMemo(() => {
    return [
      {
        label: t('liberal_arts'),
        value: t('liberal_arts'),
      },
      {
        label: t('science'),
        value: t('science'),
      },
    ]
  }, [t])

  const gradeOptions = useMemo(() => {
    return [
      ...GRADE_OPTIONS.map((i) => ({
        ...i,
        label: typeof i.label === 'string' ? t(i.label) : i.label,
      })),
    ]
  }, [t])

  const handleNext = async () => {
    const isValid = await validateStep(registerStep)

    if (!isValid) return

    if (registerStep < TOTAL_REGISTER_STEPS) {
      setRegisterStep((prev) => prev + 1)
    } else {
      formik.handleSubmit()
    }
  }

  const handleBack = () => {
    setApiError(null)
    if (registerStep > 1) {
      setRegisterStep((prev) => prev - 1)
    }
  }

  return {
    formik,
    setField,
    getError,
    registerStep,
    setRegisterStep,
    resetRegister,
    validateStep,
    subjectOptions,
    gradeOptions,
    handleNext,
    handleBack,
    apiError,
    setApiError,
  }
}

export default useRegisterEmail
