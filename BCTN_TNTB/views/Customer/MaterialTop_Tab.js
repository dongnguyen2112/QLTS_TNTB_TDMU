import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AppoitmentCustomer_a from './AppoitmentCustomer';
import ProgressPageCustomer_a from './ProgressPageCustomer';
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
          backgroundColor: '#1E90FF', 
          height: '100%', 
          borderRadius: 20
          
      },
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#808080',
      
      }}
    >
      <Tab.Screen
        name="AppoitmentCustomer"
        component={AppoitmentCustomer_a}
        options={{ tabBarLabel: 'Theo dõi sự cố' }}
      />
      <Tab.Screen
        name="ProgressPageCustomer"
        component={ProgressPageCustomer_a}
        options={{ tabBarLabel: 'Chờ nghiệm thu' }}
      />
    </Tab.Navigator>
    </View>
  );
}

export default MyTabs;
