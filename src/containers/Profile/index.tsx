import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Avatar } from 'react-native-paper'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'
import useProfile from './hooks/useProfile'
import { profileItems, settingItems } from './configs/constants'
import Chat from '../Chat'
import { SettingIndex } from './configs/types'

const Profile = () => {
  const { user, isVisibleDrawer, handleCloseDrawer,
    handleVisibleDrawer } = useProfile()

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar.Image
          size={40}
          style={{ backgroundColor: '#fff', marginRight: 16 }}
          source={{ uri: user?.avatar }}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.nameText}>{user?.fullName}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {profileItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => handleVisibleDrawer(item.id)}>
            <View style={styles.menuItemContent}>
              <Ionicons name={item.icon as any} size={24} color={palette.grey[700]} style={styles.icon} />
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.menuContainer, { marginTop: 24}]}>
        {settingItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => handleVisibleDrawer(item.id)}>
            <View style={styles.menuItemContent}>
              <Ionicons name={item.icon as any} size={24} color={palette.grey[700]} style={styles.icon} />
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <Chat isVisible={isVisibleDrawer === SettingIndex.Chat} onClose={handleCloseDrawer} />
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '24@ms',
    paddingVertical: '24@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#f0f0f0'
  },
  profileInfo: {
    flex: 1
  },
  nameText: {
    fontSize: '20@ms',
    fontWeight: 'bold',
    marginBottom: '5@ms'
  },
  emailText: {
    fontSize: '14@ms',
    color: '#666'
  },
  sectionTitle: {
    fontSize: '16@ms',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15@ms',
    paddingLeft: '10@ms'
  },
  menuContainer: {
    paddingHorizontal: '24@ms',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: "16@ms",
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    marginRight: '15@ms'
  },
  menuText: {
    ...TYPO.button2,
    color: palette.grey[700]
  },
  arrow: {
    fontSize: '18@ms',
    color: '#999'
  }
})

export default Profile
