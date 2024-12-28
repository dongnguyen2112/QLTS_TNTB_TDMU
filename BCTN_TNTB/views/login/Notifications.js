import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform, AppState } from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Cấu hình kênh thông báo cho Android
async function setNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

// Thiết lập thông báo handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Lấy Expo Push Token
export const getExpoPushToken = async () => {
  let token;

  // Thiết lập kênh thông báo cho Android
  await setNotificationChannel();

  // Kiểm tra xem có phải đang chạy trên thiết bị vật lý không
  if (Device.isDevice) {
    // Yêu cầu quyền thông báo
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return null;
    }

    try {
      // Lấy Expo Push Token
      const { data } = await Notifications.getExpoPushTokenAsync({
        projectId: 'db9a0d71-5fec-4dae-96af-635f58858de6', 
      });
      console.log('Expo Push Token:', data);
      return data; // Trả về token
    } catch (error) {
      console.error('Lỗi lấy Expo Push Token', error);
      return null;
    }
  } else {
    Alert.alert('Must use physical device for Push Notifications');
    return null;
  }
};

