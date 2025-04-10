// components/CustomTabBar.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

const Footer = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const onRedirect = () => {
      
  }
  return (
    <View style={styles.tabBar}>
    <View style={styles.tabItem}>
      <Ionicons name="home" size={24} color="#4CD964" />
      <Text style={styles.activeTabText}>홈</Text>
    </View>
    
    <View style={styles.tabItem}>
      <Ionicons name="book" size={24} color="#999" />
      <Text style={styles.tabText}>시험</Text>
    </View>
    
    <View style={styles.tabItem}>
      <Ionicons name="receipt" size={24} color="#999" />
      <Text style={styles.tabText}>시험 이력</Text>
    </View>
    
    <View style={styles.tabItem}>
      <Ionicons name="stats-chart" size={24} color="#999" />
      <Text style={styles.tabText}>공부 추이</Text>
    </View>
    
    <View style={styles.tabItem}>
      <Ionicons name="ellipsis-horizontal" size={24} color="#999" />
      <Text style={styles.tabText}>기타</Text>
    </View>
  </View>
  );
};

export default Footer;

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
