import React from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import IconGoogle from '@/assets/icons/google.svg'
import { palette } from '@/theme'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import useLinkedAccounts, { LINK_PROVIDERS } from '../hooks/useLinkedAccounts'
import { LinkProvider } from '../configs/types'
import { canUnlink, isLinked } from '../utils/linkRules'
import LinkConflictModal from '../components/LinkConflictModal'
import UnlinkGoogleModal from '../components/UnlinkGoogleModal'

const LinkedAccounts = () => {
  const {
    t,
    goBack,
    links,
    busyProvider,
    unlinkProvider,
    conflict,
    unlinkStep,
    unlinkEmail,
    unlinkCode,
    unlinkError,
    resendSecondsLeft,
    load,
    handleLink,
    handleOpenUnlink,
    handleCloseGoogleUnlink,
    handleChangeUnlinkCode,
    handleResendUnlinkCode,
    handleConfirmGoogleUnlink,
    handleCloseUnlink,
    handleConfirmUnlink,
    handleCloseConflict,
    handleRestartLink
  } = useLinkedAccounts()

  const renderAction = (provider: LinkProvider) => {
    if (!links || busyProvider === provider) return <ActivityIndicator size="small" color={palette.main[600]} />
    const disabled = !!busyProvider
    if (!isLinked(links, provider))
      return (
        <TouchableOpacity style={[styles.button, disabled && styles.disabled]} disabled={disabled} onPress={() => handleLink(provider)}>
          <Text style={styles.buttonText}>{t('link_account')}</Text>
        </TouchableOpacity>
      )
    const allowed = canUnlink(links, provider)
    return (
      <TouchableOpacity
        style={[styles.button, styles.unlinkButton, (!allowed || disabled) && styles.disabled]}
        disabled={!allowed || disabled}
        onPress={() => handleOpenUnlink(provider)}
      >
        <Text style={[styles.buttonText, styles.unlinkText]}>{t('unlink')}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[200]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('linked_accounts')}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>{t('linked_accounts_hint')}</Text>
        <View style={styles.card}>
          {LINK_PROVIDERS.map((provider, index) => {
            const linked = isLinked(links, provider)
            const showLastMethodHint = linked && !canUnlink(links, provider)
            return (
              <View key={provider} style={[styles.item, index > 0 && styles.divider]}>
                <View style={styles.itemRow}>
                  <View style={styles.provider}>
                    {provider === 'Google' ? (
                      <IconGoogle width={22} height={22} />
                    ) : (
                      <Ionicons name="logo-apple" size={24} color={palette.common.black} />
                    )}
                    <Text style={styles.providerName}>{provider}</Text>
                    {!!links && (
                      <Text style={[styles.chip, linked ? styles.chipLinked : styles.chipNotLinked]}>
                        {t(linked ? 'account_linked' : 'account_not_linked')}
                      </Text>
                    )}
                  </View>
                  {renderAction(provider)}
                </View>
                {showLastMethodHint && <Text style={styles.muted}>{t('cannot_unlink_last_method')}</Text>}
                {provider === 'Google' && linked && !showLastMethodHint && (
                  <Text style={styles.muted}>{t('unlink_sign_in_first')}</Text>
                )}
              </View>
            )
          })}
        </View>
      </ScrollView>

      <ConfirmDialog
        open={!!unlinkProvider}
        toggle={handleCloseUnlink}
        onConfirm={handleConfirmUnlink}
        isDelete
        title={t('unlink')}
        text={t('confirm_unlink_provider', { provider: unlinkProvider })}
        okText={t('unlink')}
      />
      <UnlinkGoogleModal
        t={t}
        step={unlinkStep}
        email={unlinkEmail}
        code={unlinkCode}
        error={unlinkError}
        resendSecondsLeft={resendSecondsLeft}
        onChangeCode={handleChangeUnlinkCode}
        onResend={handleResendUnlinkCode}
        onConfirm={handleConfirmGoogleUnlink}
        onClose={handleCloseGoogleUnlink}
      />
      <LinkConflictModal
        conflict={conflict}
        provider={conflict?.provider ?? 'Google'}
        onClose={handleCloseConflict}
        onMerged={load}
        onRestart={handleRestartLink}
      />
    </View>
  )
}

export default LinkedAccounts

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: palette.bg[100] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    backgroundColor: palette.common.white,
    borderBottomWidth: '1@ms',
    borderBottomColor: palette.grey[100]
  },
  backButton: { width: '24@ms' },
  headerTitle: { fontSize: '16@ms', fontWeight: '600', color: palette.grey[900] },
  content: { padding: '20@ms', paddingBottom: '60@ms' },
  hint: { fontSize: '14@ms', color: palette.grey[700], marginBottom: '16@ms' },
  card: { backgroundColor: palette.common.white, borderRadius: '14@ms', overflow: 'hidden' },
  item: { padding: '16@ms', gap: '6@ms' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '12@ms' },
  divider: { borderTopWidth: 1, borderTopColor: palette.grey[100] },
  provider: { flexDirection: 'row', alignItems: 'center', gap: '10@ms', flexShrink: 1 },
  providerName: { fontSize: '15@ms', fontWeight: '600', color: palette.grey[900] },
  chip: {
    fontSize: '11@ms',
    fontWeight: '600',
    borderRadius: '10@ms',
    paddingHorizontal: '8@ms',
    paddingVertical: '2@ms',
    overflow: 'hidden'
  },
  chipLinked: { backgroundColor: palette.success.lighter, color: palette.success.dark },
  chipNotLinked: { backgroundColor: palette.grey[100], color: palette.grey[600] },
  button: {
    minWidth: '84@ms',
    height: '36@ms',
    paddingHorizontal: '12@ms',
    borderRadius: '8@ms',
    borderWidth: 1,
    borderColor: palette.main[600],
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: { fontSize: '13@ms', fontWeight: '600', color: palette.main[600] },
  unlinkButton: { borderColor: palette.error.main },
  unlinkText: { color: palette.error.main },
  disabled: { opacity: 0.5 },
  muted: { fontSize: '12@ms', color: palette.grey[500] }
})
