import useAuthStore from '@/store/useAuthStore'
import { palette, TYPO } from '@/theme'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Menu, Avatar, TouchableRipple } from 'react-native-paper'
import { ScaledSheet } from 'react-native-size-matters'
import ArrowDown from '@/assets/iconJSX/arrowDown'
import Alarm from '@/assets/iconJSX/alarm'
import Notice from '@/containers/Notice/view'
import SignOut from '@/assets/iconJSX/signOut'
import HeaderAction from './components/HeaderAction'

type Props = {
  headerProps: any
}

const Header = ({ headerProps }: Props) => {
  const { t } = useTranslation()
  const user = useAuthStore(state => state.user)
  const academies = useAuthStore(state => state.academies)
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const logout = useAuthStore(state => state.logout)
  const {
    academyMenuVisible,
    openNoticeDialog,
    handleCloseNoticeDialog,
    handleOpenNoticeDialog,
    closeAcademyMenu,
    openAcademyMenu,
    handleSwitchAcademy
  } = headerProps
  const insets = useSafeAreaInsets()

  return (
    <View>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
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
              onPress={() => {
                closeAcademyMenu()
                handleSwitchAcademy(true, undefined, false)
              }}
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
                onPress={() => {
                  closeAcademyMenu()
                  handleSwitchAcademy(false, academy)}}
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

            <HeaderAction />
            
          </View>
        </>
      </View>
      <Notice open={openNoticeDialog} onClose={handleCloseNoticeDialog} />
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
