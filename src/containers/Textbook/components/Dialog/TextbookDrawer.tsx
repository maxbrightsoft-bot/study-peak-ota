import React from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import useTextbookDrawer from '../../hooks/useTextbookDrawer'
import { getSafeUrl, toast, utcToLocalTime } from '@/utils/helpers'
import { ScaledSheet } from 'react-native-size-matters'
import { formatTime } from '../../configs/helpers'
import { TextbookTabList } from '../../configs/constants'
import ChapterDetail from '../ChapterDetail'
import Statistic from '../Statistic'
import RestartPageDialog from './RestartPageDialog'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import StartPageDialog from './StartPageDialog'
import TextbookChapterResultDialog from './TextbookChapterResultDialog'

type Props = {
  isOpen: boolean
  onClose?: () => void
  textbookId?: number
  onOpenAudioGuide?: () => void
}

const TextbookDrawer = ({ isOpen, textbookId, onClose, onOpenAudioGuide }: Props) => {
  const {
    t,
    loading,
    textbook,
    selected,
    isEnglish,
    chapterSelected,
    startPageOptions,
    isOpenChapterDialog,
    isOpenStartPageDialog,
    isOpenConfirmDialog,
    openRestartTextbookDialog,
    handleChangeTab,
    handleDoTextbook,
    handleRestartMockTextbook,
    handleOpenRestartTextbookDialog,
    handleCloseRestartTextbookDialog,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    handleRestartTextbook,
    handleCloseChapterDialog,
    handleOpenChapterDialog,
    handleCloseStartPageDialog,
    handleOpenStartPageDialog,
    handleStartFromPage
  } = useTextbookDrawer({ textbookId, onOpenAudioGuide, onClose })

  const progress = textbook?.progress ?? 0
  const isMockTextbook = !!textbook?.isMock
  const isPlaceholder = textbook?.coverImage?.includes('placehold.co') || !textbook?.coverImage;
  const colors = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#7C3AED'];
  const bgColor = textbook?.id ? colors[textbook.id % colors.length] : colors[0];

  return (
    <SlideDrawerRoot visible={isOpen}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="chevron-back" size={24} color="#B8B8B8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('textbook_detail')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bookCard}>
            {isPlaceholder ? (
              <View style={[styles.cover, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', padding: 8 }]}>
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '700', textAlign: 'center' }} numberOfLines={5}>
                  {textbook?.name}
                </Text>
              </View>
            ) : (
              <Image source={{ uri: getSafeUrl(textbook?.coverImage || '') }} style={styles.cover} />
            )}

            <View style={{ flex: 1 }}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{textbook?.subjectName}</Text>
              </View>

              <Text style={styles.title} numberOfLines={2}>
                {textbook?.name}
              </Text>

              <View style={styles.metaRow}>
                <Text style={{ color: '#222222' }}>{t('publication_date')}</Text>
                <Text style={[styles.meta, { flex: 1, textAlign: 'right' }]}>{utcToLocalTime(textbook?.publicationDate, 'YYYY.MM.DD')}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={{ color: '#222222' }}>{t('publisher')}</Text>
                <Text style={[styles.meta, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>{textbook?.publisher}</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={{ color: '#222222' }}>{t('number_of_questions')}</Text>
                <Text style={[styles.meta, { flex: 1, textAlign: 'right' }]}>{textbook?.totalQuestions ?? 0} {t('questions')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={styles.progressText}>{progress}%</Text>
              <Text style={styles.progressSub}>{formatTime(t, textbook?.totalAnswerTime || 0)}</Text>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.tabContainer}>
              {TextbookTabList.map(({ label, value }) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.tabBtn, value === selected && styles.activeTab]}
                  onPress={() => handleChangeTab(value)}
                >
                  <Text style={[styles.tabText, value === selected && styles.activeTabText]}>{t(label)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selected === 0 && (
              <View style={styles.chapterList}>
                {textbook?.chapters?.map((chapter, index) => (
                  <ChapterDetail
                    key={index}
                    t={t}
                    isEnglish={isEnglish}
                    chapter={chapter}
                    isMock={textbook.isMock}
                    handleStartFromPage={handleStartFromPage}
                    isStudying={!!textbook?.isStudying}
                    handleOpenChapterDialog={handleOpenChapterDialog}
                  />
                ))}
              </View>
            )}

            {selected === 1 && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  const hasCompleted = textbook?.chapters?.some((c) => c.completedChapterQuestions && c.completedChapterQuestions > 0)
                  if (!hasCompleted || !textbook?.isStudying) {
                    toast.info(t('result_will_be_displayed_after_doing_exam'))
                  }
                }}
                style={styles.chapterList}
              >
                {textbook?.chapters?.map((chapter, index) => (
                  <Statistic key={index} t={t} isEnglish={isEnglish} chapter={chapter} />
                ))}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        <View style={styles.bottomBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bottomBarContent}>
            {!isMockTextbook && (
              <TouchableOpacity style={[styles.button, styles.pageBtn]} onPress={handleOpenStartPageDialog}>
                <Text style={styles.outlineButtonText}>{t('navigate_page')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.button, styles.continueBtn]} onPress={handleDoTextbook}>
              <Text style={styles.buttonText}>{t('do_exercises')}</Text>
            </TouchableOpacity>

            {!!textbook && textbook.isStudying && (
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={() => (isMockTextbook ? handleOpenConfirmDialog() : handleOpenRestartTextbookDialog())}
              >
                <Ionicons name="refresh" size={18} color={palette.main[500]} />
                <Text style={styles.outlineButtonText}>{t('restart_textbook')}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
      <StartPageDialog
        options={startPageOptions}
        t={t}
        loading={loading}
        open={isOpenStartPageDialog}
        onClose={handleCloseStartPageDialog}
        onSubmit={handleStartFromPage}
      />

      <RestartPageDialog
        title={t('restart')}
        options={startPageOptions}
        t={t}
        loading={loading}
        onClose={handleCloseRestartTextbookDialog}
        open={openRestartTextbookDialog}
        onSubmit={handleOpenConfirmDialog}
      />

      <ConfirmDialog
        open={isOpenConfirmDialog}
        toggle={handleCloseConfirmDialog}
        title={t('restart_textbook')}
        text={t('are_you_sure_you_want_to_restart_the_textbook')}
        onConfirm={isMockTextbook ? handleRestartMockTextbook : handleRestartTextbook}
      />

      <TextbookChapterResultDialog
        open={isOpenChapterDialog}
        chapterId={chapterSelected?.id}
        onClose={handleCloseChapterDialog}
      />
    </SlideDrawerRoot>
  )
}

export default TextbookDrawer

const styles = ScaledSheet.create({
  wrapper: {
    flex: 1
  },

  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    backgroundColor: 'white'
  },

  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: "#222222"
  },

  bookCard: {
    flexDirection: 'row',
    margin: '20@ms',
    gap: '16@ms'
  },

  cover: {
    width: '95@ms',
    height: '120@ms',
    borderRadius: '8@ms'
  },

  badge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: '10@ms',
    paddingVertical: '4@ms',
    borderRadius: '12@ms',
    alignSelf: 'flex-start',
    marginBottom: '6@ms'
  },

  badgeText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#36BFEC'
  },

  title: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#212121',
    marginBottom: '6@ms'
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16@ms'
  },

  meta: {
    fontSize: '13@ms',
    color: '#667085',
    marginTop: '2@ms'
  },

  progressSection: {
    marginHorizontal: '20@ms'
  },

  progressText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },

  progressSub: {
    paddingLeft: '8@ms',
    fontSize: '12@ms',
    color: palette.grey[900]
  },

  progressBar: {
    height: '8@ms',
    backgroundColor: '#E6E6E6',
    borderRadius: '4@ms',
    marginTop: '8@ms'
  },

  progressFill: {
    height: '100%',
    backgroundColor: palette.main[600],
    borderRadius: '4@ms'
  },

  contentContainer: {
    marginTop: '30@ms',
    paddingHorizontal: '20@ms',
    paddingVertical: '12@ms',
    gap: '24@ms',
    borderTopWidth: '1@ms',
    borderColor: palette.grey[100],
    backgroundColor: palette.bg[100]
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: '10@ms'
  },

  tabBtn: {
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms'
  },

  tabText: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: palette.grey[400]
  },

  activeTab: {
    borderBottomWidth: '2@ms',
    borderBottomColor: '#222222'
  },

  activeTabText: {
    color: '#222222',
    fontWeight: '700'
  },

  chapterList: {
    gap: '16@ms'
  },

  bottomBar: {
    borderTopWidth: '1@ms',
    borderColor: palette.grey[100],
    backgroundColor: '#FFF'
  },

  bottomBarContent: {
    flexDirection: 'row',
    gap: '12@ms',
    paddingHorizontal: '24@ms',
    paddingTop: '12@ms',
    paddingBottom: '46@ms'
  },

  button: {
    paddingHorizontal: '16@ms',
    paddingVertical: '14@ms',
    borderRadius: '8@ms',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },

  pageBtn: {
    borderWidth: '1@ms',
    borderColor: '#C7C7C8',
    borderRadius: '6@ms',
    alignItems: 'center',
    minWidth: '120@ms',
    justifyContent: 'center'
  },

  continueBtn: {
    backgroundColor: palette.main[600],
    borderRadius: '6@ms',
    alignItems: 'center',
    minWidth: '210@ms',
    justifyContent: 'center'
  },

  outlineButton: {
    borderWidth: '1@ms',
    borderColor: palette.main[600],
    backgroundColor: 'white'
  },

  buttonText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: 'white'
  },

  outlineButtonText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.main[600]
  }
})
