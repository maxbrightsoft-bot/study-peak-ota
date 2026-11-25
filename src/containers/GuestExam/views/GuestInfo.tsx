import React, { FC } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import TextField, { KeyboardType } from '@/components/Input/TextField'
import CustomSelect from '@/components/Select/CustomSelect'
import Checkbox from '@/components/Button/Checkbox'
import SchoolSearchSelect from '@/components/Select/SchoolSearchSelect'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import useGuestInfo from '../hooks/useGuestInfo'
import { GuestInfoFormValues } from '../configs/types'

type FieldLabelProps = { label: string; required?: boolean }

const FieldLabel: FC<FieldLabelProps> = ({ label, required }) => (
  <View style={styles.labelRow}>
    <Text style={styles.label}>{label}</Text>
    {required && <Text style={styles.required}> *</Text>}
  </View>
)

const GuestInfo = () => {
  const {
    t,
    exam,
    academy,
    formik,
    gradeOptions,
    submitError,
    isWaiting,
    isConsentOpen,
    openConsent,
    closeConsent,
    goToCode
  } = useGuestInfo()

  const getError = (field: keyof GuestInfoFormValues) =>
    formik.submitCount > 0 || formik.touched[field] ? (formik.errors[field] as string | undefined) : undefined

  const setField = (field: keyof GuestInfoFormValues) => (value: string | number | boolean) => {
    formik.setFieldValue(field, value)
    formik.setFieldTouched(field, true, false)
  }

  const isBusy = formik.isSubmitting || isWaiting

  if (!exam) return <SafeAreaView style={styles.safeArea} />

  const examRows = [
    { label: t('academy'), value: academy?.isLearningSpace ? t('my_study_space') : exam.academyName || academy?.name },
    { label: t('exam'), value: exam.examTitle },
    { label: t('subject'), value: exam.subjectName },
    { label: t('number_of_questions'), value: `${exam.totalQuestions}` },
    { label: t('guest_time_limit'), value: `${exam.durationMinutes}${t('minutes')}` }
  ].filter(row => !!row.value)

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goToCode} style={styles.backButton} accessibilityLabel={t('guest_reenter_code')}>
            <Ionicons name="arrow-back" size={24} color={palette.grey[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('guest_code_checked', { code: exam.code })}</Text>
          <View style={styles.backButton} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.examCard}>
            {examRows.map(row => (
              <View key={row.label} style={styles.examRow}>
                <Text style={styles.examLabel}>{row.label}</Text>
                <Text style={styles.examValue} numberOfLines={2}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.note}>{t('guest_paper_note')}</Text>

          <Text style={styles.title}>{t('guest_info_title')}</Text>
          <View>
            <FieldLabel label={t('full_name')} required />
            <TextField
              value={formik.values.fullName}
              onChangeText={setField('fullName')}
              error={getError('fullName')}
              disabled={isBusy}
              autoCorrect={false}
              maxLength={100}
            />
          </View>
          <View>
            <FieldLabel label={t('grade')} required />
            <CustomSelect
              value={formik.values.grade}
              options={gradeOptions}
              placeholder={t('grade')}
              disabled={isBusy}
              onValueChange={value => setField('grade')(value)}
            />
            {!!getError('grade') && <Text style={styles.fieldError}>{getError('grade')}</Text>}
          </View>
          {/* School search (public NEIS lookup, no auth) with an "use as entered" fallback for any school. */}
          <View pointerEvents={isBusy ? 'none' : 'auto'}>
            <FieldLabel label={t('school')} required />
            <SchoolSearchSelect
              value={formik.values.schoolName}
              onValueChange={value => setField('schoolName')(value)}
              placeholder={t('school_name')}
            />
            {!!getError('schoolName') && <Text style={styles.fieldError}>{getError('schoolName')}</Text>}
          </View>
          <View>
            <FieldLabel label={t('parent_phone')} required />
            <TextField
              value={formik.values.parentPhone}
              onChangeText={setField('parentPhone')}
              error={getError('parentPhone')}
              disabled={isBusy}
              keyboardType={KeyboardType.phonePad as 'phone-pad'}
              placeholder={t('guest_phone_placeholder')}
            />
          </View>
          <View>
            <FieldLabel label={t('student_phone_optional')} />
            <TextField
              value={formik.values.studentPhone}
              onChangeText={setField('studentPhone')}
              error={getError('studentPhone')}
              disabled={isBusy}
              keyboardType={KeyboardType.phonePad as 'phone-pad'}
            />
          </View>

          <View style={styles.consentRow}>
            <TouchableOpacity
              style={styles.consentToggle}
              disabled={isBusy}
              onPress={() => setField('consent')(!formik.values.consent)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: formik.values.consent }}
            >
              <Checkbox checked={formik.values.consent} />
              <Text style={styles.consentText}>{t('guest_consent')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openConsent}>
              <Text style={styles.link}>{t('view')}</Text>
            </TouchableOpacity>
          </View>
          {!!getError('consent') && <Text style={styles.fieldError}>{getError('consent')}</Text>}

          <Text style={styles.hint}>{t('guest_resume_hint')}</Text>
          {!!submitError && <Text style={styles.submitError}>{submitError}</Text>}

          {isWaiting ? (
            <View style={styles.waiting}>
              <ActivityIndicator color={palette.main[600]} />
              <Text style={styles.waitingText}>{t('guest_exam_not_started')}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.start, isBusy && styles.startDisabled]}
              disabled={isBusy}
              onPress={() => formik.handleSubmit()}
            >
              {formik.isSubmitting ? (
                <ActivityIndicator color={palette.grey[0]} />
              ) : (
                <Text style={styles.startText}>{t('start_exam')}</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <CommonDialog isVisible={isConsentOpen} onClose={closeConsent} title={t('guest_consent_title')}>
        <Text style={styles.consentDetail}>{t('guest_consent_detail')}</Text>
      </CommonDialog>
    </SafeAreaView>
  )
}

export default GuestInfo

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.grey[0]
  },
  flex: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '16@ms',
    paddingVertical: '8@ms'
  },
  backButton: {
    width: '40@ms',
    height: '40@ms',
    justifyContent: 'center'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: '15@ms',
    fontWeight: '600',
    color: palette.main[600]
  },
  content: {
    paddingHorizontal: '24@ms',
    paddingBottom: '32@ms',
    gap: '14@ms'
  },
  examCard: {
    padding: '16@ms',
    borderRadius: '14@ms',
    backgroundColor: palette.grey[50],
    gap: '8@ms'
  },
  examRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '12@ms'
  },
  examLabel: {
    fontSize: '14@ms',
    color: palette.grey[500]
  },
  examValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },
  note: {
    fontSize: '13@ms',
    lineHeight: '19@ms',
    color: palette.main[600]
  },
  title: {
    marginTop: '8@ms',
    fontSize: '20@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: '6@ms'
  },
  label: {
    fontSize: '14@ms',
    fontWeight: '500',
    color: palette.grey[900]
  },
  required: {
    fontSize: '14@ms',
    color: palette.red[900]
  },
  fieldError: {
    marginTop: '4@ms',
    fontSize: '12@ms',
    color: palette.red[900]
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '8@ms'
  },
  consentToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '10@ms'
  },
  consentText: {
    flex: 1,
    fontSize: '14@ms',
    lineHeight: '20@ms',
    color: palette.grey[800]
  },
  link: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.main[600],
    textDecorationLine: 'underline'
  },
  consentDetail: {
    fontSize: '14@ms',
    lineHeight: '21@ms',
    color: palette.grey[800]
  },
  hint: {
    fontSize: '13@ms',
    color: palette.grey[500]
  },
  submitError: {
    fontSize: '14@ms',
    color: palette.red[900],
    textAlign: 'center'
  },
  start: {
    height: '52@ms',
    borderRadius: '14@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.main[600]
  },
  startDisabled: {
    backgroundColor: palette.main[100]
  },
  startText: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: palette.grey[0]
  },
  waiting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10@ms',
    padding: '16@ms',
    borderRadius: '14@ms',
    backgroundColor: palette.main[50]
  },
  waitingText: {
    flexShrink: 1,
    fontSize: '14@ms',
    fontWeight: '500',
    color: palette.main[600]
  }
})
