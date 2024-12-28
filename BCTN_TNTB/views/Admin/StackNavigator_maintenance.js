import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import Header from '../Admin/Header';
import HeaderCustomer from '../Customer/HeaderCustomer';
import MyTabs_maintenance from './../Admin/MaterialTopTab_maintenance';

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HeaderCustomerAndTabs"
        component={MyTabsScreen}
        options={{ headerShown: false }}  // Ẩn header mặc định của Stack
      />
    </Stack.Navigator>
  );
};

const MyTabsScreen = ({ navigation }) => {
  return (
    <>
      <HeaderCustomer navigation={navigation} />
      <MyTabs_maintenance />
    </>
  );
};

export default StackNavigator;
