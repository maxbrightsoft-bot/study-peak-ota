import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import { TAB_BAR_HEIGHT } from '@/utils/constants'
import { Routes } from '@/navigators/RouteName'
import { currentScreen } from '@/navigators/NavigationHelpers'
import GraphIcon from '@/assets/icons/graph_fill'

const Footer = ({ navigation }: BottomTabBarProps) => {
  const tabItems = [
    { name: Routes.Auth.Home, icon: 'home', label: '홈' },
    { name: Routes.Auth.Textbook, icon: 'book', label: '시험' },
    { name: Routes.Auth.ExamResultList, icon: 'receipt', label: '시험 이력' },
    // {
    //   name: Routes.Auth.StudyTrend,
    //   label: '공부 추이',
    //   iconJSX: (isFocused: boolean) => <GraphIcon color={isFocused ? palette.main[500] : palette.grey[500]} />
    // },
    { name: Routes.Auth.Profile, icon: 'ellipsis-horizontal', label: '기타' }
  ]

  return (
    <View style={styles.tabBar}>
      {tabItems.map((item) => {
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
    paddingVertical: 10,
    height: TAB_BAR_HEIGHT
  },
  tabItem: {
    alignItems: 'center'
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
