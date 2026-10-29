import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  Animated,
  Platform,
} from 'react-native'
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
import { ScaledSheet, ms } from 'react-native-size-matters'
import { Language } from '@/utils/enums'
import { checkIsParent } from '@/utils/helpers'

interface TabItemData {
  name: string
  icon?: string
  label: string
  iconJSX?: (isFocused: boolean) => React.ReactNode
}

interface TabItemProps {
  item: TabItemData
  isFocused: boolean
  isEnOrVi: boolean
  onPress: () => void
}

const TabItem = React.memo(({ item, isFocused, isEnOrVi, onPress }: TabItemProps) => {
  const focusAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current
  const pressAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      friction: 7,
      tension: 70,
      useNativeDriver: true,
    }).start()
  }, [isFocused])

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.92,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start()
  }

  // Icon bounce & float
  const iconScale = focusAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1.1],
  })

  const iconTranslateY = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -ms(2)],
  })

  // Crossfade between inactive and active icons
  const inactiveIconOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  })

  const activeIconOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  // Label text animation
  const textOpacity = isEnOrVi
    ? focusAnim.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0, 0, 1],
      })
    : focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.65, 1],
      })

  const textTranslateY = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [ms(2), 0],
  })

  const textScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  })

  return (
    <Pressable
      style={styles.tabItem}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            transform: [{ scale: pressAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconBox,
            {
              transform: [{ scale: iconScale }, { translateY: iconTranslateY }],
            },
          ]}
        >
          {/* Inactive Icon Layer (smooth crossfade out) */}
          <Animated.View style={[styles.iconLayer, { opacity: inactiveIconOpacity }]}>
            {item.iconJSX ? (
              item.iconJSX(false)
            ) : (
              <Ionicons name={item.icon as any} size={ms(20)} color={palette.grey[400]} />
            )}
          </Animated.View>

          {/* Active Icon Layer (smooth crossfade in) */}
          <Animated.View style={[styles.iconLayer, { opacity: activeIconOpacity }]}>
            {item.iconJSX ? (
              item.iconJSX(true)
            ) : (
              <Ionicons name={item.icon as any} size={ms(20)} color={palette.main[600]} />
            )}
          </Animated.View>
        </Animated.View>

        {/* Animated Text Label */}
        <Animated.View
          style={[
            styles.labelContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }, { scale: textScale }],
            },
          ]}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={isFocused ? styles.activeTabText : styles.tabText}
          >
            {item.label}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
})

const Footer = ({ state, navigation }: BottomTabBarProps) => {
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

  const studySpaceTabItems: TabItemData[] = useMemo(() => [
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
  ], [t])

  const tabItems: TabItemData[] = useMemo(() => [
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
  ], [t])

  const isStudent = user?.roles?.includes('Student')

  const filteredStudySpaceTabItems = studySpaceTabItems.filter(item => {
    if (isParentNoChildren && item.name !== Routes.Auth.PopQuiz && item.name !== Routes.Auth.Home) return false
    return true
  })

  const filteredTabItems = tabItems.filter(item => {
    if (item.name === Routes.Auth.Question && !isStudent) return false
    return true
  })

  const displayItems = user?.academyDomain ? filteredTabItems : filteredStudySpaceTabItems
  const currentTabName = state?.routes[state?.index]?.name || currentScreen()

  const handlePressTab = useCallback((item: TabItemData) => {
    if (item.name === Routes.Auth.PopQuiz && !user?.academyDomain && isParent) {
      setRequestByLinkId(false);
    } else {
      setRequestByLinkId(true);
    }
    navigation.navigate(item.name)
  }, [navigation, user?.academyDomain, isParent, setRequestByLinkId])

  const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, ms(8)) : ms(8)

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabBarInner}>
        {displayItems.map((item) => {
          let isFocused = currentTabName === item.name
          if (!user?.academyDomain && isParent && requestByLinkId && item.name === Routes.Auth.PopQuiz) {
            isFocused = false
          }

          return (
            <TabItem
              key={item.name}
              item={item}
              isFocused={isFocused}
              isEnOrVi={isEnOrVi}
              onPress={() => handlePressTab(item)}
            />
          )
        })}
      </View>
    </View>
  )
}

export default Footer

const styles = ScaledSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#F2F4F7',
    backgroundColor: '#FFFFFF',
    paddingTop: '6@ms',
    paddingHorizontal: '6@ms',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarInner: {
    flexDirection: 'row',
    width: '100%',
    height: '46@ms',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    height: '46@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  iconBox: {
    width: '24@ms',
    height: '24@ms',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    marginTop: '3@ms',
    height: '16@ms',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
    paddingHorizontal: '2@ms',
  },
  tabText: {
    ...TYPO.button4,
    color: palette.grey[500],
    textAlign: 'center',
    fontSize: '11@ms',
    fontWeight: '500',
    lineHeight: '14@ms',
    includeFontPadding: false,
  },
  activeTabText: {
    ...TYPO.button4,
    color: palette.main[600],
    textAlign: 'center',
    fontSize: '11@ms',
    fontWeight: '700',
    lineHeight: '14@ms',
    includeFontPadding: false,
  },
})
