import { palette } from '@/theme'
import { ChapterResponse } from '@/utils/types'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { toast } from '@/utils/helpers'

type Props = {
  t: any
  isEnglish: boolean
  chapter: ChapterResponse
  isMock: boolean
  isStudying: boolean
  handleOpenChapterDialog: (chapter: any) => void
  handleStartFromPage: (values: { startPage: number }) => Promise<void>
}

const ChapterDetail = ({ t, isEnglish, isMock, chapter, isStudying, handleOpenChapterDialog }: Props) => {
  const isCompleted = chapter.completedChapterQuestions === chapter.totalChapterQuestions && chapter.completedChapterQuestions > 0

  const handleCardPress = () => {
    if (!isStudying || !isCompleted) {
      toast.info(t('result_will_be_displayed_after_doing_exam'))
    }
  }

  return (
    <View style={styles.chapterCardContainer}>
      <TouchableOpacity activeOpacity={0.8} onPress={handleCardPress} style={styles.chapterCard}>
        <View style={{ flex: 1 }}>
          {!isCompleted && <Text style={styles.chapterTitle} numberOfLines={2}>{chapter.name}</Text>}
          {isCompleted && (
            <View style={styles.chapterTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 }}>
                <View style={styles.doneBadge}>
                  <Text style={styles.doneText}>{t('complete')}</Text>
                </View>

                <Text style={[styles.chapterTitle, { flex: 1 }]} numberOfLines={2}>{chapter.name}</Text>
              </View>

              <TouchableOpacity
                style={[styles.resultBtn]}
                onPress={() => {
                  if (!isStudying) {
                    toast.info(t('result_will_be_displayed_after_doing_exam'))
                    return
                  }
                  handleOpenChapterDialog(chapter)
                }}
              >
                <Text style={styles.resultText}>{t('solution_results')}</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Text
              style={styles.chapterMeta}
            >{`${chapter.completedChapterQuestions}/${chapter.totalChapterQuestions} ${t('questions')}`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = ScaledSheet.create({
  chapterCardContainer: {
    backgroundColor: 'white',
    borderRadius: '14@ms',
    marginBottom: '10@ms',
    overflow: 'hidden'
  },
  chapterCard: {
    padding: '16@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chapterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  doneBadge: {
    backgroundColor: '#D7FFE7',
    paddingHorizontal: '10@ms',
    paddingVertical: '4@ms',
    borderRadius: '12@ms'
  },
  doneText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#3DC674'
  },
  chapterTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },
  chapterMeta: {
    fontSize: '13@ms',
    color: '#667085'
  },
  divider: {
    backgroundColor: palette.grey[300],
    width: '1@ms',
    height: '10@ms',
    alignSelf: 'center',
    marginHorizontal: '10@ms'
  },
  resultBtn: {
    borderWidth: '1@ms',
    borderColor: palette.main[500],
    borderRadius: '16@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '6@ms'
  },
  resultText: {
    fontSize: '13@ms',
    color: palette.main[500],
    fontWeight: '600'
  },
  startPageBtn: {
    backgroundColor: palette.main[50],
    borderColor: palette.main[300],
    borderWidth: '1@ms',
    paddingHorizontal: '10@ms',
    paddingVertical: '5@ms',
    borderRadius: '12@ms'
  },
  startPageBtnTxt: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: palette.main[600]
  },
  subChapterList: {
    borderTopWidth: '1@ms',
    borderTopColor: palette.grey[200],
    backgroundColor: '#F9FAFB',
    paddingHorizontal: '16@ms',
    paddingVertical: '10@ms',
    gap: '8@ms'
  },
  subChapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '6@ms'
  },
  subChapterTitle: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.grey[800]
  },
  subChapterMeta: {
    fontSize: '12@ms',
    color: palette.grey[500],
    marginTop: '2@ms'
  },
  subStartBtn: {
    backgroundColor: 'white',
    borderColor: palette.grey[300],
    borderWidth: '1@ms',
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '10@ms'
  },
  subStartBtnTxt: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: palette.grey[700]
  }
})

export default ChapterDetail
