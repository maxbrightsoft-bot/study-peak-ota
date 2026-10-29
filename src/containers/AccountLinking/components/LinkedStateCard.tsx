import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'
import { AccountLinkResponse } from '../apiClients'

interface LinkedStateCardProps {
  data: AccountLinkResponse | null
  onUnlink: () => void
  isParentView?: boolean
}

const LinkedStateCard = ({
  data,
  onUnlink,
  isParentView = false
}: LinkedStateCardProps) => {
  const { t } = useTranslation()

  if (!data) return null

  const name = isParentView
    ? data.studentName || data.studentEmail || 'Học sinh'
    : data.parentName || data.parentEmail || 'Phụ huynh'

  return (
    <View style={styles.completeContainer}>
      {/* Success Ring */}
      <View style={styles.successRing}>
        <Ionicons name="checkmark" size={36} color="#2ECC71" />
      </View>

      {/* Tiêu đề kết nối thành công */}
      <Text style={styles.completeTitleText}>{t('link_completed')}</Text>

      {/* Email */}
      <Text style={styles.emailText}>{isParentView ? data.studentEmail : data.parentEmail}</Text>

      {/* Thẻ trạng thái */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: isParentView ? '#7036EC' : '#5F30AA' }]}>
            <Text style={styles.avatarLetter}>{(name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.personName}>{`${name} ${isParentView ? t('child_role_label') : t('parent_role_label')}`}</Text>
            <View style={styles.statusRow}>
              <View style={styles.greenDot} />
              <Text style={styles.statusText}>{t('realtime_syncing')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Nút bấm thao tác nhanh */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.dangerBtn]}
          onPress={onUnlink}
          activeOpacity={0.8}
        >
          <Ionicons name="close-outline" size={16} color="#E74C3C" />
          <Text style={styles.dangerBtnText}>{t('unlink')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default LinkedStateCard

const styles = ScaledSheet.create({
  completeContainer: {
    alignItems: 'center',
    width: '100%'
  },
  successRing: {
    width: '72@ms',
    height: '72@ms',
    borderRadius: '36@ms',
    backgroundColor: '#EAFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12@ms',
    marginTop: '10@ms'
  },
  completeTitleText: {
    ...TYPO.heading2,
    fontSize: '18@ms',
    fontWeight: '800',
    color: palette.grey[900],
    textAlign: 'center',
    marginBottom: '4@ms'
  },
  emailText: {
    fontSize: '13@ms',
    color: palette.grey[500],
    textAlign: 'center',
    marginBottom: '20@ms'
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: '16@ms',
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '16@ms',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2'
  },
  avatarCircle: {
    width: '44@ms',
    height: '44@ms',
    borderRadius: '22@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@ms'
  },
  avatarLetter: {
    color: '#FFF',
    fontSize: '16@ms',
    fontWeight: '700'
  },
  headerInfo: {
    flex: 1
  },
  personName: {
    fontSize: '15@ms',
    fontWeight: '800',
    color: palette.grey[900]
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '2@ms'
  },
  greenDot: {
    width: '6@ms',
    height: '6@ms',
    borderRadius: '3@ms',
    backgroundColor: '#2ECC71',
    marginRight: '6@ms'
  },
  statusText: {
    fontSize: '12@ms',
    color: palette.grey[500]
  },
  badgeContainer: {
    flexDirection: 'row',
    paddingHorizontal: '18@ms',
    paddingTop: '10@ms',
    paddingBottom: '14@ms',
    flexWrap: 'wrap',
    gap: '6@ms'
  },
  badge: {
    backgroundColor: '#F4F0FA',
    paddingHorizontal: '12@ms',
    paddingVertical: '6@ms',
    borderRadius: '12@ms'
  },
  badgeDisabled: {
    backgroundColor: '#F3F4F6'
  },
  badgeText: {
    color: '#5F30AA',
    fontSize: '12@ms',
    fontWeight: '700'
  },
  badgeTextDisabled: {
    color: '#595959',
    fontWeight: '600'
  },
  cardActions: {
    flexDirection: 'row',
    gap: '10@ms',
    width: '100%'
  },
  actionBtn: {
    height: '44@ms',
    borderRadius: '12@ms',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6@ms'
  },
  primaryBtn: {
    flex: 1.4,
    backgroundColor: '#5F30AA'
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: '13@ms',
    fontWeight: '700'
  },
  dangerBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#FDEDEC',
    backgroundColor: '#FFF'
  },
  dangerBtnText: {
    color: '#E74C3C',
    fontSize: '13@ms',
    fontWeight: '700'
  }
})
