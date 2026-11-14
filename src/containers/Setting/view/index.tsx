import React, { useEffect, useState } from 'react'
import UserIcon from '@/assets/iconJSX/user'
import SignOut from '@/assets/iconJSX/signOut'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { Routes, MainRoutes } from '@/navigators/RouteName'
import Notice from '@/containers/Notice/view'
import UpdateAccount from '../components/UpdateAccount'
import useSetting from '../hooks/useSetting'
import useBiometric from '../hooks/useBiometric'
import CalendarSchedule from '@/containers/Home/components/CalendarSchedule'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import LanguageDialog from '../components/LanguageDialog'
import PolicyViewer from '../components/PolicyViewer'
import { PRIVACY_POLICY_CONTENT, TERMS_OF_SERVICE_CONTENT } from '../configs/policyContent'
import useAppStore from '@/store/useAppStore'
import DeviceInfo from 'react-native-device-info'
import { getLinkedAccountsApi, syncAccountLinksApi } from '@/containers/AccountLinking/apiClients'
import { checkIsParent, checkIsStudent, getMessageFromError, toast } from '@/utils/helpers'
import PremiumSwitch from '@/components/Switch/PremiumSwitch'
import useAuthStore from '@/store/useAuthStore'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'

type Props = {
  open: boolean
  onClose: () => void
}

