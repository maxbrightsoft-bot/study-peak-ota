import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import moment from 'moment'
import { TYPO } from '@/theme'
import { toast, getMessageFromError } from '@/utils/helpers'
import Navbar from '../components/Navbar'
import {
  AccountLinkResponse,
  acceptLinkAccountApi,
  rejectLinkAccountApi,
} from '../apiClients'
import { AccountLinkMethod } from '@/utils/enums'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'
import useAuthStore from '@/store/useAuthStore'

const PendingLinkRequests = () => {
  const { t } = useTranslation()
  const requests = useAccountLinkingStore((state) => state.pendingRequests)
  const fetchWaitingApprovalRequestsApi = useAccountLinkingStore((state) => state.fetchWaitingApprovalRequestsApi)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const user = useAuthStore((state) => state.user)
  const setStudentEmail = useAccountLinkingStore((state) => state.setStudentEmail)
  const clearLinkData = useAccountLinkingStore((state) => state.clearLinkData)

  useEffect(() => {
    setStudentEmail(user!.email, AccountLinkMethod.ShareLink)
    return () => {
      clearLinkData()
    }
  }, [])

  const fetchPendingRequests = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      await fetchWaitingApprovalRequestsApi()
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [fetchWaitingApprovalRequestsApi])

  const handleAccept = async (item: AccountLinkResponse) => {
    try {
      setProcessingId(item.id)
      await acceptLinkAccountApi(item.id)
      toast.success(t('link_completed_student', 'Đã kết nối tài khoản thành công'))
      await fetchWaitingApprovalRequestsApi()
    } catch (error: any) {
      toast.error(getMessageFromError(t, error))
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = (item: AccountLinkResponse) => {
    Alert.alert(
      t('confirm_decline_request', 'Từ chối yêu cầu kết nối?'),
      t('confirm_decline_request_desc', 'Bạn có chắc chắn muốn từ chối yêu cầu kết nối này?'),
      [
        { text: t('no', 'Không'), style: 'cancel' },
        {
          text: t('yes', 'Từ chối'),
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(item.id)
              await rejectLinkAccountApi(item.id)
              toast.success(t('link_request_declined', 'Đã từ chối yêu cầu kết nối'))
              await fetchWaitingApprovalRequestsApi()
            } catch (error: any) {
              toast.error(getMessageFromError(t, error))
            } finally {
              setProcessingId(null)
            }
          },
        },
      ]
    )
  }

  const renderItem = ({ item }: { item: AccountLinkResponse }) => {
    const isProcessing = processingId === item.id
    const timeFormatted = item.createdAt ? moment.utc(item.createdAt).local().fromNow() : ''

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            {item.parentAvatar ? (
              <Image source={{ uri: item.parentAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#5F30AA" />
              </View>
            )}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.parentName} numberOfLines={1}>
              {item.parentName || item.parentEmail || t('parent', 'Phụ huynh')}
            </Text>
            {item.parentEmail && (
              <Text style={styles.parentEmail} numberOfLines={1}>
                {item.parentEmail}
              </Text>
            )}
            {!!timeFormatted && (
              <Text style={styles.timeText}>{timeFormatted}</Text>
            )}
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDecline(item)}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            <Text
              style={styles.declineText}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {t('decline', 'Từ chối')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAccept(item)}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={styles.acceptText}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {t('accept', 'Chấp nhận')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Navbar title={t('pending_link_requests', 'Yêu cầu kết nối')} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#5F30AA" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="mail-open-outline" size={48} color="#999999" />
          </View>
          <Text style={styles.emptyText}>
            {t('no_pending_link_requests', 'Không có yêu cầu kết nối nào đang chờ')}
          </Text>
          <Text style={styles.emptySubText}>
            {t('no_pending_link_requests_desc', 'Khi phụ huynh gửi yêu cầu kết nối, thông tin sẽ xuất hiện tại đây.')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPendingRequests(true)}
              tintColor="#5F30AA"
            />
          }
        />
      )}
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '32@ms',
  },
  listContent: {
    padding: '16@ms',
    gap: '12@ms',
  },
  emptyIconContainer: {
    width: '80@ms',
    height: '80@ms',
    borderRadius: '40@ms',
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16@ms',
  },
  emptyText: {
    ...TYPO.bold16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: '8@ms',
  },
  emptySubText: {
    ...TYPO.regular14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: '20@ms',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12@ms',
    padding: '16@ms',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '14@ms',
  },
  avatarContainer: {
    marginRight: '12@ms',
  },
  avatar: {
    width: '48@ms',
    height: '48@ms',
    borderRadius: '24@ms',
  },
  avatarPlaceholder: {
    width: '48@ms',
    height: '48@ms',
    borderRadius: '24@ms',
    backgroundColor: '#EDE7F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  parentName: {
    ...TYPO.bold16,
    color: '#222222',
    marginBottom: '2@ms',
  },
  parentEmail: {
    ...TYPO.regular13,
    color: '#666666',
    marginBottom: '4@ms',
  },
  timeText: {
    ...TYPO.regular12,
    color: '#999999',
  },
  cardActions: {
    flexDirection: 'row',
    gap: '10@ms',
  },
  actionButton: {
    flex: 1,
    minHeight: '40@ms',
    paddingVertical: '8@ms',
    paddingHorizontal: '8@ms',
    borderRadius: '8@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  declineText: {
    ...TYPO.medium14,
    fontSize: '13@ms',
    color: '#4B5563',
    textAlign: 'center',
    flexShrink: 1,
  },
  acceptButton: {
    backgroundColor: '#5F30AA',
  },
  acceptText: {
    ...TYPO.semiBold14,
    fontSize: '13@ms',
    color: '#FFFFFF',
    textAlign: 'center',
    flexShrink: 1,
  },
})

export default PendingLinkRequests
