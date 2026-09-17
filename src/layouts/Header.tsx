import useAuthStore from '@/store/useAuthStore'
import { palette, TYPO } from '@/theme'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity, Platform, useWindowDimensions, ActivityIndicator } from 'react-native'
import { Menu, Avatar, TouchableRipple } from 'react-native-paper'
import { ScaledSheet } from 'react-native-size-matters'
import ArrowDown from '@/assets/iconJSX/arrowDown'
import Alarm from '@/assets/iconJSX/alarm'
import Notice from '@/containers/Notice/view'
import SignOut from '@/assets/iconJSX/signOut'
import { Ionicons } from '@expo/vector-icons'
import HeaderAction from './components/HeaderAction'
import { getUserAcademies } from './apiClients/academyServices'
import { AcademyResponse } from '@/utils/types'
import { getCurrentRole, getErrorMessage, toast } from '@/utils/helpers'
import { Fragment, useEffect, useState } from 'react'

type Props = {
  headerProps: any
}

const Header = ({ headerProps }: Props) => {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()
  const [loading, setLoading] = useState(false)
  const user = useAuthStore(state => state.user)
  const academies = useAuthStore(state => state.academies)
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const parentViewMode = useAuthStore(state => state.parentViewMode)
  const isParentMode = !!parentViewMode?.isActive
  const canShowNotice = isParentMode ? !!parentViewMode?.linkId : !!user?.academyDomain
  const setAcademies = useAuthStore(state => state.setAcademies)
  const logout = useAuthStore(state => state.logout)
  const {
    academyMenuVisible,
    openNoticeDialog,
    handleCloseNoticeDialog,
    handleOpenNoticeDialog,
    closeAcademyMenu,
    openAcademyMenu,
    handleSwitchAcademy
  } = headerProps

  const getAcademies = async () => {
    if (!user) return
    setLoading(true)
    try {
      const userRole = getCurrentRole(user.roles)
      const res = await getUserAcademies(userRole, user.isLearningSpace)
      const items: AcademyResponse[] = res.data.items || []
      setAcademies(items)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (academyMenuVisible) {
      getAcademies()
    }
  }, [academyMenuVisible])

  return (
    <View>
      <View style={[styles.header]}>
        <>
          <Menu
            visible={academyMenuVisible}
            onDismiss={closeAcademyMenu}
            anchorPosition="bottom"
            anchor={
              <TouchableOpacity
                onPress={openAcademyMenu}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ padding: 0, margin: 0, width: width * 0.55 }}
              >
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 6, width: '100%' }}>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontSize: 20, fontWeight: 700, color: '#FFF' }}>
                      {selectedAcademy ? selectedAcademy?.name || t('my_study_space') : t('my_study_space')}
                    </Text>
                    {isParentMode ? (
                     <>
                     {parentViewMode?.linkId && (
                      <View style={styles.studentBadgeWrapper}>
                        <View style={styles.studentBadgePill}>
                          <Ionicons name="person" size={11} color="#FFE082" />
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={styles.studentBadgeText}
                          >
                            {`${t('student')}: ${parentViewMode?.studentName || ''}`}
                          </Text>
                        </View>
                      </View>
                     )}
                     </>
                    ) : (
                      <View style={{ flexDirection: 'row', gap: 3, flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFFCC' }}>
                          {t('number_grade', { number: user?.grade })}
                        </Text>
                        <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: 500, color: '#FFF', flexShrink: 1 }}>{user?.classes?.join(',')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowDown />
                  </View>
                </View>
              </TouchableOpacity>
            }
            contentStyle={{
              backgroundColor: '#F9F9F9',
              paddingVertical: 4,
              borderRadius: 12,
              overflow: 'hidden',
              minWidth: 250,
              top: Platform.OS === 'ios' ? -50 : 10
            }}
          >

            {loading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="small" color={palette.main[500]} />
              </View>
            ) : (
              <Fragment>

                <TouchableRipple
                  onPress={() => {
                    closeAcademyMenu()
                    handleSwitchAcademy(true, undefined, false)
                  }}
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: '#E0E0E0',
                    borderBottomWidth: 1
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      backgroundColor: !selectedAcademy?.domain ? palette.main[500] : '#FFF'
                    }}
                  >
                    <Avatar.Image
                      size={36}
                      style={{ backgroundColor: '#fff', marginRight: 10 }}
                      source={{ uri: user?.avatar }}
                    />
                    <Text style={{ color: !selectedAcademy?.domain ? '#FFF' : '#000', fontWeight: '600' }}>
                      {t('my_study_space')}
                    </Text>
                  </View>
                </TouchableRipple>
                {academies.map((academy, index) => (
                  <TouchableRipple
                    key={index}
                    onPress={() => {
                      closeAcademyMenu()
                      handleSwitchAcademy(false, academy)
                    }}
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        backgroundColor: selectedAcademy?.domain === academy.domain ? palette.main[500] : '#FFF',
                        borderColor: '#E0E0E0',
                        borderBottomWidth: 1
                      }}
                    >
                      <Avatar.Image
                        size={36}
                        style={{ backgroundColor: '#fff', marginRight: 10 }}
                        source={{ uri: academy?.image }}
                      />
                      <Text
                        style={{
                          color: selectedAcademy?.domain === academy.domain ? '#FFF' : '#000',
                          flex: 1
                        }}
                      >
                        {academy.name}
                      </Text>
                    </View>
                  </TouchableRipple>
                ))}
              </Fragment>
            )
            }
            <TouchableRipple
              onPress={logout}
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                borderColor: '#E0E0E0'
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  gap: 8
                }}
              >
                <SignOut />
                <Text style={{ color: palette.grey[900], fontWeight: '600' }}>{t('logout')}</Text>
              </View>
            </TouchableRipple>
          </Menu>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {canShowNotice && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleOpenNoticeDialog()}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Alarm />
              </TouchableOpacity>
            )}

            <HeaderAction />

          </View>
        </>
      </View>
      {canShowNotice && <Notice open={openNoticeDialog} onClose={handleCloseNoticeDialog} />}
    </View>
  )
}

export default Header

const styles = ScaledSheet.create({
  header: {
    backgroundColor: palette.main[600],
    paddingTop: '8@ms',
    paddingBottom: '24@ms',
    paddingHorizontal: '16@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoText: {
    ...TYPO.heading2
  },
  headerTitle: {
    ...TYPO.heading2,
    color: palette.grey[900]
  },
  studentBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '6@ms'
  },
  studentBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: '8@ms',
    paddingVertical: '3@ms',
    borderRadius: '12@ms',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@ms',
    borderWidth: '1@ms',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    maxWidth: '100%'
  },
  studentBadgeText: {
    fontSize: '11@ms',
    fontWeight: '700',
    color: '#FFF',
    flexShrink: 1
  },
  actionButton: {
    width: '40@ms',
    height: '40@ms',
    alignItems: 'center',
    justifyContent: 'center',
  }
})
