import { palette, TYPO } from '@/theme'
import React from 'react'
import { View, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Text, Button, Card, Title } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import useRecentTextbook from '../hooks/useRecentTextbook'
import { PreparedFilterType } from '../configs/type'
import { getSafeUrl, utcToLocalTime } from '@/utils/helpers'
import moment from 'moment'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import { TextbookResponse } from '@/utils/types'

type Props = {
  handleOpenTextbookResult: (textbook?: TextbookResponse) => void
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 40,
    paddingHorizontal: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  icon: {
    padding: 2,
    marginRight: 10
  },
  headerTitle: {
    ...TYPO.heading1,
    color: palette.grey[700]
  },
  viewAllButton: {
    ...TYPO.button3,
    color: palette.grey[900]
  },
  scrollContainer: {
    backgroundColor: palette.grey[50],
    borderRadius: 6,
    padding: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: palette.grey[300],
    maxHeight: 500
  },
  contentContainer: {
    gap: 12
  },
  textbookItem: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    shadowColor: 'transparent'
  },
  textbookContent: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  textbookImage: {
    width: 96,
    height: 121,
    marginRight: 12,
    resizeMode: 'contain'
  },
  textbookInfo: {
    flex: 1,
    gap: 16
  },
  textbookName: {
    ...TYPO.heading3,
    color: palette.grey[900],
    width: '60%'
  },
  textbookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  textbookMetaText: {
    ...TYPO.body4,
    color: palette.grey[500]
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  progressText: {
    ...TYPO.body4,
    color: palette.grey[900]
  },
  progressPercent: {
    ...TYPO.body4,
    color: palette.main[500]
  },
  emptyText: {
    ...TYPO.caption,
    color: palette.grey[500],
    textAlign: 'center'
  }
})

const RecentTextbook = ({ handleOpenTextbookResult }: Props) => {
  const { t, textbookList, handleDoTextbook } = useRecentTextbook({
    preparedFilterType: PreparedFilterType.recently_solved_questions
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="bulb" size={20} color={palette.grey[700]} style={styles.icon} />
          <Text style={styles.headerTitle}>문제집 이어 풀기</Text>
        </View>
        <Button onPress={() => navigate(Routes.Auth.Textbook)}>
          <Text style={styles.viewAllButton}>전체 보기</Text>
        </Button>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          {textbookList.map((textbook) => (
            <TouchableOpacity
              onPress={() => handleOpenTextbookResult(textbook)}
              key={textbook.id}
              style={styles.textbookItem}
            >
              <View style={styles.textbookContent}>
                <Image
                  source={{ uri: getSafeUrl(textbook?.coverImage || '') }}
                  style={styles.textbookImage}
                />
                <View style={styles.textbookInfo}>
                  <Title
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.textbookName}
                  >
                    {textbook.name}
                  </Title>
                  <View style={styles.textbookMeta}>
                    <Text style={styles.textbookMetaText}>
                      {moment().subtract(textbook.createdAt, 'hours').fromNow()}
                    </Text>
                    <Text style={styles.textbookMetaText}>
                      {utcToLocalTime(textbook.createdAt, t('date_format'))}
                    </Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>진행도</Text>
                    <Text style={styles.progressPercent}>
                      {Math.round((textbook.completedQuestions / textbook.totalQuestions) * 100)}%
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {textbookList?.length === 0 && (
            <Text style={styles.emptyText}>{t('no_data')}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default RecentTextbook