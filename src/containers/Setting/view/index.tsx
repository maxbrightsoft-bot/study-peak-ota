import React, { useEffect, useState } from 'react'
import UserIcon from '@/assets/iconJSX/user'
import SignOut from '@/assets/iconJSX/signOut'
import { Role } from '@/utils/enums'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation, CommonActions } from '@react-navigation/native'
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
import { AccountLinkResponse, getLinkedAccountsApi, syncAccountLinksApi } from '@/containers/AccountLinking/apiClients'
import { checkIsParent, getMessageFromError, toast } from '@/utils/helpers'
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
  const setLoading = useAuthStore((state) => state.setLoading)
  const selectedAcademy = useAuthStore((state) => state.selectedAcademy)
  const parentViewMode = useAuthStore((state) => state.parentViewMode)
  const setParentViewMode = useAuthStore((state) => state.setParentViewMode)
  const linkedStudents = useAuthStore((state) => state.linkedStudents)
  const setLinkedStudents = useAuthStore((state) => state.setLinkedStudents)
  const syncParentLinkedStudents = useAuthStore((state) => state.syncParentLinkedStudents)
  const appVersion = DeviceInfo.getVersion();
  const navigation = useNavigation<any>()

  const { isBiometricEnabled, handleToggleBiometric, authenticateBiometric } = useBiometric()

  const children = linkedStudents

  useEffect(() => {
    const controller = new AbortController()
    if (open && checkIsParent()) {
      syncParentLinkedStudents(controller.signal)
        .catch((err) => {
           if (err.name !== 'CanceledError' && err.message !== 'canceled') {
             toast.error(getMessageFromError(t, err))
           }
        })
    }
    return () => controller.abort()
  }, [open])

  const handleSelectChild = (child: AccountLinkResponse) => {
    if (parentViewMode?.linkId === child.id) {
      return
    }

    setParentViewMode({
      isActive: true,
      linkId: child.id,
      studentAcademyUserId: child.studentAcademyUserId || null,
      studentName: child.studentName || null,
      studentEmail: child.studentEmail || null,
      studentAcademyDomain: selectedAcademy?.domain || null,
    })
    onClose()

    try {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: Routes.Auth.MainTabs,
              state: {
                routes: [{ name: Routes.Auth.Home, params: { refreshKey: Date.now() } }],
              },
            },
          ],
        })
      )
    } catch (e) {
      console.log(e)
    }
  }

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
        <Ionicons name="sync-outline" size={20} color="#5F30AA" />
      )}
    </TouchableOpacity>
  )

  const handleLinkAccount = async () => {
    const isAuth = await authenticateBiometric(t('biometric_prompt_access'))
    if (!isAuth) {
      return
    }

    onClose()
    setLoading(true)
    try {
      const response = await getLinkedAccountsApi()
      const data = response.data?.data || []
      useAccountLinkingStore.getState().setLinkedAccounts(data)

      const isParent = checkIsParent()
      let targetScreen = Routes.Auth.AccountLinkRoleSelection

      if (isParent) {
        targetScreen = Routes.Auth.ParentAccountLinking
      } else {
        if (data.length > 0) {
          targetScreen = Routes.Auth.StudentAccountLinking
        } else {
          targetScreen = Routes.Auth.AccountLinkRoleSelection
        }
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
    } catch (error) {
      const isParent = checkIsParent()
      const targetScreen = isParent ? Routes.Auth.ParentAccountLinking : Routes.Auth.AccountLinkRoleSelection
      navigation.navigate(MainRoutes.AuthStack, {
        screen: Routes.Auth.AccountLinkingGroup,
        params: {
          screen: targetScreen,
          params: {
            preventFirstFetch: true,
          },
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
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
              {checkIsParent() && (
                <View style={styles.card}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                      <Text style={styles.sectionTitle}>{t('linked_children')}</Text>
                      <Text style={styles.sectionSubtitle}>{t('select_child_desc')}</Text>
                    </View>
                    {renderSyncButton()}
                  </View>
                  {children.length > 0 ? (
                    <ScrollView style={styles.childrenListContainer} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                      {children.map((child, index) => {
                        const isSelected = parentViewMode?.isActive && parentViewMode?.linkId === child.id
                        return (
                          <View key={child.id}>
                            {index > 0 && <View style={styles.divider} />}
                            <TouchableOpacity
                              style={styles.childItem}
                              onPress={() => handleSelectChild(child)}
                              activeOpacity={0.7}
                            >
                              {child.studentAvatar ? (
                                <Image source={{ uri: child.studentAvatar }} style={styles.childAvatar} />
                              ) : (
                                <View style={styles.childAvatarPlaceholder}>
                                  <Text style={styles.childAvatarText}>
                                    {child.studentName ? child.studentName.charAt(0).toUpperCase() : '?'}
                                  </Text>
                                </View>
                              )}
                              <View style={styles.childInfo}>
                                <Text style={styles.childName}>{child.studentName}</Text>
                                <Text style={styles.childEmail} numberOfLines={1} ellipsizeMode="tail">
                                  {child.studentEmail}
                                </Text>
                              </View>
                              {isSelected && (
                                <Ionicons name="checkmark-circle" size={20} color="#5F30AA" />
                              )}
                            </TouchableOpacity>
                          </View>
                        )
                      })}
                    </ScrollView>
                  ) : (
                    <View style={styles.noChildrenContainer}>
                      <Text style={styles.noChildrenText}>{t('no_linked_children')}</Text>
                    </View>
                  )}
                </View>
              )}
              <View style={styles.card}>
                <SettingItem
                  onPress={handleLinkAccount}
                  icon={<Ionicons name="link-outline" size={22} color="#222222" />}
                  title={t('link_account')}
                  rightAction={!checkIsParent() ? renderSyncButton() : undefined}
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
  sectionHeader: {
    paddingHorizontal: '16@ms',
    paddingTop: '16@ms',
    paddingBottom: '8@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleContainer: {
    flex: 1,
    marginRight: '8@ms',
  },
  syncButton: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: '#F3EDF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#5F30AA',
    textTransform: 'uppercase'
  },
  sectionSubtitle: {
    fontSize: '12@ms',
    color: '#777777',
    marginTop: '4@ms'
  },
  childrenListContainer: {
    maxHeight: '240@ms'
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms'
  },
  childAvatar: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '20@ms',
    marginRight: '12@ms'
  },
  childAvatarPlaceholder: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '20@ms',
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@ms'
  },
  childAvatarText: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#5F30AA'
  },
  childInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  childName: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#222'
  },
  childEmail: {
    fontSize: '12@ms',
    color: '#666',
    marginTop: '2@ms'
  },
  noChildrenContainer: {
    padding: '20@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  noChildrenText: {
    fontSize: '14@ms',
    color: '#999',
    textAlign: 'center'
  }
})

