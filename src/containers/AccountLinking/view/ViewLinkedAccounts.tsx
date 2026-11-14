import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { palette, TYPO } from '@/theme'
import { Routes } from '@/navigators/RouteName'
import {
  AccountLinkResponse,
  getLinkedAccountsApi,
  deleteLinkApi,
  syncAccountLinksApi
} from '@/containers/AccountLinking/apiClients'
import { Role } from '@/utils/enums'
import { getMessageFromError, toast } from '@/utils/helpers'
import Navbar from '../components/Navbar'
import ConnectedAcademiesModal from '@/containers/Setting/components/ConnectedAcademiesModal'
import useAuthStore from '@/store/useAuthStore'

const ViewLinkedAccounts = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  const [studentLinks, setStudentLinks] = useState<AccountLinkResponse[]>([])
  const [parentLinks, setParentLinks] = useState<AccountLinkResponse[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [syncing, setSyncing] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<Role>(Role.Parent)

  const [selectedLink, setSelectedLink] = useState<AccountLinkResponse | null>(null)
  const [isParentRoleForModal, setIsParentRoleForModal] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const fetchLinks = useCallback(async (isRefresh = false, signal?: AbortSignal) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [studentRes, parentRes] = await Promise.all([
        getLinkedAccountsApi(Role.Student, signal),
        getLinkedAccountsApi(Role.Parent, signal)
      ])
      setStudentLinks(studentRes.data?.data || [])
      setParentLinks(parentRes.data?.data || [])
    } catch (err: any) {
      if (err?.name !== 'CanceledError' && err?.message !== 'canceled') {
        console.error('Failed to fetch linked accounts:', err)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController()
      fetchLinks(false, controller.signal)
      return () => {
        controller.abort()
      }
    }, [fetchLinks])
  )

  const handleSync = async () => {
    if (syncing) return
    setSyncing(true)
    try {
      await syncAccountLinksApi({ isAll: true })
      toast.success(t('sync_success', 'Đồng bộ thành công'))
      await fetchLinks(true)
      await useAuthStore.getState().syncParentLinkedStudents()
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.message !== 'canceled') {
        toast.error(getMessageFromError(t, error))
      }
    } finally {
      setSyncing(false)
    }
  }

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

  const handleOpenConvertScreen = (linkId: number) => {
    navigation.navigate(Routes.Auth.ConvertParentRole, { linkId })
  }

  const handleCloseAcademiesModal = () => {
    setIsModalOpen(false)
    setSelectedLink(null)
  }

  const renderLinkItem = (item: AccountLinkResponse, isParentRole: boolean) => {
    // When isParentRole is true: current user is Parent, linked user is Student (child)
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
          {isParentRole && (
            <TouchableOpacity
              style={styles.convertBtn}
              onPress={() => handleOpenConvertScreen(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-horizontal" size={15} color="#5F30AA" />
              <Text style={styles.convertBtnText}>{t('convert_role')}</Text>
            </TouchableOpacity>
          )}

          {isParentRole && (
            <TouchableOpacity
              style={styles.academyBtn}
              onPress={() => handleOpenAcademiesModal(item, isParentRole)}
              activeOpacity={0.7}
            >
              <Ionicons name="business-outline" size={15} color="#5F30AA" />
              <Text style={styles.academyBtnText}>{t('academies', 'Cơ sở')}</Text>
            </TouchableOpacity>
          )}

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

  const currentList = activeTab === Role.Parent ? parentLinks : studentLinks
  const isCurrentParentRole = activeTab === Role.Parent

  return (
    <View style={styles.container}>
      <Navbar
        title={t('view_linked_accounts', 'Xem danh sách tài khoản đã liên kết')}
        rightAction={
          <TouchableOpacity
            onPress={handleSync}
            activeOpacity={0.7}
            style={styles.syncBtn}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color="#5F30AA" />
            ) : (
              <Ionicons name="sync-outline" size={20} color="#5F30AA" />
            )}
          </TouchableOpacity>
        }
      />

      {/* Segmented Tab Switcher */}
      <View style={styles.tabContainerWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === Role.Parent && styles.tabButtonActive]}
            onPress={() => setActiveTab(Role.Parent)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="school-outline"
              size={16}
              color={activeTab === Role.Parent ? '#5F30AA' : '#666'}
              style={styles.tabIcon}
            />
            <Text
              style={[styles.tabText, activeTab === Role.Parent && styles.tabTextActive]}
              numberOfLines={1}
            >
              {t('my_child', 'Con của tôi')}
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === Role.Parent ? styles.tabBadgeActive : styles.tabBadgeInactive
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === Role.Parent ? styles.tabBadgeTextActive : styles.tabBadgeTextInactive
                ]}
              >
                {parentLinks.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === Role.Student && styles.tabButtonActive]}
            onPress={() => setActiveTab(Role.Student)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="people-outline"
              size={16}
              color={activeTab === Role.Student ? '#5F30AA' : '#666'}
              style={styles.tabIcon}
            />
            <Text
              style={[styles.tabText, activeTab === Role.Student && styles.tabTextActive]}
              numberOfLines={1}
            >
              {t('my_parent', 'Phụ huynh của tôi')}
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === Role.Student ? styles.tabBadgeActive : styles.tabBadgeInactive
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === Role.Student ? styles.tabBadgeTextActive : styles.tabBadgeTextInactive
                ]}
              >
                {studentLinks.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      {loading && !refreshing && studentLinks.length === 0 && parentLinks.length === 0 ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#5F30AA" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchLinks(true)}
              tintColor="#5F30AA"
              colors={['#5F30AA']}
            />
          }
        >
          {currentList.length > 0 ? (
            <View style={styles.listWrapper}>
              {currentList.map((item) => renderLinkItem(item, isCurrentParentRole))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={activeTab === Role.Parent ? 'school-outline' : 'people-outline'}
                  size={36}
                  color="#B6B0C6"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === Role.Parent
                  ? t('no_child_links', 'Chưa có tài khoản con liên kết')
                  : t('no_parent_links', 'Chưa có tài khoản phụ huynh liên kết')}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <ConnectedAcademiesModal
        open={isModalOpen}
        onClose={handleCloseAcademiesModal}
        link={selectedLink}
        isParentRole={isParentRoleForModal}
      />
    </View>
  )
}

export default ViewLinkedAccounts

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  syncBtn: {
    padding: '6@ms'
  },
  tabContainerWrapper: {
    paddingHorizontal: '16@ms',
    paddingTop: '8@ms',
    paddingBottom: '4@ms'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBE9F0',
    borderRadius: '12@ms',
    padding: '4@ms',
    gap: '4@ms'
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '10@ms',
    paddingHorizontal: '8@ms',
    borderRadius: '9@ms',
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
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#666'
  },
  tabTextActive: {
    color: '#5F30AA',
    fontWeight: '700'
  },
  tabBadge: {
    minWidth: '20@ms',
    height: '20@ms',
    borderRadius: '10@ms',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '6@ms'
  },
  tabBadgeActive: {
    backgroundColor: '#5F30AA'
  },
  tabBadgeInactive: {
    backgroundColor: '#DCD8E4'
  },
  tabBadgeText: {
    fontSize: '11@ms',
    fontWeight: '700'
  },
  tabBadgeTextActive: {
    color: '#FFF'
  },
  tabBadgeTextInactive: {
    color: '#666'
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: '16@ms',
    paddingTop: '12@ms',
    paddingBottom: '40@ms'
  },
  listWrapper: {
    gap: '10@ms'
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: '14@ms',
    padding: '14@ms',
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: '42@ms',
    height: '42@ms',
    borderRadius: '21@ms',
    marginRight: '12@ms'
  },
  avatarPlaceholder: {
    width: '42@ms',
    height: '42@ms',
    borderRadius: '21@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@ms'
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: '16@ms',
    fontWeight: '700'
  },
  infoArea: {
    flex: 1
  },
  nameText: {
    ...TYPO.heading4,
    fontSize: '15@ms',
    fontWeight: '700',
    color: '#222'
  },
  emailText: {
    ...TYPO.body3,
    fontSize: '13@ms',
    color: palette.grey[500] || '#777',
    marginTop: '2@ms'
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '12@ms',
    paddingTop: '10@ms',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    gap: '8@ms',
    flexWrap: 'wrap'
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F0FA',
    paddingHorizontal: '12@ms',
    paddingVertical: '7@ms',
    borderRadius: '8@ms',
    gap: '4@ms'
  },
  convertBtnText: {
    color: '#5F30AA',
    fontSize: '12@ms',
    fontWeight: '700'
  },
  academyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F0FA',
    paddingHorizontal: '12@ms',
    paddingVertical: '7@ms',
    borderRadius: '8@ms',
    gap: '4@ms'
  },
  academyBtnText: {
    color: '#5F30AA',
    fontSize: '12@ms',
    fontWeight: '700'
  },
  unlinkBtn: {
    paddingHorizontal: '12@ms',
    paddingVertical: '7@ms',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '40@ms',
    paddingHorizontal: '20@ms'
  },
  emptyIconCircle: {
    width: '72@ms',
    height: '72@ms',
    borderRadius: '36@ms',
    backgroundColor: '#F0EDF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12@ms'
  },
  emptyTitle: {
    fontSize: '14@ms',
    color: '#888',
    textAlign: 'center',
    fontWeight: '500'
  }
})

