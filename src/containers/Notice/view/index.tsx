import { Text, TouchableOpacity, View, FlatList, ScrollView } from 'react-native'
import useNotice from '../hooks/useNotice'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import moment from 'moment'
import NoticeDetailDialog from '../components/NoticeDetailDialog'
import { TabList } from '../configs/constants'
import { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
}

const Notice = ({ open, onClose }: Props) => {
  const [isNew, setNew] = useState<any>({});
  const {
    t,
    selected,
    handleChangeTab,
    notifications,
    selectedNotification,
    openNoticeDetailDialog,
    handleOpenDetailDialog,
    handleCloseDetailDialog
  } = useNotice(setNew)

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity style={styles.item} onPress={() => handleOpenDetailDialog(item)}>
        <View style={styles.itemContent}>
          <Text numberOfLines={1} style={styles.title}>
            {item?.name}
          </Text>

          {item.teacherName && <Text style={styles.teacher}>{item.teacherName}</Text>}

          <Text style={styles.date}>{moment(item.createdAt).format('YY.MM.DD')}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[200]} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('institute_notice')}</Text>

        <View style={{ width: 24 }} />
      </View>
      <View style={styles.container}>
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {TabList.map(({ label, value, type }, index) => {
              const active = selected === value
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.tab]}
                  onPress={() => handleChangeTab(value, type)}
                  activeOpacity={0.75}
                >
                  {isNew[value] && <View style={styles.badge} />}
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{t(label)}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      </View>
      <NoticeDetailDialog
        open={openNoticeDetailDialog}
        onClose={handleCloseDetailDialog}
        notification={selectedNotification}
      />
    </SlideDrawerRoot>
  )
}

export default Notice

const styles = ScaledSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  container: {
    paddingTop: 20,
    backgroundColor: palette.bg[100]
  },

  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222'
  },

  badge: {
    height: 10,
    width: 10,
    borderRadius: 255,
    backgroundColor: palette.main[600],
    position: 'absolute',
    top: 0,
    right: 10
  },

  backButton: {
    width: 24
  },
  tabsWrapper: {},
  tabsContainer: {
    flexDirection: 'row'
  },
  tab: {
    minWidth: 70,
    paddingHorizontal: '18@ms',
    paddingVertical: '6@ms'
  },
  tabActive: {
    color: palette.main[600]
  },
  tabText: {
    textAlign: 'center',
    fontSize: '14@ms',
    fontWeight: '500',
    color: '#858588'
  },
  tabTextActive: {
    color: palette.main[600],
    fontWeight: '700'
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms'
  },

  itemContent: {
    flex: 1,
    gap: 8,
    marginRight: 12
  },

  title: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },

  teacher: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: palette.grey[700]
  },

  date: {
    fontSize: '12@ms',
    fontWeight: '400',
    color: palette.grey[500]
  },

  thumbnail: {
    width: '56@ms',
    height: '56@ms',
    borderRadius: 8,
    backgroundColor: '#ddd'
  },

  divider: {
    height: 1,
    backgroundColor: palette.grey[100],
    marginVertical: 6
  }
})