const SettingItem = ({
  icon,
  title,
  onPress,
  rightAction,
}: {
  icon: React.ReactNode
  title: string
  onPress: () => void
  rightAction?: React.ReactNode
}) => {
  if (rightAction) {
    return (
      <View style={styles.itemWithActionRow}>
        <TouchableOpacity style={styles.itemFlex} onPress={onPress}>
          <View style={styles.icon}>{icon}</View>
          <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
        {rightAction}
      </View>
    )
  }

  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

const Setting = ({ open, onClose }: Props) => {
  const {
    t,
    user,
    logout,
    gradeOptions,
    subjectOptions,
    openNoticeDialog,
    handleUpdateInfo,
    openSchedule,
    handleToggleSchedule,
    handleOpenNoticeDialog,
    handleCloseNoticeDialog,
    openUpdateUserDialog,
    handleOpenUpdateUserDialog,
    handleCloseUpdateUserDialog,
    handleRemoveAccount,
    openConfirmRemoveAccount,
    handleToggleConfirmRemoveAccount,
    openLanguageDialog,
    handleToggleLanguageDialog,
    changeLanguage,
    openPrivacyPolicy,
    openTermsOfService,
    openDemoDialog,
    isDemoActive,
    handleTogglePrivacyPolicy,
    handleToggleTermsOfService,
    handleToggleDemoDialog,
    handleEnterDemoMode,
    handleExitDemoMode,
  } = useSetting()

  const bundleVersion = useAppStore((state) => state.bundleVersion)
  const parentViewMode = useAuthStore((state) => state.parentViewMode)
  const syncParentLinkedStudents = useAuthStore((state) => state.syncParentLinkedStudents)
  const appVersion = DeviceInfo.getVersion();
  const navigation = useNavigation<any>();
  const pendingRequests = useAccountLinkingStore((state) => state.pendingRequests);
  const hasUnsyncedLinks = useAccountLinkingStore((state) => state.hasUnsyncedLinks);
  const fetchWaitingApprovalRequestsApi = useAccountLinkingStore((state) => state.fetchWaitingApprovalRequestsApi);

  const { isBiometricEnabled, handleToggleBiometric, authenticateBiometric } = useBiometric()

  useEffect(() => {
    const controller = new AbortController()
    if (open) {
      if (checkIsParent()) {
        syncParentLinkedStudents(controller.signal)
          .catch((err) => {
             if (err.name !== 'CanceledError' && err.message !== 'canceled') {
               toast.error(getMessageFromError(t, err))
             }
          })
      }
      if (checkIsStudent()) {
        fetchWaitingApprovalRequestsApi()
      }
    }
    return () => controller.abort()
  }, [open])

  const handleOpenTutorial = () => {
    onClose()
    navigation.navigate(Routes.Auth.Tutorial)
  }

  const [isSyncing, setIsSyncing] = useState(false)

  const handleSyncLinkedAccounts = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      await syncAccountLinksApi({ isAll: true })
      toast.success(t('sync_success'))

      const response = await getLinkedAccountsApi()
      const data = response.data?.data || []
      useAccountLinkingStore.getState().setLinkedAccounts(data)

      if (checkIsParent()) {
        await syncParentLinkedStudents()
      }
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.message !== 'canceled') {
        toast.error(getMessageFromError(t, error))
      }
    } finally {
      setIsSyncing(false)
    }
  }

  const renderSyncButton = () => (
    <TouchableOpacity
      style={styles.syncButton}
      onPress={handleSyncLinkedAccounts}
      disabled={isSyncing}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {isSyncing ? (
        <ActivityIndicator size="small" color="#5F30AA" />
      ) : (
        <View style={styles.syncIconContainer}>
          <Ionicons name="sync-outline" size={20} color="#5F30AA" />
          {hasUnsyncedLinks && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>!</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  )

  const handleLinkAccount = async () => {
    const isAuth = await authenticateBiometric(t('biometric_prompt_access'))
    if (!isAuth) {
      return
    }
    onClose()
    const isParent = checkIsParent()
    const isStudent = checkIsStudent()
    let targetScreen = Routes.Auth.AccountLinkRoleSelection
    // Refresh store in background without blocking navigation
    let response;
    try {
      response = await getLinkedAccountsApi();
    } catch (error) {
    }
    const data = response?.data?.data || []
    useAccountLinkingStore.getState().setLinkedAccounts(data)
    
    if (isParent) {
      targetScreen = Routes.Auth.ParentLinkRequest
    } else if (isStudent && data.length > 0) {
      targetScreen = Routes.Auth.StudentLinkShare
    }

    navigation.navigate(MainRoutes.AuthStack, {
      screen: Routes.Auth.AccountLinkingGroup,
      params: {
        screen: targetScreen,
        params: {
          preventFirstFetch: true,
        },
      },
    })
  }

  const handleOpenPendingRequests = async () => {
    const isAuth = await authenticateBiometric(t('biometric_prompt_access'))
    if (!isAuth) {
      return
    }

    onClose()
    navigation.navigate(MainRoutes.AuthStack, {
      screen: Routes.Auth.AccountLinkingGroup,
      params: {
        screen: Routes.Auth.PendingLinkRequests,
      },
    })
  }

  const handleOpenViewLinkedAccounts = async () => {
    const isAuth = await authenticateBiometric(t('biometric_prompt_access'))
    if (!isAuth) {
      return
    }

    onClose()
    navigation.navigate(MainRoutes.AuthStack, {
      screen: Routes.Auth.AccountLinkingGroup,
      params: {
        screen: Routes.Auth.ViewLinkedAccounts,
      },
    })
  }

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={[styles.header]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[800] || '#222'} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('settings')}</Text>

        <View style={{ width: 40 }} />
      </View>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.accountInfoCard}>
            <Text style={styles.accountInfoLabel}>{t('account_info')}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.accountInfoEmail}>{user?.email}</Text>
          </View>

          {!isDemoActive && (
            <>
              <View style={styles.card}>
                <SettingItem onPress={() => handleOpenUpdateUserDialog()} icon={<UserIcon />} title={t('account_management')} />
              </View>
              <View style={styles.card}>
                <SettingItem
                  onPress={handleLinkAccount}
                  icon={<Ionicons name="link-outline" size={22} color="#222222" />}
                  title={t('link_account')}
                  rightAction={renderSyncButton()}
                />
                {checkIsStudent() && (
                  <>
                    <View style={styles.biometricDivider} />
                    <SettingItem
                      onPress={handleOpenPendingRequests}
                      icon={<Ionicons name="mail-unread-outline" size={22} color="#222222" />}
                      title={t('pending_link_requests', 'Yêu cầu kết nối')}
                      rightAction={
                        pendingRequests.length > 0 ? (
                          <View style={styles.pendingBadge}>
                            <Text style={styles.pendingBadgeText}>
                              {pendingRequests.length > 99 ? '99+' : pendingRequests.length}
                            </Text>
                          </View>
                        ) : undefined
                      }
                    />
                  </>
                )}
                <View style={styles.biometricDivider} />
                <SettingItem
                  onPress={handleOpenViewLinkedAccounts}
                  icon={<Ionicons name="people-outline" size={22} color="#222222" />}
                  title={t('view_linked_accounts', 'Xem danh sách tài khoản đã liên kết')}
                  rightAction={
                    <Ionicons
                      name="chevron-forward-outline"
                      size={20}
                      color="#666"
                    />
                  }
                />
                <View style={styles.biometricDivider} />
                <View style={styles.biometricRow}>
                  <View style={styles.biometricInfo}>
                    <View style={styles.biometricTitleRow}>
                      <Ionicons name="finger-print-outline" size={20} color="#5F30AA" style={{ marginRight: 8 }} />
                      <Text style={styles.biometricTitle}>{t('biometric_security')}</Text>
                    </View>
                    <Text style={styles.biometricDesc}>{t('biometric_security_desc')}</Text>
                  </View>
                  <PremiumSwitch value={isBiometricEnabled} onValueChange={handleToggleBiometric} />
                </View>
              </View>
            </>
          )}

          {user?.academyDomain && <View style={styles.card}>
            <SettingItem
              onPress={() => handleOpenNoticeDialog()}
              icon={<Ionicons name="notifications" size={22} color={"#222222"} />}
              title={t('receive_notifications')}
            />
          </View>}

          <View style={styles.card}>
            <SettingItem
              onPress={() => handleToggleLanguageDialog()}
              icon={<Ionicons name="language-outline" size={22} color={'#222222'} />}
              title={t('language')}
            />
          </View>

          <View style={styles.card}>
            <SettingItem
              onPress={() => handleTogglePrivacyPolicy()}
              icon={<Ionicons name="document-text-outline" size={22} color={'#222222'} />}
              title={t('privacy_policy')}
            />
          </View>

          <View style={styles.card}>
            <SettingItem
              onPress={() => handleToggleTermsOfService()}
              icon={<Ionicons name="newspaper-outline" size={22} color={'#222222'} />}
              title={t('terms_of_service')}
            />
          </View>

          <View style={styles.card}>
            <SettingItem
              onPress={handleOpenTutorial}
              icon={<Ionicons name="information-circle-outline" size={22} color={'#222222'} />}
              title={t('app_tutorial')}
            />
          </View>

          {!parentViewMode?.isActive && (
            <View style={styles.card}>
              <SettingItem
                onPress={isDemoActive ? handleExitDemoMode : handleToggleDemoDialog}
                icon={<Ionicons name={isDemoActive ? 'exit-outline' : 'game-controller-outline'} size={22} color={'#222222'} />}
                title={isDemoActive ? t('exit_demo_mode') : t('demo_mode')}
              />
            </View>
          )}

          {!isDemoActive && !parentViewMode?.isActive && (
            <View style={styles.card}>
              <SettingItem onPress={() => handleToggleConfirmRemoveAccount()} icon={<Ionicons name="trash-outline" size={20} color={palette.error.main} />} title={t('delete_account')} />
            </View>
          )}

          <TouchableOpacity style={styles.logout} onPress={() => logout()}>
            <SignOut />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </ScrollView>

        {!parentViewMode?.isActive && (
          <TouchableOpacity style={styles.button} onPress={() => handleToggleSchedule()}>
            <Text style={styles.buttonText}>{t('add_new_schedule')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.versionFooter}>
          <Text style={styles.versionFooterText}>{`${t('version')}: ${appVersion} (${bundleVersion})`}</Text>
        </View>
      </View>
      <Notice open={openNoticeDialog} onClose={handleCloseNoticeDialog} />
      {openUpdateUserDialog && (
        <UpdateAccount
          open={openUpdateUserDialog}
          onClose={handleCloseUpdateUserDialog}
          handleUpdateInfo={handleUpdateInfo}
          gradeOptions={gradeOptions}
          subjectOptions={subjectOptions}
        />
      )}
      {openSchedule && <CalendarSchedule isVisible={openSchedule} onClose={handleToggleSchedule} />}
      <ConfirmDialog
        open={openConfirmRemoveAccount}
        toggle={handleToggleConfirmRemoveAccount}
        onConfirm={handleRemoveAccount}
        title={t('delete_account')}
        isDelete
        confirmText={user?.email}
        text={t('delete_account_confirm')}
      />
      <ConfirmDialog
        open={openDemoDialog}
        toggle={handleToggleDemoDialog}
        onConfirm={handleEnterDemoMode}
        title={t('demo_mode')}
        text={t('demo_mode_confirm')}
        okText={t('confirm')}
      />
      <LanguageDialog
        open={openLanguageDialog}
        onClose={handleToggleLanguageDialog}
        onSelect={changeLanguage}
      />
      <PolicyViewer
        open={openPrivacyPolicy}
        onClose={handleTogglePrivacyPolicy}
        title={t('privacy_policy')}
        content={PRIVACY_POLICY_CONTENT}
      />
      <PolicyViewer
        open={openTermsOfService}
        onClose={handleToggleTermsOfService}
        title={t('terms_of_service')}
        content={TERMS_OF_SERVICE_CONTENT}
      />
    </SlideDrawerRoot>
  )
}

