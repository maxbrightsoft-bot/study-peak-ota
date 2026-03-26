import useAuthStore from '@/store/useAuthStore'
import { palette, TYPO } from '@/theme'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import { Menu, Avatar, TouchableRipple } from 'react-native-paper'
import TimerDropdown from './components/TimerDropDown'
import { ScaledSheet } from 'react-native-size-matters'
import ArrowDown from '@/assets/iconJSX/arrowDown'
import Alarm from '@/assets/iconJSX/alarm'
import SettingIcon from '@/assets/iconJSX/setting'
import Notice from '@/containers/Notice/view'
import Setting from '@/containers/Setting/view'
import SignOut from '@/assets/iconJSX/signOut'
import AudioGuideModal from './components/AudioGuideModal'

type Props = {
  headerProps: any
}

const Header = ({ headerProps }: Props) => {
  const { t } = useTranslation()
  const { user, academies, selectedAcademy, logout } = useAuthStore()
  const {
    speaker,
    disabledSpeaker,
    openTimerDialog,
    academyMenuVisible,
    alarmClockProps,
    audioGuideModalProps,
    isAlarmRunning,
    isTimerRunning,
    studyTimerProps,
    openSettingDialog,
    handleOpenSettingDialog,
    handleCloseSettingDialog,
    openNoticeDialog,
    handleCloseNoticeDialog,
    handleOpenNoticeDialog,
    timeUpdateDialogProps,
    handleToggleSpeaker,
    handleTimerDialogToggle,
    closeAcademyMenu,
    openAcademyMenu,
    handleSwitchAcademy
  } = headerProps

  return (
    <View>
      <View style={styles.header}>
        <>
          <Menu
            visible={academyMenuVisible}
            onDismiss={closeAcademyMenu}
            anchorPosition="bottom"
            anchor={
              <TouchableOpacity onPress={openAcademyMenu} style={{ padding: 0, margin: 0 }}>
                <View style={{ alignItems: 'flex-start', flexDirection: 'row', gap: 6 }}>
                  <View>
                    <Text style={{ fontSize: 20, fontWeight: 700, color: '#FFF' }}>
                      {selectedAcademy ? selectedAcademy?.name || t('my_study_space') : t('my_study_space')}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 3 }}>
                      <Text style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFFCC' }}>
                        {t('number_grade', { number: user?.grade })}
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: 500, color: '#FFF' }}>{user?.classes.join(',')}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-start', marginTop: 4 }}>
                    <ArrowDown />
                  </View>
                </View>
              </TouchableOpacity>
            }
            contentStyle={{
              backgroundColor: '#F9F9F9',
              paddingVertical: 4,
              borderRadius: 12,
              overflow: 'hidden',
              minWidth: 250,
              top: Platform.OS === 'ios' ? -50 : 10
            }}
          >
            <TouchableRipple
              onPress={() => handleSwitchAcademy(true, undefined, false)}
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                borderColor: '#E0E0E0',
                borderBottomWidth: 1
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  backgroundColor: !selectedAcademy?.domain ? palette.main[500] : '#FFF'
                }}
              >
                <Avatar.Image
                  size={36}
                  style={{ backgroundColor: '#fff', marginRight: 10 }}
                  source={{ uri: user?.avatar }}
                />
                <Text style={{ color: !selectedAcademy?.domain ? '#FFF' : '#000', fontWeight: '600' }}>
                  {t('my_study_space')}
                </Text>
              </View>
            </TouchableRipple>
            {academies.map((academy, index) => (
              <TouchableRipple
                key={index}
                onPress={() => handleSwitchAcademy(false, academy)}
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    backgroundColor: selectedAcademy?.domain === academy.domain ? palette.main[500] : '#FFF',
                    borderColor: '#E0E0E0',
                    borderBottomWidth: 1
                  }}
                >
                  <Avatar.Image
                    size={36}
                    style={{ backgroundColor: '#fff', marginRight: 10 }}
                    source={{ uri: academy?.image }}
                  />
                  <Text style={{ color: selectedAcademy?.domain === academy.domain ? '#FFF' : '#000' }}>
                    {academy.name}
                  </Text>
                </View>
              </TouchableRipple>
            ))}

            <TouchableRipple
              onPress={logout}
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                borderColor: '#E0E0E0'
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  gap: 8
                }}
              >
                <SignOut />
                <Text style={{ color: palette.grey[900], fontWeight: '600' }}>{t('logout')}</Text>
              </View>
            </TouchableRipple>
          </Menu>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {user?.academyDomain && <TouchableOpacity onPress={() => handleOpenNoticeDialog()}>
              <Alarm />
            </TouchableOpacity>}
            <TimerDropdown
              speaker={speaker}
              disabledSpeaker={disabledSpeaker}
              openTimerDialog={openTimerDialog}
              alarmClockProps={alarmClockProps}
              isAlarmRunning={isAlarmRunning}
              isTimerRunning={isTimerRunning}
              studyTimerProps={studyTimerProps}
              timeUpdateDialogProps={timeUpdateDialogProps}
              onToggleSpeaker={handleToggleSpeaker}
              onToggleTimerDialog={handleTimerDialogToggle}
            />
            <TouchableOpacity onPress={() => handleOpenSettingDialog()}>
              <SettingIcon />
            </TouchableOpacity>
          </View>
        </>
      </View>
      <Notice open={openNoticeDialog} onClose={handleCloseNoticeDialog} />
      <Setting open={openSettingDialog} onClose={handleCloseSettingDialog} />
      <AudioGuideModal {...audioGuideModalProps} />
    </View>
  )
}

export default Header

const styles = ScaledSheet.create({
  header: {
    backgroundColor: palette.main[600],
    paddingTop: '8@ms',
    paddingBottom: '24@ms',
    paddingHorizontal: '16@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoText: {
    ...TYPO.heading2
  },
  headerTitle: {
    ...TYPO.heading2,
    color: palette.grey[900]
  }
})
