import React from 'react'
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

type Props = {
  isOpen: boolean
  onClose?: () => void
  textbookId?: number
}

const TextbookDrawer = ({ isOpen, textbookId, onClose }: Props) => {
  const {
    t,
    textbook,
    selected,
    isEnglish,
    chapterSelected,
    startPageOptions,
    isOpenChapterDialog,
    isOpenStartPageDialog,
    handleChangeTab,
    handleDoTextbook,
    handleCloseChapterDialog,
    handleOpenChapterDialog,
    handleCloseStartPageDialog,
    handleOpenStartPageDialog,
    handleStartFromPage
  } = useTextbookDrawer({ textbookId })

  return (
    <SlideDrawer visible={isOpen}>
      <ScrollView style={styles.drawerContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="chevron-back-outline" size={24} color={palette.main[500]} />
            <Text style={[styles.backText]}>티로 가기</Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() =>
                handleDoTextbook({
                  textbookId,
                  isStudying: !!textbook?.isStudying
                })
              }
            >
              <Ionicons name="book" size={16} color="white" />
              <Text style={{ color: 'white' }}>{t('learning')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={handleOpenStartPageDialog}>
              <Text style={{ color: palette.main[500] }}>{t('unravel_from_page')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bookInfoContainer}>
          <View style={styles.bookCover}>
            <Image
              source={{ uri: getSafeUrl(textbook?.coverImage || '') }}
              style={styles.coverImage}
              onError={(e) => console.log('Error:', e.nativeEvent.error)}
            />
          </View>
          <View style={styles.bookDetails}>
            <View>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{ fontSize: 16, fontWeight: '700', color: '#101828' }}
              >
                {textbook?.name}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={{ gap: 8 }}>
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
                <Text style={styles.detailValue}>{`${textbook?.totalQuestions} ${t('questions')}`}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: palette.main[500], minWidth: 50 }}>
            {t('progress')}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${textbook?.progress || 0}%` }]} />
            <View
              style={[
                styles.progressText,
                {
                  left: `${
                    textbook?.progress && textbook?.progress > 20
                      ? textbook?.progress - 20
                      : (textbook?.progress || 0) + 3
                  }%`
                }
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: textbook?.progress === 0 ? 'black' : 'white'
                }}
              >
                {`${(textbook?.progress || 0).toFixed(2)}%`}
              </Text>
            </View>
          </View>
        </View>

        {!!textbook?.chapters?.length && (
          <View>
            <View style={styles.tabContainer}>
              <View style={styles.tabRow}>
                {TextbookTabList.map(({ label, value }, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.tabButton, value === selected ? styles.activeTab : styles.inactiveTab]}
                    onPress={() => handleChangeTab(value)}
                  >
                    <Text
                      style={{
                        fontWeight: '700',
                        color: value === selected ? palette.main[500] : '#667085'
                      }}
                    >
                      {t(label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {selected === 0 && (
              <View style={styles.chapterListContainer}>
                <View style={{ gap: 16 }}>
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
              <View style={styles.chapterListContainer}>
                {textbook?.chapters?.map((chapter, index) => (
                  <Statistic key={index} t={t} isEnglish={isEnglish} chapter={chapter} />
                ))}
              </View>
            )}
          </View>
        )}

        <StartPageDialog
          options={startPageOptions}
          t={t}
          open={isOpenStartPageDialog}
          onClose={handleCloseStartPageDialog}
          onSubmit={handleStartFromPage}
        />
      </ScrollView>
      {isOpenChapterDialog && <ExamResult chapterId={chapterSelected?.id} onClose={handleCloseChapterDialog} />}
    </SlideDrawer>
  )
}

const styles = ScaledSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EC',
    backgroundColor: '#F9FAFB'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    ...TYPO.button2,
    color: palette.main[500]
  },
  button: {
    padding: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  primaryButton: {
    backgroundColor: palette.main[500]
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: palette.main[500]
  },
  contentContainer: {
    paddingTop: 40,
    gap: 24,
    flex: 1
  },
  bookInfoContainer: {
    flexDirection: 'row',
    gap: 24,
    marginHorizontal: 24,
    paddingTop: 24
  },
  coverImage: {
    width: 96,
    height: 121,
    objectFit: 'contain',
    marginRight: 12
  },
  bookCover: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#F2F4F7',
    padding: 8,
    backgroundColor: '#F9FAFB'
  },
  bookDetails: {
    flex: 1,
    gap: 16
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F4F7',
    marginVertical: 8
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667085',
    width: 40
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#101828'
  },
  progressContainer: {
    position: 'relative',
    marginTop: '24@ms',
    flexDirection: 'row',
    gap: 24,
    marginHorizontal: 24
  },
  progressBar: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    height: 22,
    flexGrow: 1
  },
  progressFill: {
    backgroundColor: palette.main[500],
    borderRadius: 10,
    height: '100%'
  },
  progressText: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center'
  },
  tabContainer: {
    marginTop: 24,
    marginHorizontal: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7'
  },
  tabRow: {
    flexDirection: 'row',
    gap: 16
  },
  tabButton: {
    minWidth: 100,
    fontWeight: '700',
    padding: 12,
    borderBottomWidth: 1
  },
  activeTab: {
    color: palette.main[500],
    borderBottomColor: palette.main[500]
  },
  inactiveTab: {
    color: '#667085',
    borderBottomColor: '#D0D5DD'
  },
  chapterListContainer: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#F9FAFB',
    padding: 8,
    margin: 24,
    gap: 8
  }
})

export default TextbookDrawer
