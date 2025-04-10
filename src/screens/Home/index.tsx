import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4CD964" barStyle="light-content" />
      
      {/* Top Green Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>QE</Text>
          </View>
          <Text style={styles.headerTitle}>생각의 지도 학원</Text>
        </View>
        <View style={styles.profileCircle}>
          <Ionicons name="person-outline" size={20} color="#4CD964" />
        </View>
      </View>
      
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>안녕하세요, 박정수님!</Text>
        
        <View style={styles.statsContainer}>
          <View>
            <Text style={styles.statsLabel}>총 포인트 수</Text>
            <Text style={styles.statsValue}>30개</Text>
          </View>
          
          <View>
            <Text style={styles.statsLabel}>실천한 스케줄</Text>
            <Text style={styles.statsValue}>24개</Text>
          </View>
        </View>
        
        {/* Start Task Button */}
        <TouchableOpacity style={styles.startButton}>
          <MaterialIcons name="play-arrow" size={20} color="white" />
          <Text style={styles.startButtonText}>시험 시작하기</Text>
        </TouchableOpacity>
        
        {/* Question Bank Link */}
        <View style={styles.linkContainer}>
          <View style={styles.linkLeft}>
            <Ionicons name="location-outline" size={16} color="#777" />
            <Text style={styles.linkText}>문제집 이야 풀기</Text>
          </View>
          
          <Text style={styles.viewAllText}>전체 보기</Text>
        </View>
      </View>
      
      {/* Workbooks Section */}
      <ScrollView style={styles.scrollContainer}>
        {/* Workbook Item */}
        {[1, 2].map((item, index) => (
          <View key={index} style={styles.workbookItem}>
            {/* <Image 
              source={require('./assets/placeholder.png')}
              style={styles.workbookImage}
              defaultSource={require('./assets/placeholder.png')}
            /> */}
            <View style={styles.workbookContent}>
              <Text style={styles.workbookTitle}>2024년 고급 4월 학평(경기)</Text>
              <Text style={styles.workbookTime}>14시간 전</Text>
              <View style={styles.workbookFooter}>
                <Text style={styles.workbookDate}>2024년 6월 7일</Text>
                <Text style={styles.workbookProgress}>진행도 38%</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Bottom Tab Bar */}
    
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CD964',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#4CD964',
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsLabel: {
    color: '#777',
    fontSize: 12,
    marginBottom: 5,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#4CD964',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#777',
    marginLeft: 5,
  },
  viewAllText: {
    color: '#777',
  },
  scrollContainer: {
    marginHorizontal: 16,
  },
  workbookItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  workbookImage: {
    width: 70,
    height: 90,
    borderRadius: 4,
    marginRight: 12,
  },
  workbookContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  workbookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  workbookTime: {
    fontSize: 12,
    color: '#777',
  },
  workbookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workbookDate: {
    fontSize: 12,
    color: '#777',
  },
  workbookProgress: {
    fontSize: 12,
    color: '#4CD964',
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 10,
    color: '#999',
  },
  activeTabText: {
    fontSize: 10,
    color: '#4CD964',
  },
});

export default App;