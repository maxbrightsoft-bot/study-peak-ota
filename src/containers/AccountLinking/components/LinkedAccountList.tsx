import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import { AccountLinkResponse, AccountLinkStatus } from '../apiClients'

export type LinkedAccount = AccountLinkResponse

interface LinkedAccountListProps {
  accounts: AccountLinkResponse[]
  onUnlink: (id: number) => void
  isParentView?: boolean
}

const LinkedAccountList = ({ accounts, onUnlink, isParentView = false }: LinkedAccountListProps) => {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      {accounts.map((account) => {
        const name = isParentView
          ? account.studentName || account.studentEmail || 'Học sinh'
          : account.parentName || account.parentEmail || 'Phụ huynh'
        const email = isParentView ? account.studentEmail : account.parentEmail
        const avatarUri = isParentView ? account.studentAvatar : account.parentAvatar
        const displayLetter = (name || 'U').charAt(0).toUpperCase()
        const displayBg = isParentView ? '#7036EC' : '#5F30AA'
        const isActive = account.status === AccountLinkStatus.Accept

        return (
          <View key={account.id} style={styles.linkState}>
            {/* Header Card (không click được) */}
            <View style={styles.head}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarCircle} />
              ) : (
                <View style={[styles.avatarCircle, { backgroundColor: displayBg }]}>
                  <Text style={styles.avatarText}>{displayLetter}</Text>
                </View>
              )}

              <View style={styles.infoArea}>
                <Text style={styles.nameText}>{name}</Text>
                <Text style={styles.emailText}>{email}</Text>
              </View>

              {isActive && <View style={styles.dotGreen} />}
            </View>

            {/* Bottom Row */}
            <View style={styles.bottomRow}>
              <TouchableOpacity
                style={styles.unlinkButton}
                onPress={() => onUnlink(account.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.unlinkText}>{t('unlink')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default LinkedAccountList

const styles = ScaledSheet.create({
  container: {
    width: '100%',
    paddingBottom: '20@ms'
  },
  linkState: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: '14@ms'
  },
  head: {
    paddingHorizontal: '18@ms',
    paddingTop: '18@ms',
    paddingBottom: '14@ms',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[200] || '#EAEAEA'
  },
  avatarCircle: {
    width: '44@ms',
    height: '44@ms',
    borderRadius: '22@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@ms'
  },
  avatarText: {
    color: '#FFF',
    fontSize: '16@ms',
    fontWeight: '800'
  },
  infoArea: {
    flex: 1
  },
  nameText: {
    ...TYPO.heading3,
    fontSize: '15@ms',
    fontWeight: '800',
    color: palette.grey[900]
  },
  emailText: {
    ...TYPO.body2,
    fontSize: '12@ms',
    color: palette.grey[500],
    marginTop: '2@ms'
  },
  dotGreen: {
    width: '9@ms',
    height: '9@ms',
    borderRadius: '4.5@ms',
    backgroundColor: '#2BBA84',
    shadowColor: '#2BBA84',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 1.5,
    borderColor: '#E4F6E5'
  },
  badgeContainer: {
    flexDirection: 'row',
    paddingHorizontal: '18@ms',
    paddingTop: '10@ms',
    paddingBottom: '10@ms',
    flexWrap: 'wrap',
    gap: '6@ms',
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[200] || '#EAEAEA'
  },
  badge: {
    backgroundColor: '#F4F0FA',
    paddingHorizontal: '10@ms',
    paddingVertical: '4@ms',
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
  bottomRow: {
    paddingHorizontal: '18@ms',
    paddingTop: '10@ms',
    paddingBottom: '14@ms',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  sharedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sharedText: {
    ...TYPO.body2,
    fontSize: '12@ms',
    color: palette.grey[500]
  },
  sharedTextEditable: {
    color: '#5F30AA',
    fontWeight: '700'
  },
  chevronIcon: {
    marginLeft: '2@ms'
  },
  unlinkButton: {
    height: '34@ms',
    paddingHorizontal: '12@ms',
    borderRadius: '10@ms',
    backgroundColor: '#FDECEF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  unlinkText: {
    color: '#EB4361',
    fontSize: '13@ms',
    fontWeight: '700'
  }
})
