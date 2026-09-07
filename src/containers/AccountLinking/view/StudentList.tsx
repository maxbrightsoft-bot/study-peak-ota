import React, { useState, useCallback, useRef } from 'react'
import { View, Alert, ScrollView, TouchableOpacity, Text, ActivityIndicator, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { Routes } from '@/navigators/RouteName'
import { palette } from '@/theme'
import { toast, getMessageFromError } from '@/utils/helpers'
import Navbar from '../components/Navbar'
import EmptyState from '../components/EmptyState'
import LinkedAccountList from '../components/LinkedAccountList'
import { getLinkedAccountsApi, deleteLinkApi, AccountLinkResponse, syncAccountLinksApi } from '../apiClients'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'

const StudentList = () => {
  const { t } = useTranslation()
  const { navigate } = useNavigation<any>()
  const route = useRoute<any>()
  const accounts = useAccountLinkingStore((state) => state.linkedAccounts)
  const setLinkedAccounts = useAccountLinkingStore((state) => state.setLinkedAccounts)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const preventFirstFetch = route.params?.preventFirstFetch
  const isFirstMount = useRef(!!preventFirstFetch)

  const fetchLinkedAccounts = useCallback(async (isRefresh = false, signal?: AbortSignal) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const response = await getLinkedAccountsApi(signal)
      const data = response.data?.data
      
      if (Array.isArray(data)) {
        setLinkedAccounts(data)
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError' && error.message !== 'canceled') {
        toast.error(getMessageFromError(t, error))
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController()
      if (isFirstMount.current) {
        isFirstMount.current = false
        return () => controller.abort()
      }
      fetchLinkedAccounts(false, controller.signal)
      return () => controller.abort()
    }, [fetchLinkedAccounts])
  )

  const onRefresh = useCallback(() => {
    fetchLinkedAccounts(true)
  }, [fetchLinkedAccounts])

  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    if (syncing) return
    setSyncing(true)
    try {
      await syncAccountLinksApi({ isAll: true })
      toast.success(t('sync_success'))

      await fetchLinkedAccounts(true)
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.message !== 'canceled') {
        toast.error(getMessageFromError(t, error))
      }
    } finally {
      setSyncing(false)
    }
  }

  const handleCtaPress = () => {
    navigate(Routes.Auth.StudentLinkShare)
  }

  const handleUnlink = (id: number) => {
    Alert.alert(
      t('confirm_unlink'),
      t('confirm_unlink_desc'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('unlink'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLinkApi(id)
              setLinkedAccounts(accounts.filter((acc) => acc.id !== id))
              toast.success(t('unlink_success'))
            } catch (error: any) {
              toast.error(getMessageFromError(t, error))
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      {/* Navbar dùng chung */}
      <Navbar
        title={t('family_linking')}
        rightAction={
          <TouchableOpacity
            onPress={handleSync}
            disabled={syncing}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={palette.main[600] || '#5F30AA'} />
            ) : (
              <Ionicons name="sync-outline" size={22} color={palette.grey[900] || '#171719'} />
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[palette.main[600] || '#5F30AA']}
            tintColor={palette.main[600] || '#5F30AA'}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={palette.main[600] || '#5F30AA'} />
          </View>
        ) : accounts.length > 0 ? (
          /* Nếu có ít nhất 1 bản ghi: Hiển thị danh sách */
          <LinkedAccountList
            accounts={accounts}
            onUnlink={handleUnlink}
          />
        ) : (
          /* Nếu không có bản ghi nào: Hiển thị EmptyState */
          <EmptyState
            title={t('no_linked_parent')}
            description={t('link_parent_desc')}
            instructionTitle={t('how_to_link_student')}
            steps={[
              t('link_step_1_student'),
              t('link_step_2_student'),
              t('link_step_3_student')
            ]}
          />
        )}
      </ScrollView>

      {/* Nút bấm CTA nổi bên ngoài màn hình danh sách */}
      <View style={styles.ctaWrapper}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleCtaPress} activeOpacity={0.85}>
          <Ionicons name="key-outline" size={20} color="#FFF" style={styles.ctaIcon} />
          <Text style={styles.ctaText}>{t('generate_link_code')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default StudentList

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB'
  },
  scrollContent: {
    padding: '20@ms',
    paddingBottom: '100@ms'
  },
  loadingWrapper: {
    paddingTop: '60@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: '20@ms',
    paddingBottom: '28@ms',
    paddingTop: '10@ms',
    backgroundColor: 'transparent'
  },
  ctaButton: {
    height: '54@ms',
    borderRadius: '14@ms',
    backgroundColor: palette.main[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: palette.main[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6
  },
  ctaIcon: {
    marginRight: '8@ms'
  },
  ctaText: {
    color: '#FFF',
    fontSize: '16@ms',
    fontWeight: '700'
  }
})
