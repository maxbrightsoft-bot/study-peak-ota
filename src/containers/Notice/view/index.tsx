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
      <TouchableOpacity style={styles.item} onPress={() => handleOpenDetailDialog(item)} activeOpacity={0.8}>
        <View style={styles.itemIconContainer}>
          <Ionicons name="notifications-outline" size={24} color={palette.main[500]} />
        </View>
        <View style={styles.itemContent}>
          <Text numberOfLines={1} style={styles.title}>
            {item?.name}
          </Text>
          {item.teacherName && (
            <View style={styles.teacherRow}>
              <Ionicons name="person-outline" size={14} color={palette.grey[500]} />
              <Text style={styles.teacher}>{item.teacherName}</Text>
            </View>
          )}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color={palette.grey[500]} />
            <Text style={styles.date}>{moment(item.createdAt).format('YYYY.MM.DD')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="documents-outline" size={60} color={palette.grey[300]} />
      <Text style={styles.emptyText}>{t('no_data')}</Text>
    </View>
  )

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[800]} />
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
                  {active && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyComponent}
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
    borderBottomWidth: '1@ms',
    borderBottomColor: palette.grey[200],
    backgroundColor: '#fff'
  },
  container: {
    paddingTop: '16@ms',
    backgroundColor: palette.bg[100],
    flex: 1
  },

  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },

  badge: {
    height: '10@ms',
    width: '10@ms',
    borderRadius: '255@ms',
    backgroundColor: palette.main[600],
    position: 'absolute',
    top: 0,
    right: '10@ms'
  },

  backButton: {
    width: '24@ms'
  },
  tabsWrapper: {
    backgroundColor: '#fff',
    paddingBottom: '8@ms',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: '16@ms',
  },
  tab: {
    paddingHorizontal: '12@ms',
    paddingVertical: '10@ms',
    marginRight: '8@ms',
    position: 'relative'
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '12@ms',
    right: '12@ms',
    height: '3@ms',
    backgroundColor: palette.main[600],
    borderTopLeftRadius: '3@ms',
    borderTopRightRadius: '3@ms'
  },
  tabActive: {
    color: palette.main[600]
  },
  tabText: {
    textAlign: 'center',
    fontSize: '15@ms',
    fontWeight: '600',
    color: palette.grey[500]
  },
  tabTextActive: {
    color: palette.main[600],
    fontWeight: '700'
  },

  listContainer: {
    paddingHorizontal: '16@ms',
    paddingTop: '16@ms',
    paddingBottom: '32@ms',
    gap: '12@ms'
  },

  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: '12@ms',
    padding: '16@ms',
  },

  itemIconContainer: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '20@ms',
    backgroundColor: palette.main[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '12@ms'
  },

  itemContent: {
    flex: 1,
    gap: '6@ms',
    justifyContent: 'center'
  },

  title: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.grey[900],
    marginBottom: '2@ms'
  },

  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms'
  },
  
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms'
  },

  teacher: {
    fontSize: '13@ms',
    fontWeight: '500',
    color: palette.grey[600]
  },

  date: {
    fontSize: '12@ms',
    fontWeight: '500',
    color: palette.grey[500]
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '60@ms',
    gap: '12@ms'
  },

  emptyText: {
    fontSize: '15@ms',
    fontWeight: '500',
    color: palette.grey[500]
  }
})
