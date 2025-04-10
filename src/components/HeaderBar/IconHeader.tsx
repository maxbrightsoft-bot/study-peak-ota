import React from 'react';
import { View, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const IconHeader = () => {
  return (
    <View style={{ height: 100, backgroundColor: '#34C759', paddingTop: StatusBar.currentHeight, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
      <StatusBar backgroundColor="#34C759" barStyle="light-content" />
      <TouchableOpacity onPress={() => console.log('Add')}>
        <Icon name="add-circle" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Clock')}>
        <Icon name="time" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default IconHeader;
