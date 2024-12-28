import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Đăng ký hàm xử lý thông báo trong nền
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Thông báo nhận được khi ứng dụng đang chạy nền:', remoteMessage);
    // Tùy chỉnh xử lý thông báo ở đây nếu cần
});

AppRegistry.registerComponent(appName, () => App);
