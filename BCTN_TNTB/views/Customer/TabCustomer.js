import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, StyleSheet, Platform } from 'react-native';
import ProgressPageCustomer from './ProgressPageCustomer';
import QrScan from './QrScan';
import StackNavigator from './StackNavigator';
import SettingsCustomer from './SettingsCustomer';

const Tab = createBottomTabNavigator();

const TabCustomer = ({ navigation, route }) => {
    const userName = route.params?.userName || "Default Name";

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#1C86EE',
                tabBarInactiveTintColor: '#888',
                tabBarStyle: styles.tabBarStyle,
                tabBarIconStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Theo dõi sự cố"
                component={StackNavigator}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="clipboard-list" size={30} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="QR"
                component={QrScan}
                options={{
                    tabBarIcon: ({ color }) => (
                        <View style={styles.cutoutIcon}>
                            <MaterialCommunityIcons name="qrcode-scan" size={30} color="#FFFFFF" />
                        </View>
                    ),
                    tabBarLabel: () => null, 
                }}
            />

            <Tab.Screen
                name="Tôi"
                component={SettingsCustomer}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons name="account-cog" size={30} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBarStyle: {
        height: 65,
        backgroundColor: 'white',
        borderTopLeftRadius: 39,
        borderTopRightRadius: 39,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 10,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    cutoutIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 35, 
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    cutoutContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 70,
        backgroundColor: 'transparent',
        alignItems: 'center',
        zIndex: 1, 
    },
});


export default TabCustomer;
