import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import { Routes } from '@/navigators/RouteName'
import { currentScreen } from '@/navigators/NavigationHelpers'
import PieChartIcon from '@/assets/iconJSX/pieChart'
import HomeIcon from '@/assets/iconJSX/home'
import CupIcon from '@/assets/iconJSX/cup'
import ChatIcon from '@/assets/iconJSX/chat'
import BookIcon from '@/assets/iconJSX/book'
import useAuthStore from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { Language } from '@/utils/enums'

const Footer = ({ navigation }: BottomTabBarProps) => {
  const user = useAuthStore(state => state.user)
  const language = useAuthStore(state => state.language)
  const { t, i18n } = useTranslation()
  const insets = useSafeAreaInsets()

  const currentLang = language?.code || i18n.language
  const isEnOrVi = currentLang === Language.en || currentLang === Language.vi || currentLang === 'en' || currentLang === 'vi'

  const studySpaceTabItems = [
    {
      name: Routes.Auth.Home,
      icon: 'home',
      label: t('home'),
      iconJSX: (isFocused: boolean) => <HomeIcon color={isFocused ? palette.main[600] : palette.grey[300]} />
    },
    {
      name: Routes.Auth.Textbook,
      iconJSX: (isFocused: boolean) => <BookIcon color={isFocused ? palette.main[600] : palette.grey[300]} />,
      label: t('question_bank')
    },
    {
      name: Routes.Auth.StudyPerformance,
      label: t('study_performance'),
      iconJSX: (isFocused: boolean) => <PieChartIcon color={isFocused ? palette.main[600] : palette.grey[300]} />
    }
  ]

  const tabItems = [
    {
      name: Routes.Auth.Home,
      icon: 'home',
      label: t('home'),
      iconJSX: (isFocused: boolean) => <HomeIcon color={isFocused ? palette.main[600] : palette.grey[300]} />
    },
    {
      name: Routes.Auth.ExamResultList,
      label: t('my_grades'),
      iconJSX: (isFocused: boolean) => <CupIcon color={isFocused ? palette.main[600] : palette.grey[300]} />
    },
    {
      name: Routes.Auth.Textbook,
      iconJSX: (isFocused: boolean) => <BookIcon color={isFocused ? palette.main[600] : palette.grey[300]} />,
      label: t('question_bank')
    },
    {
      name: Routes.Auth.Question,
      iconJSX: (isFocused: boolean) => <ChatIcon color={isFocused ? palette.main[600] : palette.grey[300]} />,
      label: t('question')
    },
    {
      name: Routes.Auth.StudyPerformance,
      label: t('study_performance'),
      iconJSX: (isFocused: boolean) => <PieChartIcon color={isFocused ? palette.main[600] : palette.grey[300]} />
    }
  ]

  return (
    <View style={[styles.tabBar]}>
      {(user?.academyDomain ? tabItems : studySpaceTabItems).map((item) => {
        const isFocused = currentScreen() == item.name
        const shouldShowText = !isEnOrVi || isFocused

        return (
          <TouchableOpacity key={item.name} style={styles.tabItem} onPress={() => navigation.navigate(item.name)}>
            <View style={{ height: 20}}>
              {item?.iconJSX ? (
                item?.iconJSX(isFocused)
              ) : (
                <Ionicons name={item.icon as any} size={24} color={isFocused ? palette.main[500] : palette.grey[500]} />
              )}
            </View>
            {shouldShowText && (
              <Text style={isFocused ? styles.activeTabText : styles.tabText}>{item.label}</Text>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default Footer

const styles = ScaledSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: '1@ms',
    borderTopColor: '#eee',
    backgroundColor: 'white',
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',

  },
  tabItem: {
    paddingHorizontal: '5@ms',
    alignItems: 'center',
    gap: '6@ms'
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
