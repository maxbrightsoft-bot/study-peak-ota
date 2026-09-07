import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { palette } from '@/theme'
import { Routes } from '@/navigators/RouteName'
import Navbar from '../components/Navbar'
import useAuthStore from '@/store/useAuthStore'
import { Role } from '@/utils/enums'
import GoogleIcon from '@/assets/iconJSX/google'

import useAccountLinkingStore from '@/store/useAccountLinkingStore'

const RoleSelection = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const user = useAuthStore((state) => state.user)

  const storeSelectedRole = useAccountLinkingStore((state) => state.selectedRole)
  const setStoreSelectedRole = useAccountLinkingStore((state) => state.setSelectedRole)

  // Mặc định lấy từ Zustand store hoặc Role.Student
  const [selectedRole, setSelectedRole] = useState<Role>(storeSelectedRole || Role.Student)

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role)
    setStoreSelectedRole(role)
  }

  const handleStartLinking = () => {
    setStoreSelectedRole(selectedRole)
    if (selectedRole === Role.Student) {
      navigation.replace(Routes.Auth.StudentLinkShare)
    } else {
      navigation.replace(Routes.Auth.ParentLinkRequest)
    }
  }

  const displayName = user?.fullName || '김피크'
  const displayEmail = user?.email || 'peak@gmail.com'

  return (
    <View style={styles.container}>
      <Navbar title={t('link_parent_account')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Thông tin tài khoản người dùng */}
        <View style={styles.profileSection}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>{displayName}</Text>
          </View>

          <View style={styles.emailRow}>
            <View style={{ marginRight: 6 }}>
              <GoogleIcon width={14} height={14} />
            </View>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>
        </View>

        {/* Thẻ chọn vai trò (Role Card Selection) */}
        <View style={styles.roleCard}>
          {/* Lựa chọn Học sinh */}
          <TouchableOpacity
            style={styles.roleItem}
            activeOpacity={0.8}
            onPress={() => handleSelectRole(Role.Student)}
          >
            <View style={[styles.checkbox, selectedRole === Role.Student && styles.checkboxActive]}>
              {selectedRole === Role.Student && (
                <Ionicons name="checkmark" size={18} color="#C0392B" style={styles.checkmarkIcon} />
              )}
            </View>
            <Text style={styles.roleText}>
              {t('app_is_for_student')}
            </Text>
          </TouchableOpacity>

          {/* Đường gạch ngang phân cách */}
          <View style={styles.divider} />

          {/* Lựa chọn Phụ huynh */}
          <TouchableOpacity
            style={styles.roleItem}
            activeOpacity={0.8}
            onPress={() => handleSelectRole(Role.Parent)}
          >
            <View style={[styles.checkbox, selectedRole === Role.Parent && styles.checkboxActive]}>
              {selectedRole === Role.Parent && (
                <Ionicons name="checkmark" size={18} color="#C0392B" style={styles.checkmarkIcon} />
              )}
            </View>
            <Text style={styles.roleText}>
              {t('app_is_for_parent')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Nút bắt đầu liên kết ở cuối trang */}
      <View style={styles.ctaWrapper}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStartLinking}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {t('start_linking')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default RoleSelection

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB'
  },
  scrollContent: {
    paddingHorizontal: '24@ms',
    paddingTop: '32@ms',
    paddingBottom: '100@ms'
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: '32@ms'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '8@ms'
  },
  profileName: {
    fontSize: '22@ms',
    fontWeight: '800',
    color: palette.grey[900],
    marginRight: '6@ms'
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileEmail: {
    fontSize: '14@ms',
    color: palette.grey[600],
    marginRight: '6@ms'
  },
  editIcon: {
    padding: '2@ms'
  },
  roleCard: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden'
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '20@ms',
    paddingHorizontal: '20@ms'
  },
  checkbox: {
    width: '24@ms',
    height: '24@ms',
    borderRadius: '4@ms',
    borderWidth: 2,
    borderColor: '#7F8C8D',
    marginRight: '16@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  checkboxActive: {
    borderColor: '#2C3E50',
    backgroundColor: '#FFF'
  },
  checkmarkIcon: {
    fontWeight: '900'
  },
  roleText: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: '20@ms'
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: '24@ms',
    paddingBottom: '28@ms',
    paddingTop: '10@ms',
    backgroundColor: '#F8F9FA'
  },
  ctaButton: {
    height: '50@ms',
    borderRadius: '14@ms',
    backgroundColor: '#5F30AA', // brand purple
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaText: {
    color: '#FFF',
    fontSize: '15@ms',
    fontWeight: '700'
  }
})
