import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Problem from "../Admin/Problem"
import Follow_problem from "./Follow_problem"
import { View } from 'react-native';
const Tab = createMaterialTopTabNavigator();

function MyTabs() {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { 
          fontSize: 16, 
          fontWeight: 'bold',
          
      },
      tabBarStyle: { 
          backgroundColor: '#f1f1f1', 
          marginTop: 20, 
          borderRadius: 35, 
          width: 360, 
          alignSelf: 'center',  
          elevation: 5          
      },
      tabBarIndicatorStyle: { 
          backgroundColor: '#00B2EE', 
          height: '100%', 
          borderRadius: 20
          
      },
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#808080',
      
      }}
    >
      <Tab.Screen
        name="Problem"
        component={Problem}
        options={{ tabBarLabel: 'Danh sách hỏng' }}
      />
      <Tab.Screen
        name="Follow_problem"
        component={Follow_problem}
        options={{ tabBarLabel: 'Đang sửa chữa' }}
      />
    </Tab.Navigator>
    </View>
  );
}

export default MyTabs;
