import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Follow_maintenance  from "../Admin/Follow_maintenance "
import Maintenance from "../Admin/Maintenance"
import { View } from 'react-native';
const Tab = createMaterialTopTabNavigator();

function MyTabs_maintenance() {
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
        name="Maintenance"
        component={Maintenance}
        options={{ tabBarLabel: 'Lịch bảo trì' }}
      />
      <Tab.Screen
        name="Customer"
        component={Follow_maintenance}
        options={{ tabBarLabel: 'Lịch sử bảo trì' }}
      />
     
    </Tab.Navigator>
    </View>
  );
}

export default MyTabs_maintenance;
