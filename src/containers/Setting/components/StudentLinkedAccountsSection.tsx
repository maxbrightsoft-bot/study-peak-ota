import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import {
  AccountLinkResponse,
  getLinkedAccountsApi,
  deleteLinkApi
} from '@/containers/AccountLinking/apiClients'
import { Role } from '@/utils/enums'
import { getMessageFromError, toast, checkIsParent } from '@/utils/helpers'
import ConnectedAcademiesModal from './ConnectedAcademiesModal'

interface Props {
  open: boolean
  refreshKey?: number
  onCloseDrawer: () => void
}

const StudentLinkedAccountsSection = ({ open, refreshKey, onCloseDrawer }: Props) => {
  const { t } = useTranslation()

  const [studentLinks, setStudentLinks] = useState<AccountLinkResponse[]>([])
  const [parentLinks, setParentLinks] = useState<AccountLinkResponse[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'child' | 'parent'>(() =>
    checkIsParent() ? 'child' : 'parent'
  )

  const [selectedLink, setSelectedLink] = useState<AccountLinkResponse | null>(null)
  const [isParentRoleForModal, setIsParentRoleForModal] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const fetchLinks = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const [studentRes, parentRes] = await Promise.all([
        getLinkedAccountsApi(Role.Student, signal),
        getLinkedAccountsApi(Role.Parent, signal)
      ])
      setStudentLinks(studentRes.data?.data || [])
      setParentLinks(parentRes.data?.data || [])
    } catch (err: any) {
      if (err?.name !== 'CanceledError' && err?.message !== 'canceled') {
        console.error('Failed to fetch linked accounts in settings:', err)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    if (open) {
      setActiveTab(checkIsParent() ? 'child' : 'parent')
      fetchLinks(controller.signal)
    }
    return () => {
      controller.abort()
    }
  }, [open, refreshKey, fetchLinks])

  const handleUnlink = (id: number, isParentRole: boolean) => {
    Alert.alert(
      t('confirm_unlink', 'Xác nhận hủy liên kết'),
      t('confirm_unlink_desc', 'Bạn có chắc chắn muốn hủy liên kết với tài khoản này không?'),
      [
        { text: t('cancel', 'Hủy'), style: 'cancel' },
        {
          text: t('unlink', 'Hủy liên kết'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLinkApi(id)
              if (isParentRole) {
                setParentLinks((prev) => prev.filter((item) => item.id !== id))
              } else {
                setStudentLinks((prev) => prev.filter((item) => item.id !== id))
              }
              toast.success(t('unlink_success', 'Hủy liên kết thành công'))
            } catch (error: any) {
              toast.error(getMessageFromError(t, error))
            }
          }
        }
      ]
    )
  }

  const handleOpenAcademiesModal = (link: AccountLinkResponse, isParentRole: boolean) => {
    setSelectedLink(link)
    setIsParentRoleForModal(isParentRole)
    setIsModalOpen(true)
  }

  const handleCloseAcademiesModal = () => {
    setIsModalOpen(false)
    setSelectedLink(null)
  }

  const renderLinkItem = (item: AccountLinkResponse, isParentRole: boolean) => {
    // When isParentRole is true: current user is Parent, linked user is Student
    // When isParentRole is false: current user is Student, linked user is Parent
    const name = isParentRole
      ? item.studentName || item.studentEmail || t('student', 'Học sinh')
      : item.parentName || item.parentEmail || t('parent', 'Phụ huynh')
    const email = isParentRole ? item.studentEmail : item.parentEmail
    const avatarUri = isParentRole ? item.studentAvatar : item.parentAvatar
    const initial = (name || 'U').charAt(0).toUpperCase()
    const avatarBg = isParentRole ? '#7036EC' : '#5F30AA'

    return (
      <View key={item.id} style={styles.itemCard}>
        <View style={styles.topRow}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}

          <View style={styles.infoArea}>
            <Text style={styles.nameText} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.emailText} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.academyBtn}
            onPress={() => handleOpenAcademiesModal(item, isParentRole)}
            activeOpacity={0.7}
          >
            <Ionicons name="business-outline" size={15} color="#5F30AA" />
            <Text style={styles.academyBtnText}>{t('academies', 'Cơ sở')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.unlinkBtn}
            onPress={() => handleUnlink(item.id, isParentRole)}
            activeOpacity={0.7}
          >
            <Text style={styles.unlinkBtnText}>{t('unlink', 'Hủy liên kết')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.sectionContainer}>
      {/* 2-tab Switcher: My child vs My parent */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'child' && styles.tabButtonActive]}
          onPress={() => setActiveTab('child')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="school-outline"
            size={16}
            color={activeTab === 'child' ? '#5F30AA' : '#666'}
            style={styles.tabIcon}
          />
          <Text
            style={[styles.tabText, activeTab === 'child' && styles.tabTextActive]}
            numberOfLines={1}
          >
            {t('my_child', 'Con của tôi')}
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === 'child' ? styles.tabBadgeActive : styles.tabBadgeInactive
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === 'child' ? styles.tabBadgeTextActive : styles.tabBadgeTextInactive
              ]}
            >
              {parentLinks.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'parent' && styles.tabButtonActive]}
          onPress={() => setActiveTab('parent')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={activeTab === 'parent' ? '#5F30AA' : '#666'}
            style={styles.tabIcon}
          />
          <Text
            style={[styles.tabText, activeTab === 'parent' && styles.tabTextActive]}
            numberOfLines={1}
          >
            {t('my_parent', 'Phụ huynh của tôi')}
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === 'parent' ? styles.tabBadgeActive : styles.tabBadgeInactive
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === 'parent' ? styles.tabBadgeTextActive : styles.tabBadgeTextInactive
              ]}
            >
              {studentLinks.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {loading && studentLinks.length === 0 && parentLinks.length === 0 ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="small" color="#5F30AA" />
        </View>
      ) : activeTab === 'child' ? (
        parentLinks.length > 0 ? (
          <ScrollView
            style={styles.itemsScrollContainer}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.itemsWrapper}>
              {parentLinks.map((item) => renderLinkItem(item, true))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {t('no_child_links', 'Chưa có tài khoản con liên kết')}
            </Text>
          </View>
        )
      ) : studentLinks.length > 0 ? (
        <ScrollView
          style={styles.itemsScrollContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.itemsWrapper}>
            {studentLinks.map((item) => renderLinkItem(item, false))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {t('no_parent_links', 'Chưa có tài khoản phụ huynh liên kết')}
          </Text>
        </View>
      )}

      <ConnectedAcademiesModal
        open={isModalOpen}
        onClose={handleCloseAcademiesModal}
        link={selectedLink}
        isParentRole={isParentRoleForModal}
        onSwitchSuccess={onCloseDrawer}
      />
    </View>
  )
}

