import CustomDropDown from '@/components/DropDown/CustomDropDown'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  t: any
  isEnglish: boolean
  chapter: any
  isStudying: boolean
  handleOpenChapterDialog: (chapter: any) => void
}

const ChapterDetail = ({ t, isEnglish, chapter, isStudying, handleOpenChapterDialog }: Props) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <View style={[styles.accordion, { backgroundColor: palette.common.white }]}>
      <CustomDropDown
        title={
          <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 4}}>
            <Ionicons name="checkmark-circle" size={20} color={palette.main[500]} />
            <Text style={styles.chapterName}>{chapter.name}</Text>
          </View>
        }
        expanded={!expanded}
        onPress={toggleExpand}
      >
        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={[styles.label, { width: 130 }]}>{t('page_title')}</Text>
            <Text style={styles.label}>{t('the_solution_available')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.value, { width: 130 }]}>
              {`${t('page_number', { number: chapter.pageFrom })} ~ ${t('page_number', { number: chapter.pageTo })}`}
            </Text>
            {isEnglish ? (
              <View style={styles.statRow}>
                <Text style={styles.lightText}>{`${chapter.completedChapterQuestions} ${t('questions')}`}</Text>
                <Text style={styles.grayText}>
                  {t('chapter_progress', {
                    total: chapter?.totalChapterQuestions || 0
                  })}
                </Text>
              </View>
            ) : (
              <View style={styles.statRow}>
                <Text style={styles.grayText}>
                  {t('chapter_progress', {
                    total: chapter?.totalChapterQuestions || 0
                  })}
                </Text>
                <Text style={styles.lightText}>{`${chapter.completedChapterQuestions} ${t('questions')}`}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            disabled={!isStudying}
            style={[
              styles.button,
              {
                backgroundColor: isStudying ? palette.main[500] : '#ccc'
              }
            ]}
            onPress={() => handleOpenChapterDialog(chapter)}
          >
            <Ionicons name="receipt-sharp" color="#fff" size={16} style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>{t('solution_results')}</Text>
          </TouchableOpacity>
        </View>
      </CustomDropDown>
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
    paddingHorizontal: "32@ms",
    paddingBottom: 16,
    gap: 16
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    justifyContent: "flex-start"
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
  }
})

export default ChapterDetail
