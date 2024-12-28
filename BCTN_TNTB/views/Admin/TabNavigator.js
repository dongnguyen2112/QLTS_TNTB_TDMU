import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './Home';
import StackNavigator_AD from './StackNavigator_AD';
import StackNavigator_maintenance from './StackNavigator_maintenance';
import AssetTransfer from './Asset_transfer_customer';
import ProblemScreen from './Problem';
import SettingsScreen from './Settings';
import ProgressPage from './ProgressPage'; 


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = ({ navigation, route }) => {
    const userName = route.params?.userName || "Default Name";

    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#1E90FF',  
            tabBarInactiveTintColor: '#7A8B8B',
            tabBarShowLabel: false,
        }}>
            <Tab.Screen
                name="Trang chủ"
                component={StackNavigator_AD}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home-account" size={35} color={color} />
                    ),
                }}
            />
           
             <Tab.Screen
                name="Bảo trì"
                component={StackNavigator_maintenance}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="hammer-wrench" size={35} color={color} />
                    ),
                }}
            />
             <Tab.Screen
                name="Điều chuyển"
                component={AssetTransfer}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="bank-transfer" size={35} color={color}  />
                    ),
                }}
            />
            <Tab.Screen
                name="Tôi"
                component={SettingsStackScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-cog" size={35} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const HomeStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
);

const TransactionStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Transaction" component={TransactionScreen} />
    </Stack.Navigator>
);

const CustomerStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Problem" component={ProblemScreen} />
        <Stack.Screen name="ProgressPage" component={ProgressPage} />
    </Stack.Navigator>
);

const SettingsStackScreen = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
);

export default TabNavigator;
