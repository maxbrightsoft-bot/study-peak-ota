import UserIcon from '@/assets/iconJSX/user'
import SignOut from '@/assets/iconJSX/signOut'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import useAuthStore from '@/store/useAuthStore'
import Notice from '@/containers/Notice/view'
import UpdateAccount from '../components/UpdateAccount'
import useSetting from '../hooks/useSetting'
import CalendarSchedule from '@/containers/Home/components/CalendarSchedule'

type Props = {
  open: boolean
  onClose: () => void
}

const SettingItem = ({ icon, title, onPress }: any) => {
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
    handleCloseUpdateUserDialog
  } = useSetting()
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
          <View style={styles.card}>
            <SettingItem onPress={() => handleOpenUpdateUserDialog()} icon={<UserIcon />} title="계정 관리" />
          </View>

          {user?.academyDomain && <View style={styles.card}>
            <SettingItem
              onPress={() => handleOpenNoticeDialog()}
              icon={<Ionicons name="notifications" size={22} color={"#222222"} />}
              title="알림 수신"
            />
          </View>}

          <TouchableOpacity style={styles.logout} onPress={() => logout()}>
            <SignOut />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={() => handleToggleSchedule()}>
          <Text style={styles.buttonText}>새로운 스케줄 추가</Text>
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222'
  },

  backButton: {
    width: 24
  },

  container: {
    flex: 1,
    backgroundColor: palette.bg[100],
    paddingHorizontal: '20@ms',
    paddingTop: '20@ms'
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
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
    width: 30
  },

  text: {
    fontSize: '16@ms',
    fontWeight: 600,
    color: '#222'
  },

  divider: {
    height: 1,
    backgroundColor: palette.grey[100]
  },

  logout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20@ms',
    gap: 6
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
    borderRadius: 12,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontSize: '15@ms',
    fontWeight: '600'
  }
})
