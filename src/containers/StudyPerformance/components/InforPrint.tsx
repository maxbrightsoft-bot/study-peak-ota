import React, { FC } from 'react';
import { View, Text } from 'react-native';
import useAuthStore from '@/store/useAuthStore';
import { StudentInfo } from '@/utils/types';
import { ScaledSheet } from 'react-native-size-matters'

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

const styles = ScaledSheet.create({
  container: {
    marginBottom: '12@ms',
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
    marginRight: '8@ms',
  },
  academyInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  studentName: {
    fontSize: '20@ms',
    fontWeight: '600',
    color: '#000000',
    lineHeight: '28@ms',
  },
  studentEmail: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#6B7280',
    lineHeight: '24@ms',
    marginTop: '2@ms',
  },
  textRight: {
    textAlign: 'right',
  },
});

export default InforPrint;