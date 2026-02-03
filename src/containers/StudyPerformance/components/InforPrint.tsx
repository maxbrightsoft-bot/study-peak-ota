import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useAuthStore from '@/store/useAuthStore';
import { StudentInfo } from '@/utils/types';

interface Props {
  studentInfo?: StudentInfo;
}

const InforPrint: FC<Props> = ({ studentInfo }) => {
  const { user, selectedAcademy } = useAuthStore()
  const existUser = studentInfo ?? user

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {existUser?.fullName}
          </Text>
          <Text style={styles.studentEmail}>
            {existUser?.email}
          </Text>
        </View>

        <View style={styles.academyInfo}>
          <Text style={[styles.studentName, styles.textRight]}>
            {selectedAcademy?.name}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
  },
  studentInfo: {
    flex: 1,
    marginRight: 8,
  },
  academyInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 28,
  },
  studentEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    lineHeight: 24,
    marginTop: 2,
  },
  textRight: {
    textAlign: 'right',
  },
});

export default InforPrint;