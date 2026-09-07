import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'
import { Routes } from '@/navigators/RouteName'

interface NavbarProps {
  title: string
  showBack?: boolean
  showHome?: boolean
  onBackPress?: () => void
  onHomePress?: () => void
  rightAction?: React.ReactNode
}

const Navbar = ({
  title,
  showBack = true,
  showHome = false,
  onBackPress,
  onHomePress,
  rightAction,
}: NavbarProps) => {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()

  const handleBack = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      navigation.goBack()
    }
  }

  const handleHome = () => {
    if (onHomePress) {
      onHomePress()
    } else {
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
      } catch {
        navigation.navigate(Routes.Auth.MainTabs, { screen: Routes.Auth.Home })
      }
    }
  }

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
      {showHome ? (
        <TouchableOpacity
          onPress={handleHome}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="home-outline" size={24} color={palette.grey[900] || '#171719'} />
        </TouchableOpacity>
      ) : showBack ? (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={palette.grey[900] || '#171719'} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {rightAction ? (
        <View style={styles.backButton}>{rightAction}</View>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  )
}

export default Navbar

const styles = ScaledSheet.create({
  header: {
    backgroundColor: '#FAFAFB',
    paddingBottom: '14@ms',
    paddingHorizontal: '16@ms',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: '40@ms',
    height: '40@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPO.heading2,
    color: palette.grey[900] || '#171719',
    fontWeight: '700',
    fontSize: '16@ms',
    flex: 1,
    textAlign: 'center',
  },
})
