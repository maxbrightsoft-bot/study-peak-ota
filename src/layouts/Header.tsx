import useAuthStore from '@/store/useAuthStore'
import { palette, TYPO } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { View, Text, StatusBar, StyleSheet } from 'react-native'
import { Appbar, Menu, Avatar, Button, TouchableRipple } from 'react-native-paper'

type Props = {
  headerProps: any
}
const Header = ({ headerProps }: Props) => {
  const { t } = useTranslation()
  const { user, academies, selectedAcademy, logout } = useAuthStore()
  const {
    academyMenuVisible,
    userMenuVisible,
    closeAcademyMenu,
    closeUserMenu,
    openUserMenu,
    openAcademyMenu,
    handleSignOut,
    handleSwitchAcademy
  } = headerProps
  const isCustomHeader = !!user && !user.isNotEnoughStatements

  const imageUrl = selectedAcademy?.image || user?.avatar
  return (
    <View style={{ backgroundColor: '#FFF' }}>
      <StatusBar backgroundColor={palette.main[500]} barStyle="light-content" />
      <View
        style={{
          ...styles.header,
          borderBottomRightRadius: isCustomHeader ? 24 : 0,
          borderBottomLeftRadius: isCustomHeader ? 24 : 0,
          paddingBottom: isCustomHeader ? 0 : 24
        }}
      >
        {isCustomHeader && (
          <>
            <Menu
              visible={academyMenuVisible}
              onDismiss={closeAcademyMenu}
              anchorPosition="bottom"
              anchor={
                <Button onPress={openAcademyMenu} style={{ padding: 0 }}>
                  <Avatar.Image
                    size={40}
                    style={{ backgroundColor: '#fff', marginLeft: 8 }}
                    source={{ uri: imageUrl }}
                  />
                </Button>
              }
              contentStyle={{
                borderRadius: 12,
                backgroundColor: '#F9F9F9',
                paddingVertical: 4,
                elevation: 4, // shadow
                minWidth: 250
              }}
            >
              {/* My Study Space */}
              <TouchableRipple
                onPress={() => handleSwitchAcademy(true, undefined, false)}
                style={{
                  width: "100%",
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
              {/* <Menu.Item
                onPress={() => handleSwitchAcademy(true, undefined, false)}
                style={{
                  backgroundColor: !selectedAcademy?.domain ? palette.main[500] : '#FFF'
                }}
                title={
                  <View
                    style={{
                      width: '100%',
                      padding: 10,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <Avatar.Image
                      size={36}
                      style={{ backgroundColor: '#fff', marginRight: 10 }}
                      source={user.avatar ? { uri: user.avatar } : defaultImage}
                    />
                    <Text style={{ color: !selectedAcademy?.domain ? '#FFF' : '#000', fontWeight: '600' }}>
                      {t('my_study_space')}
                    </Text>
                  </View>
                }
              /> */}

              {/* List of Academies */}
              {academies.map((academy, index) => (
                <TouchableRipple
                  key={index}
                  onPress={() => handleSwitchAcademy(false, academy)}
                  style={{
                    width: "100%",
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

              {/* Divider */}

              <TouchableRipple
                onPress={logout}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12
                }}
                rippleColor="rgba(0, 0, 0, .32)"
              >
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                  <Ionicons name="close-circle" size={24} color={palette.grey[500]} />
                </View>
              </TouchableRipple>
            </Menu>
            <Text style={styles.headerTitle}>{selectedAcademy?.name}</Text>
            <Menu
              visible={userMenuVisible}
              onDismiss={closeUserMenu}
              anchorPosition="bottom"
              anchor={<Appbar.Action size={40} icon="account-circle" color="#fff" onPress={openUserMenu} />}
            >
              <Menu.Item title={user?.fullName} disabled />
              <Menu.Item onPress={handleSignOut} title="로그아웃"></Menu.Item>
            </Menu>
          </>
        )}
      </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  header: {
    backgroundColor: palette.main[500],
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 17.5,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    ...TYPO.heading2
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  profileCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  welcomeCard: {
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  }
})
