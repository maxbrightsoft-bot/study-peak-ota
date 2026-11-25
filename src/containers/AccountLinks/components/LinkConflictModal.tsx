import React, { ReactNode } from 'react'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import ModalBase from '@/components/ModalBase/ModalBase'
import { palette } from '@/theme'
import { LinkConflict, LinkProvider, MergeDirection } from '../configs/types'
import useLinkConflict from '../hooks/useLinkConflict'
import { CODE_LENGTH, MERGE_NOTE_MAX_LENGTH } from '../utils/linkRules'
import ProfileFieldPicker from './ProfileFieldPicker'

type LinkConflictModalProps = {
  conflict?: LinkConflict
  provider: LinkProvider
  onClose: () => void
  onMerged: () => void
  /** The conflict token is dead: start the link again (fresh provider sign-in, fresh token). */
  onRestart: () => void
}

type ActionProps = {
  title: string
  onPress: () => void
  variant?: 'primary' | 'outlined' | 'text' | 'danger'
  disabled?: boolean
  loading?: boolean
}

const Action = ({ title, onPress, variant = 'text', disabled, loading }: ActionProps) => {
  const filled = variant === 'primary' || variant === 'danger'
  return (
    <TouchableOpacity
      style={[
        styles.action,
        variant === 'primary' && styles.actionPrimary,
        variant === 'danger' && styles.actionDanger,
        variant === 'outlined' && styles.actionOutlined,
        disabled && styles.disabled
      ]}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator size="small" color={filled ? palette.common.white : palette.main[600]} />
      ) : (
        <Text style={[styles.actionText, filled && styles.actionTextFilled]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const LinkConflictModal = ({ conflict, provider, onClose, onMerged, onRestart }: LinkConflictModalProps) => {
  const {
    t,
    step,
    busy,
    error,
    email,
    code,
    codeValid,
    direction,
    profiles,
    choices,
    note,
    goTo,
    setDirection,
    setChoices,
    setNote,
    handleChangeCode,
    handleSendCode,
    handleOpenFields,
    handleVerify,
    handleRequestAdmin
  } = useLinkConflict({ conflict, provider, onClose, onMerged })

  const close = () => {
    if (!busy) onClose()
  }

  const renderDirection = (value: MergeDirection, title: string, hint: string) => {
    const selected = direction === value
    return (
      <TouchableOpacity
        style={[styles.choice, selected && styles.choiceSelected]}
        onPress={() => setDirection(value)}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
      >
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={selected ? palette.main[600] : palette.grey[400]}
        />
        <View style={styles.choiceBody}>
          <Text style={styles.text}>{title}</Text>
          <Text style={styles.muted}>{hint}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderContent = (): ReactNode => {
    switch (step) {
      case 'choose':
        return (
          <View style={styles.gap}>
            <Text style={styles.text}>{t('link_conflict_body', { provider, email })}</Text>
            <Text style={styles.small}>{t('link_conflict_unlink_hint', { provider })}</Text>
            <View>
              <Text style={styles.bold}>{t('verify_by_email')}</Text>
              <Text style={styles.muted}>{t('verify_by_email_hint', { email })}</Text>
            </View>
            <View>
              <Text style={styles.bold}>{t('ask_admin')}</Text>
              <Text style={styles.muted}>{t('ask_admin_hint')}</Text>
            </View>
            <Text style={styles.small}>{t('merge_only_students')}</Text>
          </View>
        )
      case 'code':
        return (
          <View style={styles.gap}>
            <Text style={styles.text}>{t('code_sent_to', { email })}</Text>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={handleChangeCode}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              placeholder={t('enter_code')}
              placeholderTextColor={palette.grey[400]}
              autoFocus
              textContentType="oneTimeCode"
              editable={!busy}
            />
            {!!code && !codeValid && <Text style={styles.small}>{t('code_must_be_6_digits')}</Text>}
            <TouchableOpacity onPress={handleSendCode} disabled={busy}>
              <Text style={styles.link}>{t('resend_code')}</Text>
            </TouchableOpacity>
          </View>
        )
      case 'direction':
        return (
          <View style={styles.gap}>
            <Text style={styles.bold}>{t('choose_merge_direction')}</Text>
            {renderDirection('MergeOtherIntoMe', t('merge_other_into_me'), t('merge_other_into_me_hint', { email }))}
            {renderDirection('MergeMeIntoOther', t('merge_me_into_other'), t('merge_me_into_other_hint', { email }))}
          </View>
        )
      case 'fields':
        return (
          <View style={styles.gap}>
            <Text style={styles.bold}>{t('choose_profile_values')}</Text>
            {profiles && choices ? (
              <ProfileFieldPicker
                current={profiles.current}
                other={profiles.other}
                otherLabel={`${t('other_account')} (${email})`}
                direction={direction}
                choices={choices}
                onChange={setChoices}
                disabled={busy}
              />
            ) : null}
            <Text style={styles.warning}>
              {t(direction === 'MergeOtherIntoMe' ? 'merge_warning_other_closed' : 'merge_warning_me_closed', { email })}
            </Text>
          </View>
        )
      case 'admin':
        return (
          <View style={styles.gap}>
            <Text style={styles.text}>{t('ask_admin_hint')}</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={value => setNote(value.slice(0, MERGE_NOTE_MAX_LENGTH))}
              placeholder={t('admin_note')}
              placeholderTextColor={palette.grey[400]}
              maxLength={MERGE_NOTE_MAX_LENGTH}
              multiline
              editable={!busy}
            />
            <Text style={styles.counter}>{`${note.length}/${MERGE_NOTE_MAX_LENGTH}`}</Text>
          </View>
        )
      case 'expired':
        return <Text style={styles.warning}>{t('link_conflict_expired', { provider })}</Text>
      case 'adminSent':
        return <Text style={styles.success}>{t('admin_request_sent')}</Text>
    }
  }

  const renderActions = (): ReactNode => {
    const cancel = <Action title={t('cancel')} onPress={close} disabled={busy} />
    switch (step) {
      case 'choose':
        return (
          <>
            <Action title={t('verify_by_email')} variant="primary" onPress={handleSendCode} loading={busy} />
            <Action title={t('ask_admin')} variant="outlined" onPress={() => goTo('admin')} disabled={busy} />
            {cancel}
          </>
        )
      case 'code':
        return (
          <>
            <Action title={t('next')} variant="primary" onPress={() => goTo('direction')} disabled={busy || !codeValid} />
            <Action title={t('ask_admin')} variant="outlined" onPress={() => goTo('admin')} disabled={busy} />
            {cancel}
          </>
        )
      case 'direction':
        return (
          <>
            <Action title={t('next')} variant="primary" onPress={handleOpenFields} loading={busy} />
            <Action title={t('back')} onPress={() => goTo('code')} disabled={busy} />
          </>
        )
      case 'fields':
        return (
          <>
            <Action title={t('merge_accounts')} variant="danger" onPress={handleVerify} loading={busy} disabled={!choices} />
            <Action title={t('back')} onPress={() => goTo('direction')} disabled={busy} />
          </>
        )
      case 'admin':
        return (
          <>
            <Action title={t('send_request')} variant="primary" onPress={handleRequestAdmin} loading={busy} />
            <Action title={t('back')} onPress={() => goTo('choose')} disabled={busy} />
          </>
        )
      case 'expired':
        return (
          <>
            <Action title={t('start_again')} variant="primary" onPress={onRestart} />
            <Action title={t('close')} onPress={onClose} />
          </>
        )
      case 'adminSent':
        return <Action title={t('close')} variant="primary" onPress={onClose} />
    }
  }

  return (
    <ModalBase isVisible={!!conflict} onClose={close} disableBackdropPress styleContainer={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('link_conflict_title')}</Text>
        <TouchableOpacity onPress={close} disabled={busy} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={palette.grey[900]} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!!error && <Text style={styles.error}>{error}</Text>}
        {renderContent()}
      </ScrollView>
      <View style={styles.footer}>{renderActions()}</View>
    </ModalBase>
  )
}

export default LinkConflictModal

const styles = ScaledSheet.create({
  container: { backgroundColor: palette.common.white, borderRadius: '20@ms' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingTop: '16@ms',
    paddingBottom: '8@ms',
    gap: '8@ms'
  },
  title: { flex: 1, fontSize: '16@ms', fontWeight: '700', color: palette.grey[900] },
  closeButton: { padding: '4@ms' },
  scroll: { flexShrink: 1 },
  content: { paddingHorizontal: '20@ms', paddingVertical: '8@ms' },
  gap: { gap: '12@ms' },
  text: { fontSize: '14@ms', color: palette.grey[900] },
  bold: { fontSize: '14@ms', fontWeight: '700', color: palette.grey[900] },
  muted: { fontSize: '13@ms', color: palette.grey[500], marginTop: '2@ms' },
  small: { fontSize: '12@ms', color: palette.grey[500] },
  link: { fontSize: '14@ms', fontWeight: '600', color: palette.main[600] },
  error: {
    fontSize: '13@ms',
    color: palette.error.dark,
    backgroundColor: palette.red[100],
    borderRadius: '8@ms',
    padding: '10@ms',
    marginBottom: '12@ms'
  },
  warning: {
    fontSize: '13@ms',
    color: palette.warning.darker,
    backgroundColor: palette.warning.lighter,
    borderRadius: '8@ms',
    padding: '10@ms'
  },
  success: {
    fontSize: '14@ms',
    color: palette.success.darker,
    backgroundColor: palette.success.lighter,
    borderRadius: '8@ms',
    padding: '10@ms'
  },
  codeInput: {
    height: '52@ms',
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: '10@ms',
    paddingHorizontal: '12@ms',
    fontSize: '22@ms',
    letterSpacing: 6,
    textAlign: 'center',
    color: palette.grey[900]
  },
  noteInput: {
    minHeight: '96@ms',
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: '10@ms',
    padding: '12@ms',
    fontSize: '14@ms',
    color: palette.grey[900],
    textAlignVertical: 'top'
  },
  counter: { alignSelf: 'flex-end', fontSize: '12@ms', color: palette.grey[500] },
  choice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '10@ms',
    borderWidth: 1,
    borderColor: palette.grey[200],
    borderRadius: '10@ms',
    padding: '12@ms'
  },
  choiceSelected: { borderColor: palette.main[600], backgroundColor: palette.main[50] },
  choiceBody: { flex: 1 },
  footer: { padding: '16@ms', gap: '8@ms' },
  action: { height: '46@ms', borderRadius: '10@ms', alignItems: 'center', justifyContent: 'center' },
  actionPrimary: { backgroundColor: palette.main[600] },
  actionDanger: { backgroundColor: palette.error.main },
  actionOutlined: { borderWidth: 1, borderColor: palette.main[600] },
  actionText: { fontSize: '15@ms', fontWeight: '600', color: palette.main[600] },
  actionTextFilled: { color: palette.common.white },
  disabled: { opacity: 0.5 }
})
