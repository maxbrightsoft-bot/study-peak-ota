import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TextbookTabList } from '../../configs/constants'
import { palette, TYPO } from '@/theme'
import SlideDrawer from '@/components/ModalBase/SlideDrawer'
import useTextbookDrawer from '../../hooks/useTextbookDrawer'
import { getSafeUrl, utcToLocalTime } from '@/utils/helpers'
import StartPageDialog from './StartPageDialog'
import Statistic from '../Statistic'
import ChapterDetail from '../ChapterDetail'
import { ScaledSheet } from 'react-native-size-matters'
import ExamResult from '@/containers/ExamResult/views'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import { ExamStatus } from '@/utils/enums'
import RestartPageDialog from './RestartPageDialog'

type Props = {
  isOpen: boolean
  onClose?: () => void
  textbookId?: number
  studentId?: number
  role?: string
  onViewQA?: (studentId: number, sessionId?: number, questionId?: number, isTextbook?: boolean) => void
  onOpenAudioGuide?: () => void
}

const TextbookDrawer = ({ isOpen, textbookId, studentId, onClose, onViewQA, onOpenAudioGuide }: Props) => {
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
  } = useTextbookDrawer({
    textbookId,
    studentId,
    onClose,
    onOpenAudioGuide
  })

  const progressTextLeft = useMemo(() => {
    const progress = textbook?.progress || 0
    return Math.max(progress > 7 ? progress - 20 : progress + 3, 20)
  }, [textbook?.progress])

  const isDone = !!textbook && textbook.status === ExamStatus.Completed
  const isMockTextbook = !!textbook?.isMock

  return (
    <SlideDrawer visible={isOpen}>
      <ScrollView style={styles.drawerContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="chevron-back-outline" size={24} color={palette.main[500]} />
            <Text style={[styles.backText]}>티로 가기</Text>
          </TouchableOpacity>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleDoTextbook}>
              <Ionicons name="book" size={16} color="white" />
              <Text style={styles.buttonText}>{t('learning')}</Text>
            </TouchableOpacity>

            {!isMockTextbook && (
              <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={handleOpenStartPageDialog}>
                <Text style={styles.outlineButtonText}>{t('unravel_from_page')}</Text>
              </TouchableOpacity>
            )}

            {!!textbook && textbook.isStudying && (
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={() => (isMockTextbook ? handleOpenConfirmDialog() : handleOpenRestartTextbookDialog())}
              >
                <Ionicons name="refresh" size={18} color={palette.main[500]} />
                <Text style={styles.outlineButtonText}>{t('restart_textbook')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.bookInfoContainer}>
            <View style={styles.bookCover}>
              <Image
                source={{ uri: getSafeUrl(textbook?.coverImage || '') }}
                style={styles.coverImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.bookDetails}>
              <View style={styles.titleRow}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {textbook?.name}
                </Text>
                {isMockTextbook && isDone && <Ionicons name="checkmark-circle" size={20} color="#12B76A" />}
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('subject')}</Text>
                  <Text style={styles.detailValue}>{textbook?.subjectName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('publication_date')}</Text>
                  <Text style={styles.detailValue}>{utcToLocalTime(textbook?.publicationDate, t('date_format'))}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('publisher')}</Text>
                  <Text style={styles.detailValue}>{textbook?.publisher}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('number_of_questions')}</Text>
                  <Text style={styles.detailValue}>{`${textbook?.totalQuestions ?? 0} ${t('questions')}`}</Text>
                </View>
              </View>
            </View>
          </View>

          {(!isMockTextbook || (isMockTextbook && isDone)) && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>{t('progress')}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${textbook?.progress || 0}%` }]} />
                <View style={[styles.progressText, { left: `${progressTextLeft}%` }]}>
                  <Text
                    style={[
                      styles.progressPercentage,
                      {
                        color: textbook?.progress === 0 ? palette.main[900] : 'white'
                      }
                    ]}
                  >
                    {`${(textbook?.progress || 0).toFixed(2)}%`}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {!!textbook?.chapters?.length && (!isMockTextbook || (isMockTextbook && isDone)) && (
            <View style={styles.tabSection}>
              <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TextbookTabList.map(({ label, value }, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.tabButton, value === selected ? styles.activeTab : styles.inactiveTab]}
                      onPress={() => handleChangeTab(value)}
                    >
                      <Text style={[styles.tabText, { color: value === selected ? palette.main[500] : '#667085' }]}>
                        {t(label)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {selected === 0 && (
                <View style={styles.tabContent}>
                  <View style={styles.chapterListContainer}>
                    {textbook?.chapters?.map((chapter, index) => (
                      <ChapterDetail
                        key={index}
                        t={t}
                        isEnglish={isEnglish}
                        chapter={chapter}
                        isStudying={!!textbook?.isStudying}
                        handleOpenChapterDialog={handleOpenChapterDialog}
                      />
                    ))}
                  </View>
                </View>
              )}

              {selected === 1 && (
                <View style={styles.tabContent}>
                  <View style={styles.chapterListContainer}>
                    {textbook?.chapters?.map((chapter, index) => (
                      <Statistic key={index} t={t} isEnglish={isEnglish} chapter={chapter} />
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

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

      {isOpenChapterDialog && (
        <ExamResult
          chapterId={chapterSelected?.id}
          onClose={handleCloseChapterDialog}
          studentId={studentId}
          onViewQA={onViewQA}
        />
      )}
    </SlideDrawer>
  )
}

const styles = ScaledSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    ...TYPO.button2,
    color: palette.main[500]
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EC',
    backgroundColor: '#F9FAFB'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  closeButton: {
    padding: 4
  },
  contentContainer: {
    paddingTop: 40
  },
  bookInfoContainer: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 24
  },
  bookCover: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#F2F4F7',
    padding: 8,
    backgroundColor: 'white'
  },
  coverImage: {
    width: 100,
    height: 140,
    borderRadius: 4
  },
  bookDetails: {
    flex: 1,
    gap: 16
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
    flex: 1
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F4F7'
  },
  detailsSection: {
    gap: 12
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667085',
    width: 100
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#101828',
    flex: 1
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  primaryButton: {
    backgroundColor: palette.main[500]
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: palette.main[500],
    backgroundColor: 'white'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.main[500]
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginHorizontal: 24,
    marginBottom: 24
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.main[500],
    minWidth: 50
  },
  progressBar: {
    flex: 1,
    height: 22,
    backgroundColor: '#F2F4F7',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.main[500],
    borderRadius: 10
  },
  progressText: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center'
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '500'
  },
  tabSection: {
    flex: 1
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
    paddingHorizontal: 16
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 100,
    borderBottomWidth: 2,
    marginRight: 8
  },
  activeTab: {
    borderBottomColor: palette.main[500]
  },
  inactiveTab: {
    borderBottomColor: '#D0D5DD'
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center'
  },
  tabContent: {
    flex: 1
  },
  chapterListContainer: {
    margin: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: 'white',
    padding: 12,
    gap: 16
  }
})

export default TextbookDrawer