export default Setting

const styles = ScaledSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#eee'
  },
  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222'
  },

  backButton: {
    width: '40@ms',
    height: '40@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    flex: 1,
    backgroundColor: palette.bg[100],
    paddingHorizontal: '20@ms',
    paddingTop: '20@ms'
  },

  accountInfoCard: {
    backgroundColor: '#fff',
    borderRadius: '14@ms',
    marginBottom: '16@ms',
    paddingVertical: '16@ms',
    paddingHorizontal: '16@ms',
  },

  accountInfoLabel: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: palette.grey[500],
    marginBottom: '4@ms',
  },

  accountInfoEmail: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#222',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: '14@ms',
    marginBottom: '16@ms',
    overflow: 'hidden'
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '16@ms'
  },

  itemWithActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: '16@ms'
  },

  itemFlex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '16@ms'
  },

  icon: {
    width: '30@ms'
  },

  text: {
    fontSize: '16@ms',
    fontWeight: 600,
    color: '#222'
  },

  divider: {
    height: '1@ms',
    backgroundColor: palette.grey[100]
  },

  logout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20@ms',
    paddingBottom: '120@ms',
    gap: '6@ms'
  },

  logoutText: {
    fontSize: '16@ms',
    fontWeight: 600,
    color: '#222222'
  },

  button: {
    backgroundColor: palette.main[600],
    marginBottom: '20@ms',
    paddingVertical: '16@ms',
    borderRadius: '12@ms',
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontSize: '15@ms',
    fontWeight: '600'
  },

  versionFooter: {
    paddingBottom: '20@ms',
    alignItems: 'center'
  },

  versionFooterText: {
    fontSize: '12@ms',
    color: palette.grey[500],
  },

  biometricDivider: {
    height: '1@ms',
    backgroundColor: palette.grey[100] || '#EAEAEA',
    marginHorizontal: '16@ms'
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16@ms'
  },
  biometricInfo: {
    flex: 1,
    marginRight: '12@ms'
  },
  biometricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  biometricTitle: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#222222'
  },
  biometricDesc: {
    fontSize: '12@ms',
    color: palette.grey[500] || '#777',
    marginTop: '4@ms',
    lineHeight: '16@ms'
  },
  syncButton: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: '#F3EDF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBadge: {
    position: 'absolute',
    top: '-4@ms',
    right: '-6@ms',
    backgroundColor: '#FF3B30',
    width: '13@ms',
    height: '13@ms',
    borderRadius: '7@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBadgeText: {
    color: '#FFFFFF',
    fontSize: '9@ms',
    fontWeight: '800',
    lineHeight: '11@ms',
    textAlign: 'center',
  },
  pendingBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: '10@ms',
    minWidth: '20@ms',
    height: '20@ms',
    paddingHorizontal: '6@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: '11@ms',
    fontWeight: '700',
  }
})

