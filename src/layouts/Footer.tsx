import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import { TAB_BAR_HEIGHT } from '@/utils/constants'
import { Routes } from '@/navigators/RouteName'
import { currentScreen } from '@/navigators/NavigationHelpers'
import PieChartIcon from '@/assets/iconJSX/pieChart'
import HomeIcon from '@/assets/iconJSX/home'
import CupIcon from '@/assets/iconJSX/cup'
import ChatIcon from '@/assets/iconJSX/chat'
import BookIcon from '@/assets/iconJSX/book'
import useAuthStore from '@/store/useAuthStore'

const Footer = ({ navigation }: BottomTabBarProps) => {
  const { user } = useAuthStore()

  const studySpaceTabItems = [
    {
      name: Routes.Auth.Home,
      icon: 'home',
      label: '홈',
      iconJSX: (isFocused: boolean) => <HomeIcon color={isFocused ? palette.main[600] : palette.grey[300]} />
    },
    {
      name: Routes.Auth.Textbook,
      iconJSX: (isFocused: boolean) => <BookIcon color={isFocused ? palette.main[600] : palette.grey[300]} />,
      label: '문제은행'
    },
    {
      name: Routes.Auth.StudyPerformance,
      label: '공부 추이',
      iconJSX: (isFocused: boolean) => <PieChartIcon color={isFocused ? palette.main[600] : palette.grey[300]} />
    }
  ]

  const tabItems = [
    {
      name: Routes.Auth.Home,
      icon: 'home',
      label: '홈',
      iconJSX: (isFocused: boolean) => <HomeIcon color={isFocused ? palette.main[600] : palette.grey[300]} />
    },
    {
      name: Routes.Auth.ExamResultList,
      label: '내 성적',
      iconJSX: (isFocused: boolean) => <CupIcon color={isFocused ? palette.main[600] : palette.grey[300]} />
    },
    {
      name: Routes.Auth.Textbook,
      iconJSX: (isFocused: boolean) => <BookIcon color={isFocused ? palette.main[600] : palette.grey[300]} />,
      label: '문제은행'
    },
    {
      name: Routes.Auth.Question,
      iconJSX: (isFocused: boolean) => <ChatIcon color={isFocused ? palette.main[600] : palette.grey[300]} />,
      label: '질문'
    },
    {
      name: Routes.Auth.StudyPerformance,
      label: '공부 추이',
      iconJSX: (isFocused: boolean) => <PieChartIcon color={isFocused ? palette.main[600] : palette.grey[300]} />
    }
  ]

  return (
    <View style={styles.tabBar}>
      {(user?.academyDomain ? tabItems : studySpaceTabItems).map((item) => {
        const isFocused = currentScreen() == item.name

        return (
          <TouchableOpacity key={item.name} style={styles.tabItem} onPress={() => navigation.navigate(item.name)}>
            {item?.iconJSX ? (
              item?.iconJSX(isFocused)
            ) : (
              <Ionicons name={item.icon as any} size={24} color={isFocused ? palette.main[500] : palette.grey[500]} />
            )}
            <Text style={isFocused ? styles.activeTabText : styles.tabText}>{item.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default Footer

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    height: TAB_BAR_HEIGHT
  },
  tabItem: {
    alignItems: 'center',
    gap: 6
  },
  tabText: {
    ...TYPO.button4,
    color: palette.grey[700]
  },
  activeTabText: {
    ...TYPO.button4,
    color: palette.main[500]
  }
})
