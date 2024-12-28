import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from '../views/Admin/TabNavigator';
import Login from '../views/login/Login';
import Register from '../views/login/Register'
import TabCustomer from '../views/Customer/TabCustomer'
import ForgotPassword from "../views/login/ForgotPassword";
import ChangePassword from "../views/Customer/ChangePassword";
import HistoryCustomer from "../views/Customer/HistoryCustomer";
import HomeCustomer from "../views/Customer/HomeCustomer";
import Booking from "../views/Customer/Booking";
import BookingAsset from "../views/Customer/BookingAsset"
import QrScan from "../views/Customer/QrScan";
import AppoitmentCustomer from "../views/Customer/AppoitmentCustomer";
import ProfileCustomer from "../views/Customer/ProfileCustomer"
import Profile from "../views/Admin/Profile";
import ProgressPage from "../views/Admin/ProgressPage";
import Maintenance_Detail from "../views/Admin/Maintenance_Detail"
import History_maintenance from"../views/Admin/History_maintenance"
import Maintenance from "../views/Admin/Maintenance"
import Details_History from"../views/Customer/Details_History"
import Follow_Problem from "../views/Customer/Follow_Problem"
import History_problem from "../views/Admin/History_problem"
import History_transfer from "../views/Admin/History_transfer"
import Detail_transfer_history from"../views/Admin/Detail_transfer_history"
import Form_Problem from "../views/Customer/Form_Problem";
import StackNavigator from "../views/Customer/StackNavigator"

const Stack = createStackNavigator();

export default function RootComponent() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="TabCustomer" component={TabCustomer} />
                <Stack.Screen name="HomeCustomer" component={HomeCustomer} />
                <Stack.Screen name="Booking" component={Booking} />
                <Stack.Screen name="BookingAsset" component={BookingAsset} />
                <Stack.Screen name="QrScan" component={QrScan} />
                <Stack.Screen name="AppoitmentCustomer" component={AppoitmentCustomer} />
                <Stack.Screen name="ProfileCustomer" component={ProfileCustomer} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="Maintenance_Detail" component={Maintenance_Detail} />
                <Stack.Screen name="Maintenance" component={Maintenance} />
                <Stack.Screen name="History_maintenance" component={History_maintenance} />
                <Stack.Screen name="Details_History" component={Details_History} />
                <Stack.Screen name="Follow_Problem" component={Follow_Problem} />
                <Stack.Screen name="History_problem" component={History_problem} />
                <Stack.Screen name="History_transfer" component={History_transfer} />
                <Stack.Screen name="Detail_transfer_history" component={Detail_transfer_history} />
                <Stack.Screen name="ProgressPage" component={ProgressPage} />
                <Stack.Screen name="Form_Problem" component={Form_Problem} />
                <Stack.Screen name="StackNavigator" component={StackNavigator} />
                <Stack.Screen
                name="HistoryCustomer"
                component={HistoryCustomer}
                options={({ navigation }) => ({
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('FilterDate')}
                            style={styles.filterIcon}
                        >
                            <MaterialCommunityIcons name="calendar" size={24} color="black" />
                        </TouchableOpacity>
                    ),
                })}
            />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                <Stack.Screen name="ChangePassword" component={ChangePassword} />
                <Stack.Screen name="Tab" component={TabNavigator} />
                <Stack.Screen name="TabC" component={TabCustomer} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}