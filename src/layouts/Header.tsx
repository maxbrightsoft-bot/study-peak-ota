import useAuthStore from '@/store/useAuthStore'
import { palette, TYPO } from '@/theme'
import { useTranslation } from 'react-i18next'
import { View, Text, StatusBar } from 'react-native'
import { Menu, Avatar, Button, TouchableRipple } from 'react-native-paper'
import TimerDropdown from './components/TimerDropDown'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'

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
    timeUpdateDialogProps,
    handleToggleSpeaker,
    handleTimerDialogToggle,
    closeAcademyMenu,
    openAcademyMenu,
    handleSwitchAcademy
  } = headerProps

  const imageUrl = selectedAcademy?.image || user?.avatar
  return (
    <View style={{ backgroundColor: '#FFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor={'#FFF'} />
      <View style={styles.header}>
          <>
            <Menu
              visible={academyMenuVisible}
              onDismiss={closeAcademyMenu}
              anchorPosition="bottom"
              anchor={
                <Button onPress={openAcademyMenu} style={{ padding: 0, margin: 0 }}>
                  <Avatar.Image
                    size={40}
                    style={{ backgroundColor: '#fff' }}
                    source={{ uri: imageUrl }}
                  />
                </Button>
              }
              contentStyle={{
                borderRadius: 12,
                backgroundColor: '#F9F9F9',
                paddingVertical: 4,
                elevation: 4,
                minWidth: 250
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
                  borderColor: '#E0E0E0',
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    gap: 8
                  }}
                >
                  <Ionicons name="close-circle" size={17} color={palette.grey[700]} />
                  <Text style={{ color: palette.grey[900], fontWeight: '600' }}>
                    {t('logout')}
                  </Text>
                </View>
                </TouchableRipple>

            </Menu>
            <Text style={styles.headerTitle}>{selectedAcademy?.name}</Text>

            <TimerDropdown
              speaker={speaker}
              disabledSpeaker={disabledSpeaker}
              openTimerDialog={openTimerDialog}
              alarmClockProps={alarmClockProps}
              audioGuideModalProps={audioGuideModalProps}
              isAlarmRunning={isAlarmRunning}
              isTimerRunning={isTimerRunning}
              studyTimerProps={studyTimerProps}
              timeUpdateDialogProps={timeUpdateDialogProps}
              onToggleSpeaker={handleToggleSpeaker}
              onToggleTimerDialog={handleTimerDialogToggle}
            />
          </>
      </View>
    </View>
  )
}

export default Header

const styles = ScaledSheet.create({
  header: {
    backgroundColor: '#FFF',
    paddingVertical: '8@ms',
    paddingHorizontal: '16@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: palette.grey[50],
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
  },
})
