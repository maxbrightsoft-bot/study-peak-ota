import { palette, TYPO } from '@/theme'
import React from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView, Text } from 'react-native'
import { TabList } from '../configs/constants'
import useTab from '@/hooks/useTab'
import { useTranslation } from 'react-i18next'
import TabPanel from '@/components/Tab/TabPanel'
import TextbookList from '../components/TextbookList'
import { PreparedFilterType, PreparedType } from '../configs/type'
import HeaderAction from '@/layouts/components/HeaderAction'

const Textbook = () => {
  const { t } = useTranslation()
  const { selected, handleChangeTab } = useTab(TabList)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('question_bank')}</Text>
        <View>
          <HeaderAction />
        </View>
      </View>
      <View style={{ marginTop: 18 }}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal
          style={{ flexDirection: 'row', paddingLeft: 20 }}
          contentContainerStyle={{ gap: 16, paddingRight: 30, height: 30 }}
        >
          {TabList.map(({ label, value }, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tabButton, value === selected ? styles.activeTab : styles.inactiveTab]}
              onPress={() => handleChangeTab(value)}
            >
              <Text style={[styles.tabText, { color: value === selected ? palette.main[600] : palette.grey[900] }]}>
                {t(label)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* <TabPanel value={selected} index={TabList[0].value}>
        <TextbookList preparedFilterType={PreparedFilterType.recently_solved_questions} />
      </TabPanel>
      <TabPanel value={selected} index={TabList[1].value}>
        <TextbookList />
      </TabPanel> */}
      <TabPanel value={selected} index={TabList[0].value}>
        <TextbookList preparedType={PreparedType.csat_past_questions} />
      </TabPanel>
      <TabPanel value={selected} index={TabList[1].value}>
        <TextbookList preparedType={PreparedType.official_mock_exam} />
      </TabPanel>
      <TabPanel value={selected} index={TabList[2].value}>
        <TextbookList preparedType={PreparedType.private_mock_exam} />
      </TabPanel>
      <TabPanel value={selected} index={TabList[3].value}>
        <TextbookList preparedType={PreparedType.workbook} />
      </TabPanel>
      <TabPanel value={selected} index={TabList[4].value}>
        <TextbookList preparedType={PreparedType.past_exam_questions} />
      </TabPanel>
      <TabPanel value={selected} index={TabList[5].value}>
        <TextbookList preparedFilterType={PreparedFilterType.academy_questions} />
      </TabPanel>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#222222'
  },
  scrollView: {
    gap: 24,
    padding: 8
  },
  startButton: {
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 200
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: palette.grey[100]
  },
  tabButton: {},
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
  buttonContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  buttonText: {
    ...TYPO.button1,
    color: '#FFF'
  },
  emptyText: {
    ...TYPO.caption,
    color: palette.grey[500],
    textAlign: 'center'
  }
})

export default Textbook
