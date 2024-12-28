import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HeaderCustomer from './HeaderCustomer';
import MyTabs from './MaterialTop_Tab';

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
      <MyTabs />
    </>
  );
};

export default StackNavigator;
