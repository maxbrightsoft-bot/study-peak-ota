import React, { useRef, useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ms, ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { getSlides } from './slides'
import {
  Slide,
  FeatureSlide as FeatureSlideType,
  WelcomeSlide as WelcomeSlideType,
  FinalSlide as FinalSlideType,
} from './types'

const { width: SCREEN_W } = Dimensions.get('window')

const C = {
  purple: '#6F48E9',
  purpleLight: '#8B6BF0',
  purple50: '#F4F0FF',
  gray900: '#1F2937',
  gray700: '#374151',
  gray500: '#6B7280',
  gray300: '#D1D5DB',
  gray100: '#F3F4F6',
  white: '#FFFFFF',
}

// ─── Welcome Slide ────────────────────────────────────────────────────────────
const WelcomeSlideView = ({ slide }: { slide: WelcomeSlideType }) => {
  const { t } = useTranslation()
  return (
    <View style={[ss.slideInner, ss.centeredSlide]}>
      <LinearGradient
        colors={[C.purple, C.purpleLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={ss.welcomeLogo}
      >
        <Text style={ss.logoStar}>★</Text>
      </LinearGradient>

      <Text style={ss.welcomeTitle}>
        <Text style={ss.accentText}>{t('tutorial.welcome_title_accent')}</Text>
        {t('tutorial.welcome_title_suffix')}
      </Text>

      <Text style={ss.welcomeSubtitle}>
        {t('tutorial.welcome_subtitle')}
      </Text>

      <View style={ss.statsRow}>
        {slide.stats.map((s, i) => (
          <View key={i} style={ss.statItem}>
            <Text style={ss.statNum}>{s.value}</Text>
            <Text style={ss.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const FeatureSlideView = ({ slide }: { slide: FeatureSlideType }) => {
  const { t } = useTranslation()

  return (
    <ScrollView 
      style={ss.slideWrapper} 
      contentContainerStyle={ss.slideScrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={ss.slideInner}>
        <View style={ss.phoneFrame}>
          <View style={ss.dynamicIsland} />
          <View style={ss.phoneScreen}>
            {slide.imageSource ? (
              <>
                <Image
                  source={slide.imageSource}
                  style={ss.phoneImage}
                  resizeMode="cover"
                />
                {slide.focusArea && (
                  <View
                    style={[
                      ss.highlightBox,
                      {
                        top: slide.focusArea.top,
                        left: slide.focusArea.left,
                        width: slide.focusArea.width,
                        height: slide.focusArea.height,
                      },
                    ]}
                  />
                )}
              </>
            ) : (
              <LinearGradient colors={[C.purple50, C.white]} style={ss.phonePlaceholder}>
                <Text style={ss.phonePlaceholderTxt}>✨</Text>
              </LinearGradient>
            )}
          </View>
        </View>

        <View style={ss.contentBox}>
          <View style={ss.badge}>
            <View style={ss.badgeCircle}>
              <Text style={ss.badgeNum}>{slide.step}</Text>
            </View>
            <Text style={ss.badgeTxt}>{slide.badge}</Text>
          </View>

          <Text style={ss.slideTitle}>
            {slide.title}
            <Text style={ss.accentText}>{slide.titleAccent}</Text>
          </Text>

          <Text style={ss.slideDesc}>{slide.description}</Text>

          {slide.features.map((f, i) => (
            <View key={i} style={ss.featureItem}>
              <View style={ss.featureIcon}>
                <Text style={{ fontSize: ms(16) }}>{f.icon}</Text>
              </View>
              <View style={ss.featureTextWrap}>
                <Text style={ss.featureTitle}>{f.title}</Text>
                <Text style={ss.featureDesc}>{f.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const FinalSlideView = ({
  slide,
  onStart,
}: {
  slide: FinalSlideType
  onStart: () => void
}) => {
  const { t } = useTranslation()
  return (
    <View style={[ss.slideInner, ss.centeredSlide]}>
      <LinearGradient colors={[C.purple, C.purpleLight]} style={ss.finalIcon}>
        <Text style={ss.finalIconTxt}>🚀</Text>
      </LinearGradient>

      <Text style={ss.finalTitle}>{slide.title}</Text>
      <Text style={ss.finalSubtitle}>{slide.subtitle}</Text>

      <TouchableOpacity onPress={onStart} activeOpacity={0.85}>
        <LinearGradient
          colors={[C.purple, C.purpleLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={ss.startBtn}
        >
          <Text style={ss.startBtnTxt}>{t('tutorial.final_cta')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

interface Props {
  onFinish: () => void
  onSkip?: () => void
}

export default function TutorialContainer({ onFinish, onSkip }: Props) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const slides = useMemo(() => getSlides(t), [t])
  const scrollX = useRef(new Animated.Value(0)).current
  const [currentIdx, setCurrentIdx] = useState(0)
  const flatRef = useRef<FlatList<Slide>>(null)

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= slides.length) return
      flatRef.current?.scrollToIndex({ index: idx, animated: true })
      setCurrentIdx(idx)
    },
    [slides.length]
  )

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const idx = viewableItems[0].index ?? 0
        setCurrentIdx(idx)
      }
    },
    []
  )

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 })

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_W,
      offset: SCREEN_W * index,
      index,
    }),
    []
  )

  const isFirst = currentIdx === 0
  const isLast = currentIdx === slides.length - 1
  const progress = (currentIdx + 1) / slides.length

  const renderItem = useCallback(
    ({ item }: { item: Slide }) => (
      <View style={ss.slideWrapper}>
        {item.type === 'welcome' && <WelcomeSlideView slide={item} />}
        {item.type === 'feature' && <FeatureSlideView slide={item} />}
        {item.type === 'final' && (
          <FinalSlideView slide={item} onStart={onFinish} />
        )}
      </View>
    ),
    [onFinish]
  )

  return (
    <View style={[ss.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#F8F9FF', '#FFFFFF', '#F2F5FF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={ss.header}>
        <View style={ss.logoRow}>
          <LinearGradient colors={[C.purple, C.purpleLight]} style={ss.logoMark}>
            <Text style={ss.logoMarkTxt}>SP</Text>
          </LinearGradient>
          <Text style={ss.logoText}>StudyPeak</Text>
        </View>
        {!isLast && (
          <TouchableOpacity
            style={ss.skipBtn}
            onPress={onSkip ?? onFinish}
            activeOpacity={0.7}
          >
            <Text style={ss.skipTxt}>{t('tutorial.skip')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={getItemLayout}
        scrollEventThrottle={16}
        style={ss.flatList}
      />

      <View style={[ss.footer, { paddingBottom: Math.max(insets.bottom, ms(16)) }]}>
        <View style={ss.progressWrap}>
          <Text style={ss.progressTxt}>
            {currentIdx + 1} / {slides.length}
          </Text>
          <View style={ss.progressTrack}>
            <View style={[ss.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
        </View>

        <View style={ss.dotsContainer}>
          <View style={ss.dots}>
            {slides.map((_, i) => {
              const inputRange = [(i - 1) * SCREEN_W, i * SCREEN_W, (i + 1) * SCREEN_W]
              const w = scrollX.interpolate({
                inputRange,
                outputRange: [ms(7), ms(22), ms(7)],
                extrapolate: 'clamp',
              })
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              })
              return (
                <Animated.View
                  key={i}
                  style={[ss.dot, { width: w, opacity, backgroundColor: C.purple }]}
                />
              )
            })}
          </View>
        </View>

        <View style={ss.navRow}>
          <TouchableOpacity
            style={[ss.prevBtn, isFirst && { opacity: 0 }]}
            onPress={() => goTo(currentIdx - 1)}
            disabled={isFirst}
            activeOpacity={0.7}
          >
            <Text style={ss.prevBtnTxt}>{t('tutorial.prev')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={isLast ? onFinish : () => goTo(currentIdx + 1)}
            activeOpacity={0.85}
            style={isLast ? { flex: 1, marginLeft: ms(20) } : {}}
          >
            <LinearGradient
              colors={[C.purple, C.purpleLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[ss.nextBtn, isLast && { paddingHorizontal: 0, width: '100%' }]}
            >
              <Text style={ss.nextBtnTxt}>
                {isLast ? t('tutorial.start') : t('tutorial.next')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ss = ScaledSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F0FF',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20@ms',
    paddingTop: '8@ms',
    paddingBottom: '6@ms',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
  },
  logoMark: {
    width: '28@ms',
    height: '28@ms',
    borderRadius: '7@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkTxt: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: '11@ms',
  },
  logoText: {
    fontWeight: '700',
    fontSize: '15@ms',
    color: '#1F2937',
    letterSpacing: -0.3,
  },
  skipBtn: {
    paddingVertical: '6@ms',
    paddingHorizontal: '14@ms',
    borderRadius: '100@ms',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  skipTxt: {
    fontSize: '12@ms',
    color: '#6B7280',
    fontWeight: '500',
  },

  // FlatList
  flatList: {
    flex: 1,
  },
  slideWrapper: {
    width: SCREEN_W,
    flex: 1,
  },

  // Slide common
  slideScrollContent: {
    paddingBottom: '30@ms',
  },
  slideInner: {
    flex: 1,
    paddingHorizontal: '20@ms',
    paddingVertical: '10@ms',
    gap: '14@ms',
    alignItems: 'center',
  },
  centeredSlide: {
    justifyContent: 'center',
  },

  // ── Welcome
  welcomeLogo: {
    width: '76@ms',
    height: '76@ms',
    borderRadius: '20@ms',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6F48E9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  logoStar: {
    fontSize: '36@ms',
    color: '#FFF',
  },
  welcomeTitle: {
    fontSize: '28@ms',
    fontWeight: '800',
    lineHeight: '36@ms',
    letterSpacing: -0.8,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: '4@ms',
  },
  welcomeSubtitle: {
    fontSize: '14@ms',
    lineHeight: '22@ms',
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  accentText: {
    color: '#6F48E9',
  },
  statsRow: {
    flexDirection: 'row',
    gap: '28@ms',
    marginTop: '8@ms',
  },
  statItem: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: '26@ms',
    fontWeight: '800',
    color: '#6F48E9',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: '11@ms',
    color: '#6B7280',
    fontWeight: '500',
    marginTop: '3@ms',
  },

  // ── Phone frame
  phoneFrame: {
    width: '180@ms',
    aspectRatio: 9 / 18.5,
    backgroundColor: '#1a1a1a',
    borderRadius: '26@ms',
    padding: '6@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    flexShrink: 0,
  },
  dynamicIsland: {
    position: 'absolute',
    top: '14@ms',
    alignSelf: 'center',
    width: '55@ms',
    height: '16@ms',
    backgroundColor: '#000',
    borderRadius: '100@ms',
    zIndex: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: '20@ms',
    overflow: 'hidden',
  },
  highlightBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#6F48E9',
    borderRadius: '16@ms',
    backgroundColor: 'transparent',
    shadowColor: '#6F48E9',
    zIndex: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  phoneImage: {
    width: '100%',
    height: '100%',
  },
  phonePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phonePlaceholderTxt: {
    fontSize: '40@ms',
  },

  // ── Content
  contentBox: {
    width: '100%',
    gap: '10@ms',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '7@ms',
    alignSelf: 'flex-start',
    backgroundColor: '#F4F0FF',
    paddingHorizontal: '12@ms',
    paddingVertical: '5@ms',
    borderRadius: '100@ms',
  },
  badgeCircle: {
    width: '18@ms',
    height: '18@ms',
    borderRadius: '100@ms',
    backgroundColor: '#6F48E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNum: {
    fontSize: '10@ms',
    color: '#FFF',
    fontWeight: '700',
  },
  badgeTxt: {
    fontSize: '11@ms',
    fontWeight: '700',
    color: '#6F48E9',
    letterSpacing: 0.5,
  },
  slideTitle: {
    fontSize: '22@ms',
    fontWeight: '800',
    lineHeight: '30@ms',
    letterSpacing: -0.6,
    color: '#111827',
  },
  slideDesc: {
    fontSize: '14@ms',
    lineHeight: '21@ms',
    color: '#4B5563',
    letterSpacing: -0.2,
    marginBottom: '8@ms',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '10@ms',
    padding: '10@ms',
    backgroundColor: '#FFF',
    borderRadius: '12@ms',
    borderWidth: 1,
    borderColor: 'rgba(111,72,233,0.08)',
    shadowColor: '#6F48E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  featureIcon: {
    width: '28@ms',
    height: '28@ms',
    borderRadius: '8@ms',
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '2@ms',
  },
  featureDesc: {
    fontSize: '12@ms',
    color: '#374151',
    lineHeight: '17@ms',
  },

  // ── Final
  finalIcon: {
    width: '76@ms',
    height: '76@ms',
    borderRadius: '20@ms',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6F48E9',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  finalIconTxt: {
    fontSize: '36@ms',
  },
  finalTitle: {
    fontSize: '24@ms',
    fontWeight: '800',
    lineHeight: '32@ms',
    letterSpacing: -0.6,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: '4@ms',
  },
  finalSubtitle: {
    fontSize: '14@ms',
    lineHeight: '22@ms',
    color: '#6B7280',
    textAlign: 'center',
  },
  startBtn: {
    paddingVertical: '15@ms',
    paddingHorizontal: '36@ms',
    borderRadius: '100@ms',
    shadowColor: '#6F48E9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
    marginTop: '8@ms',
  },
  startBtnTxt: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.2,
  },

  // ── Footer
  footer: {
    paddingHorizontal: '20@ms',
    paddingTop: '8@ms',
    gap: '12@ms',
  },
  dotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '4@ms',
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10@ms',
  },
  progressTxt: {
    fontSize: '12@ms',
    color: '#6B7280',
    fontWeight: '600',
    minWidth: '36@ms',
  },
  progressTrack: {
    flex: 1,
    height: '3@ms',
    backgroundColor: '#F3F4F6',
    borderRadius: '100@ms',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6F48E9',
    borderRadius: '100@ms',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '44@ms',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
  },
  dot: {
    height: '7@ms',
    borderRadius: '100@ms',
  },
  navBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10@ms',
  },
  prevBtn: {
    paddingVertical: '10@ms',
    paddingHorizontal: '12@ms',
    borderRadius: '12@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnTxt: {
    fontSize: '14@ms',
    color: '#6B7280',
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  nextBtn: {
    height: '42@ms',
    paddingHorizontal: '28@ms',
    borderRadius: '12@ms',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6F48E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnTxt: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#FFF',
  },
})
