import UserIcon from '@/assets/iconJSX/user'
import SignOut from '@/assets/iconJSX/signOut'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { Routes } from '@/navigators/RouteName'
import Notice from '@/containers/Notice/view'
import UpdateAccount from '../components/UpdateAccount'
import useSetting from '../hooks/useSetting'
import CalendarSchedule from '@/containers/Home/components/CalendarSchedule'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import LanguageDialog from '../components/LanguageDialog'
import PolicyViewer from '../components/PolicyViewer'
import { PRIVACY_POLICY_CONTENT, TERMS_OF_SERVICE_CONTENT } from '../configs/policyContent'
import useAppStore from '@/store/useAppStore'
import DeviceInfo from 'react-native-device-info'

type Props = {
  open: boolean
  onClose: () => void
}

const SettingItem = ({ icon, title, onPress }: { icon: React.ReactNode, title: string, onPress: () => void }) => {
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
  const appVersion = DeviceInfo.getVersion();
  const navigation = useNavigation<any>()

  const handleOpenTutorial = () => {
    onClose()
    navigation.navigate(Routes.Auth.Tutorial)
  }

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[200]} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('settings')}</Text>

        <View style={{ width: 24 }} />
      </View>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.accountInfoCard}>
            <Text style={styles.accountInfoLabel}>{t('account_info')}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.accountInfoEmail}>{user?.email}</Text>
          </View>

          {!isDemoActive && (
            <View style={styles.card}>
              <SettingItem onPress={() => handleOpenUpdateUserDialog()} icon={<UserIcon />} title={t('account_management')} />
            </View>
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

          <View style={styles.card}>
            <SettingItem
              onPress={isDemoActive ? handleExitDemoMode : handleToggleDemoDialog}
              icon={<Ionicons name={isDemoActive ? 'exit-outline' : 'game-controller-outline'} size={22} color={'#222222'} />}
              title={isDemoActive ? t('exit_demo_mode') : t('demo_mode')}
            />
          </View>

          {!isDemoActive && (
            <View style={styles.card}>
              <SettingItem onPress={() => handleToggleConfirmRemoveAccount()} icon={<Ionicons name="trash-outline" size={20} color={palette.error.main} />} title={t('delete_account')} />
            </View>
          )}

          <TouchableOpacity style={styles.logout} onPress={() => logout()}>
            <SignOut />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={() => handleToggleSchedule()}>
          <Text style={styles.buttonText}>{t('add_new_schedule')}</Text>
        </TouchableOpacity>

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
    width: '24@ms'
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
  }
})