export default StudentLinkedAccountsSection

const styles = ScaledSheet.create({
  sectionContainer: {
    paddingHorizontal: '16@ms',
    paddingVertical: '12@ms',
    backgroundColor: '#FAFAFB',
    borderRadius: '12@ms',
    marginHorizontal: '16@ms',
    marginVertical: '8@ms'
  },
  loadingWrapper: {
    paddingVertical: '20@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBE9F0',
    borderRadius: '10@ms',
    padding: '3@ms',
    marginBottom: '10@ms',
    gap: '4@ms'
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '8@ms',
    paddingHorizontal: '6@ms',
    borderRadius: '8@ms',
    gap: '5@ms'
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  tabIcon: {
    marginRight: '2@ms'
  },
  tabText: {
    ...TYPO.heading4,
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#666'
  },
  tabTextActive: {
    color: '#5F30AA',
    fontWeight: '700'
  },
  tabBadge: {
    minWidth: '18@ms',
    height: '18@ms',
    borderRadius: '9@ms',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '5@ms'
  },
  tabBadgeActive: {
    backgroundColor: '#5F30AA'
  },
  tabBadgeInactive: {
    backgroundColor: '#DCD8E4'
  },
  tabBadgeText: {
    fontSize: '10@ms',
    fontWeight: '700'
  },
  tabBadgeTextActive: {
    color: '#FFF'
  },
  tabBadgeTextInactive: {
    color: '#666'
  },
  itemsScrollContainer: {
    maxHeight: '280@ms'
  },
  itemsWrapper: {
    gap: '8@ms'
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: '12@ms',
    padding: '12@ms',
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '18@ms',
    marginRight: '10@ms'
  },
  avatarPlaceholder: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '18@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10@ms'
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: '14@ms',
    fontWeight: '700'
  },
  infoArea: {
    flex: 1
  },
  nameText: {
    ...TYPO.heading4,
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#222'
  },
  emailText: {
    ...TYPO.body3,
    fontSize: '12@ms',
    color: palette.grey[500] || '#777',
    marginTop: '2@ms'
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '10@ms',
    paddingTop: '8@ms',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    gap: '8@ms'
  },
  academyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F0FA',
    paddingHorizontal: '10@ms',
    paddingVertical: '6@ms',
    borderRadius: '8@ms',
    gap: '4@ms'
  },
  academyBtnText: {
    color: '#5F30AA',
    fontSize: '12@ms',
    fontWeight: '700'
  },
  unlinkBtn: {
    paddingHorizontal: '10@ms',
    paddingVertical: '6@ms',
    borderRadius: '8@ms',
    backgroundColor: '#FDECEF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  unlinkBtnText: {
    color: '#EB4361',
    fontSize: '12@ms',
    fontWeight: '700'
  },
  emptyCard: {
    paddingVertical: '10@ms',
    paddingHorizontal: '12@ms',
    backgroundColor: '#FFF',
    borderRadius: '8@ms',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: '12@ms',
    color: '#999',
    fontStyle: 'italic'
  }
})
