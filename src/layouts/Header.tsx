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
import { ParentLinkResponse } from '@/containers/AccountLinking/apiClients'
import { Role } from '@/utils/enums'
import { getErrorMessage, toast } from '@/utils/helpers'
import { Fragment, useEffect, useState, useMemo } from 'react'

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
      const res = await getUserAcademies()
      const items: AcademyResponse[] = res.data.items || []
      setAcademies(items)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoading(false)
    }
  }

  const academyDropdownItems = useMemo(() => {
    const items: Array<{
      key: string
      academy: AcademyResponse
      role: Role
      child?: ParentLinkResponse | null
    }> = []

    const sortedAcademies = [...academies].sort((a, b) => {
      const aEmpty = !a.domain
      const bEmpty = !b.domain
      if (aEmpty && !bEmpty) return -1
      if (!aEmpty && bEmpty) return 1
      return 0
    })

    sortedAcademies.forEach((academy) => {
      const roles = (academy.roles || []).map((r) => r.toLowerCase())
      const hasStudentRole = roles.includes('student') || roles.length === 0
      const hasParentRole = roles.includes('parent')

      if (hasStudentRole) {
        items.push({
          key: `${academy.id}-student`,
          academy,
          role: Role.Student,
          child: null
        })
      }

      if (hasParentRole) {
        if (academy.children && academy.children.length > 0) {
          academy.children.forEach((child) => {
            items.push({
              key: `${academy.id}-parent-${child.id}`,
              academy,
              role: Role.Parent,
              child
            })
          })
        } else {
          items.push({
            key: `${academy.id}-parent`,
            academy,
            role: Role.Parent,
            child: null
          })
        }
      }
    })

    return items
  }, [academies])

  const getAcademyItemName = (item: {
    academy: AcademyResponse
    role: Role
    child?: ParentLinkResponse | null
  }) => {
    if (!item.academy.domain) {
      return item.child ? t('study_space') : t('my_study_space')
    }
    return item.academy.name
  }

  const headerAcademyTitle = useMemo(() => {
    const isSpaceStudy = !selectedAcademy?.domain
    if (isSpaceStudy) {
      return isParentMode && parentViewMode?.linkId ? t('study_space') : t('my_study_space')
    }
    return selectedAcademy?.name
  }, [selectedAcademy, isParentMode, t])

  const isItemSelected = (item: {
    academy: AcademyResponse
    role: Role
    child?: ParentLinkResponse | null
  }) => {
    const isCurrentSpace = !selectedAcademy?.domain
    const isItemSpace = !item.academy.domain

    if (isCurrentSpace !== isItemSpace) {
      return false
    }

    if (!isCurrentSpace && selectedAcademy?.domain !== item.academy.domain) {
      return false
    }

    if (isParentMode) {
      if (item.role !== Role.Parent) return false
      if (item.child) {
        return Boolean(
          parentViewMode?.studentSuperId &&
          item.child.studentSuperId === parentViewMode.studentSuperId
        )
      }
      return !parentViewMode?.studentSuperId
    }

    return item.role === Role.Student
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
                      {headerAcademyTitle}
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
                {academyDropdownItems.map((item) => {
                  const selected = isItemSelected(item)
                  return (
                    <TouchableRipple
                      key={item.key}
                      onPress={() => {
                        closeAcademyMenu()
                        handleSwitchAcademy(!item.academy?.domain, item.academy, true, item.role, item.child)
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
                          backgroundColor: selected ? palette.main[500] : '#FFF',
                          borderColor: '#E0E0E0',
                          borderBottomWidth: 1
                        }}
                      >
                        <Avatar.Image
                          size={36}
                          style={{ backgroundColor: '#fff', marginRight: 10 }}
                          source={{ uri: item.academy?.image || (item.child?.studentAvatar || user?.avatar) }}
                        />
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Text
                            numberOfLines={1}
                            style={{
                              color: selected ? '#FFF' : '#000',
                              fontWeight: selected ? '700' : '500',
                              flex: 1,
                              marginRight: 8
                            }}
                          >
                            {getAcademyItemName(item)}
                          </Text>
                          {Boolean(item.child?.studentName) && (
                            <View
                              style={{
                                backgroundColor: selected ? '#FFFFFF' : '#3B1E78',
                                paddingHorizontal: 7,
                                paddingVertical: 3,
                                borderRadius: 4,
                                marginLeft: 8,
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              <Text
                                numberOfLines={1}
                                style={{
                                  color: selected ? '#3B1E78' : '#FFFFFF',
                                  fontSize: 11,
                                  fontWeight: '700'
                                }}
                              >
                                {item.child?.studentName}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableRipple>
                  )
                })}
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
