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
import useAccountLinkingStore from '@/store/useAccountLinkingStore'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { Language } from '@/utils/enums'
import { checkIsParent } from '@/utils/helpers'

const Footer = ({ navigation, state }: BottomTabBarProps) => {
  const user = useAuthStore(state => state.user)
  const language = useAuthStore(state => state.language)
  const requestByLinkId = useAccountLinkingStore(state => state.requestByLinkId)
  const setRequestByLinkId = useAccountLinkingStore(state => state.setRequestByLinkId)
  const { t, i18n } = useTranslation()
  const insets = useSafeAreaInsets()

  const linkedStudents = useAuthStore((state) => state.linkedStudents)
  const isParent = checkIsParent()
  const isParentNoChildren = isParent && linkedStudents?.length === 0

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
      name: Routes.Auth.PopQuiz,
      iconJSX: (isFocused: boolean) => (
        <Ionicons name="bulb" size={24} color={isFocused ? palette.main[600] : palette.grey[300]} />
      ),
      label: t('pop_quiz')
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

  const isStudent = user?.roles?.includes('Student')

  const filteredStudySpaceTabItems = studySpaceTabItems.filter(item => {
    if (isParentNoChildren && item.name !== Routes.Auth.PopQuiz && item.name !== Routes.Auth.Home) return false
    return true
  })

  const filteredTabItems = tabItems.filter(item => {
    if (item.name === Routes.Auth.Question && !isStudent) return false
    return true
  })

  return (
    <View style={[styles.tabBar, insets.bottom > 12 && { paddingBottom: insets.bottom }]}>
      {(user?.academyDomain ? filteredTabItems : filteredStudySpaceTabItems).map((item) => {
        let isFocused = currentScreen() == item.name
        if (!user?.academyDomain && isParent && requestByLinkId && item.name === Routes.Auth.PopQuiz) {
          isFocused = false
        }
        const shouldShowText = !isEnOrVi || isFocused

        return (
          <TouchableOpacity
            key={item.name}
            style={styles.tabItem}
            onPress={() => {
              if (item.name === Routes.Auth.PopQuiz && !user?.academyDomain && isParent) {
                setRequestByLinkId(false);
              } else {
                setRequestByLinkId(true);
              }
              navigation.navigate(item.name);
            }}
          >
            <View style={{ height: 20}}>
              {item?.iconJSX ? (
                item?.iconJSX(isFocused)
              ) : (
                <Ionicons name={item.icon as any} size={24} color={isFocused ? palette.main[500] : palette.grey[500]} />
              )}
            </View>
            {shouldShowText && (
              <Text numberOfLines={1} style={isFocused ? styles.activeTabText : styles.tabText}>{item.label}</Text>
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
    paddingTop: '12@ms',
    paddingBottom: '12@ms',
    paddingHorizontal: '4@ms',
    minHeight: '66@ms',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: '6@ms',
    height: '42@ms',
  },
  tabText: {
    ...TYPO.button4,
    color: palette.grey[700],
    textAlign: 'center'
  },
  activeTabText: {
    ...TYPO.button4,
    color: palette.main[500],
    textAlign: 'center'
  }
})

