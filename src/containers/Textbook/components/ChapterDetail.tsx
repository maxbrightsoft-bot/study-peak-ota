import { palette } from '@/theme'
import { ChapterResponse } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  t: any
  isEnglish: boolean
  chapter: ChapterResponse
  isMock: boolean
  isStudying: boolean
  handleOpenChapterDialog: (chapter: any) => void
  handleStartFromPage: (values: { startPage: number }) => Promise<void>
}

const ChapterDetail = ({ t, isEnglish, isMock, chapter, isStudying, handleStartFromPage, handleOpenChapterDialog }: Props) => {
  const isCompleted = chapter.completedChapterQuestions === chapter.totalChapterQuestions
  return (
    <View style={styles.chapterCard}>
      <View style={{ flex: 1 }}>
        {!isCompleted && <Text style={styles.chapterTitle}>{chapter.name}</Text>}
        {isCompleted && (
          <View style={styles.chapterTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.doneBadge}>
                <Text style={styles.doneText}>{t('complete')}</Text>
              </View>

              <Text style={styles.chapterTitle}>{chapter.name}</Text>
            </View>

            <TouchableOpacity
              disabled={!isStudying}
              style={[styles.resultBtn]}
              onPress={() => handleOpenChapterDialog(chapter)}
            >
              <Text style={styles.resultText}>{t('solution_results')}</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text
            style={styles.chapterMeta}
          >{`${chapter.completedChapterQuestions}/${chapter.totalChapterQuestions} 문제`}</Text>
          <View style={styles.divider} />
          <Text style={styles.chapterMeta}>
            {`${t('page_number', { number: chapter.pageFrom })} ~ ${t('page_number', { number: chapter.pageTo })}`}
          </Text>
        </View>
      </View>
      {!isCompleted && !isMock && (
        <View style={{ marginBottom: 8 }}>
          <TouchableOpacity onPress={() => handleOpenChapterDialog(chapter)}>
            <Ionicons name="chevron-forward" size={20} color={palette.grey[300]} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = ScaledSheet.create({
  accordion: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden'
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center'
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  chapterName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  questionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666'
  },
  details: {
    paddingHorizontal: '32@ms',
    paddingBottom: 16,
    gap: 16
  },
  row: {
    flexDirection: 'row',
    gap: 16
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    justifyContent: 'flex-start'
  },
  divider: {
    backgroundColor: palette.grey[300],
    width: 1,
    height: 10,
    alignSelf: 'center',
    marginHorizontal: 10
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111'
  },
  statRow: {
    flexDirection: 'row',
    gap: 8
  },
  grayText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600'
  },
  lightText: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '600'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  chapterList: {
    gap: '16@ms'
  },

  chapterCard: {
    backgroundColor: 'white',
    borderRadius: '14@ms',
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
  resultBtn: {
    borderWidth: 1,
    borderColor: palette.main[500],
    borderRadius: '16@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '6@ms'
  },

  resultText: {
    fontSize: '13@ms',
    color: palette.main[500],
    fontWeight: '600'
  }
})

export default ChapterDetail
