import React, { useState, useCallback, useRef } from 'react'
import { View, Alert, ScrollView, TouchableOpacity, Text, ActivityIndicator, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation, useRoute, useFocusEffect, CommonActions } from '@react-navigation/native'
import { Routes } from '@/navigators/RouteName'
import { palette } from '@/theme'
import { toast, getMessageFromError } from '@/utils/helpers'
import Navbar from '../components/Navbar'
import EmptyState from '../components/EmptyState'
import LinkedAccountList from '../components/LinkedAccountList'
import { getLinkedAccountsApi, deleteLinkApi, syncAccountLinksApi } from '../apiClients'
import useAuthStore from '@/store/useAuthStore'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'

const ParentList = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const user = useAuthStore((state) => state.user)
  const parentViewMode = useAuthStore((state) => state.parentViewMode)
  const setUserCustom = useAuthStore((state) => state.setUserCustom)
  const linkedStudents = useAuthStore((state) => state.linkedStudents)

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
      await useAuthStore.getState().syncParentLinkedStudents()
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.message !== 'canceled') {
        toast.error(getMessageFromError(t, error))
      }
    } finally {
      setSyncing(false)
    }
  }

  const handleCtaPress = () => {
    navigation.navigate(Routes.Auth.ParentLinkRequest)
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
              if (linkedStudents?.length === 1) {
                if (user) {
                  await setUserCustom(user)
                }
              } else if (user && parentViewMode?.linkId === id) {
                await setUserCustom(user)
                try {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: Routes.Auth.MainTabs,
                          state: {
                            routes: [{ name: Routes.Auth.Home, params: { refreshKey: Date.now() } }],
                          },
                        },
                      ],
                    })
                  )
                } catch (e) {
                  console.log(e)
                }
              }
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
        title={t('my_child')}
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
          <LinkedAccountList accounts={accounts} onUnlink={handleUnlink} isParentView />
        ) : (
          /* Nếu không có bản ghi nào: Hiển thị EmptyState */
          <EmptyState
            title={t('no_linked_child')}
            description={t('link_child_desc')}
            instructionTitle={t('how_to')}
            steps={[
              t('link_step_1_parent'),
              t('link_step_2_parent'),
              t('link_step_3_parent')
            ]}
          />
        )}
      </ScrollView>

      {/* Nút bấm CTA nổi bên ngoài màn hình danh sách */}
      <View style={styles.ctaWrapper}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleCtaPress} activeOpacity={0.85}>
          <Ionicons name="link-outline" size={20} color="#FFF" style={styles.ctaIcon} />
          <Text style={styles.ctaText}>{t('link_child_account')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ParentList

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
