import React from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { utcToLocalTime } from '@/utils/helpers'
import Checkbox from '@/components/Button/Checkbox'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import useCombineGuestResults from '../hooks/useCombineGuestResults'
import { isGuestResultSelectable } from '../configs/helpers'

const DATE_FORMAT = 'HH:mm YYYY.MM.DD'

const Score = ({ earned, total, isProvisional, label }: { earned: number; total: number; isProvisional: boolean; label: string }) => (
  <View style={styles.scoreRow}>
    <Text style={styles.score}>{`${earned}/${total}`}</Text>
    {isProvisional && <Text style={styles.tag}>{label}</Text>}
  </View>
)

const CombineGuestResults = () => {
  const {
    t,
    goBack,
    results,
    selected,
    searching,
    sending,
    error,
    handleToggle,
    handleCombine,
    confirmOpen,
    openConfirm,
    closeConfirm,
    selectedNames
  } = useCombineGuestResults()

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[200]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('combine_guest_results')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>{t('combine_guest_results_hint')}</Text>

        {searching && !results && <ActivityIndicator style={{ marginTop: 12 }} color={palette.main[600]} />}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {results && !results.length && <Text style={styles.muted}>{t('no_guest_results_found')}</Text>}
        {!!results?.length && <Text style={styles.sectionTitle}>{t('guest_results_count', { count: results.length })}</Text>}
        {!!results?.length && (
          <View style={styles.card}>
            {results.map((item, index) => {
              const id = item.guestStudentExamSessionId
              const ambiguous = item.matchesOtherStudents
              const selectable = isGuestResultSelectable(item, sending)
              return (
                <TouchableOpacity
                  key={id}
                  activeOpacity={0.7}
                  disabled={!selectable}
                  onPress={() => handleToggle(id)}
                  style={[styles.resultItem, index > 0 && styles.divider, !selectable && styles.disabled]}
                >
                  <Checkbox checked={selected.includes(id)} />
                  <View style={styles.itemBody}>
                    <View style={styles.titleRow}>
                      <Text style={styles.itemTitle}>{item.guestName}</Text>
                      {ambiguous && <Text style={styles.tag}>{t('guest_result_ask_teacher')}</Text>}
                    </View>
                    <Text style={styles.itemExam}>{item.examTitle}</Text>
                    <Text style={styles.muted}>{utcToLocalTime(item.takenAt, DATE_FORMAT)}</Text>
                    <Score earned={item.earned} total={item.total} isProvisional={item.isProvisional} label={t('score_provisional')} />
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {!!results?.length && (
          <TouchableOpacity
            style={[styles.sendButton, (!selected.length || sending) && styles.disabled]}
            disabled={!selected.length || sending}
            onPress={openConfirm}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>{t('combine_selected', { count: selected.length })}</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
      <ConfirmDialog
        open={confirmOpen}
        toggle={closeConfirm}
        onConfirm={handleCombine}
        title={t('combine_guest_results')}
        text={t('combine_my_guest_results_confirm', {
          count: selected.length,
          names: selectedNames.join(', '),
          interpolation: { escapeValue: false }
        })}
        okText={t('confirm')}
        cancelText={t('cancel')}
      />
    </KeyboardAvoidingView>
  )
}

export default CombineGuestResults

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: palette.bg[100] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    backgroundColor: '#fff',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#eee'
  },
  backButton: { width: '24@ms' },
  headerTitle: { fontSize: '16@ms', fontWeight: '600', color: '#222' },
  content: { padding: '20@ms', paddingBottom: '60@ms' },
  hint: { fontSize: '14@ms', color: '#444', marginBottom: '16@ms' },
  disabled: { opacity: 0.5 },
  errorText: { color: palette.error.main, fontSize: '13@ms', marginTop: '6@ms' },
  muted: { fontSize: '12@ms', color: palette.grey[500], marginTop: '4@ms' },
  card: { backgroundColor: '#fff', borderRadius: '14@ms', marginTop: '16@ms', overflow: 'hidden' },
  resultItem: { flexDirection: 'row', alignItems: 'flex-start', gap: '12@ms', padding: '14@ms' },
  divider: { borderTopWidth: 1, borderTopColor: '#eee' },
  itemBody: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: '8@ms', flexWrap: 'wrap' },
  itemTitle: { fontSize: '14@ms', fontWeight: '700', color: '#222' },
  itemExam: { fontSize: '13@ms', color: '#222', marginTop: '2@ms' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: '6@ms', marginTop: '4@ms' },
  score: { fontSize: '14@ms', fontWeight: '700', color: '#222' },
  tag: {
    fontSize: '11@ms',
    color: '#555',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: '10@ms',
    paddingHorizontal: '8@ms',
    paddingVertical: '1@ms',
    overflow: 'hidden'
  },
  sendButton: {
    marginTop: '16@ms',
    height: '48@ms',
    borderRadius: '12@ms',
    backgroundColor: palette.main[600],
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonText: { color: '#fff', fontSize: '15@ms', fontWeight: '600' },
  sectionTitle: { fontSize: '15@ms', fontWeight: '700', color: '#222', marginTop: '28@ms' }
})
