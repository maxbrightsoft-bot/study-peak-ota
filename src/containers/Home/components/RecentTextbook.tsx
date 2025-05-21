import { palette, TYPO } from '@/theme'
import React from 'react'
import { View, ScrollView, Image } from 'react-native'
import { Text, Button, Card, Title } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import useRecentTextbook from '../hooks/useRecentTextbook'
import { PreparedFilterType } from '../configs/type'
import { getSafeUrl, utcToLocalTime } from '@/utils/helpers'
import moment from 'moment'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'

const RecentTextbook = () => {
  const { t, textbookList, handleDoTextbook } = useRecentTextbook({
    preparedFilterType: PreparedFilterType.recently_solved_questions
  })

  return (
    <View
      style={{
        marginVertical: 40,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 16
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Ionicons name="bulb" size={20} color={palette.grey[700]} style={{ padding: 2, marginRight: 10 }} />
          <Text style={{ ...TYPO.heading1, color: palette.grey[700] }}>문제집 이어 풀기</Text>
        </View>
        <Button onPress={() => navigate(Routes.Auth.Textbook)}>
          <Text style={{ ...TYPO.button3, color: palette.grey[900] }}>전체 보기</Text>
        </Button>
      </View>
      <ScrollView
        style={{
          backgroundColor: palette.grey[50],
          borderRadius: 6,
          padding: 8,
          gap: 8,
          display: 'flex',
          borderWidth: 1,
          borderColor: palette.grey[300],
          maxHeight: 500
        }}
      >
        {textbookList.map((textbook) => (
          <Card key={textbook.id} style={{ backgroundColor: '#FFF', borderRadius: 6, boxShadow: 'none' }}>
            <Card.Content style={{ flexDirection: 'row', gap: 16, paddingVertical: 12, paddingHorizontal: 16 }}>
              <Image source={{ uri: getSafeUrl(textbook?.coverImage || "") }} style={{ width: 96, height: 121, marginRight: 12 }} />
              <View style={{ flex: 1, gap: 16 }}>
                <Title numberOfLines={1} ellipsizeMode="tail" style={{ ...TYPO.heading3, color: palette.grey[900], width: "60%" }}>{textbook.name}</Title>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <Text style={{ ...TYPO.body4, color: palette.grey[500] }}>
                    {moment().subtract(textbook.createdAt, 'hours').fromNow()}
                  </Text>
                  <Text style={{ ...TYPO.body4, color: palette.grey[500] }}>
                    {utcToLocalTime(textbook.createdAt, t('date_format'))}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ ...TYPO.body4, color: palette.grey[900] }}>진행도</Text>
                  <Text style={{ ...TYPO.body4, color: palette.main[500] }}>
                    {Math.round((textbook.completedQuestions / textbook.totalQuestions) * 100)}%
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
        {textbookList?.length === 0 && (
          <Text style={{ ...TYPO.caption, color: palette.grey[500], textAlign: 'center' }}>{t('no_data')}</Text>
        )}
      </ScrollView>
    </View>
  )
}

export default RecentTextbook
