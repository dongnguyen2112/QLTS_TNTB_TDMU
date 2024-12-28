import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { SEND_EMAIL_URL } from '@env';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/FontAwesome'; // Add this for the back arrow icon

const BookingAsset = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { assetData } = route.params; // Receiving assetData from QRCodeScanScreen or assets
  const [bookingDate, setBookingDate] = useState(new Date());
  const [bookingTime, setBookingTime] = useState('');
  const [priority, setPriority] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [roomInfoState, setRoomInfoState] = useState(''); // Store room information

  // Effect to fetch current user and room information
  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setCurrentTime(formattedTime);

    const fetchUserQRCodeValue = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          const userDoc = await firestore().collection('user').doc(currentUser.uid).get();
          if (userDoc.exists) {
            const { qrCodeValue } = userDoc.data();
            setRoomInfoState(qrCodeValue || 'Không có thông tin phòng');
          } else {
            setRoomInfoState('Không có thông tin phòng');
          }
        }
      } catch (error) {
        console.error('Error fetching user qrCodeValue: ', error);
        setRoomInfoState('Không có thông tin phòng');
      }
    };

    fetchUserQRCodeValue();
  }, []);
  const generateRandomId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
  // Function to handle saving booking
  const handleSaveBooking = async () => {
    if (!bookingTime.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả sự cố');
      return;
    }

    if (!priority.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn mức độ ưu tiên');
      return;
    }

    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore().collection('user').doc(currentUser.uid).get();
        if (!userDoc.exists) {
          Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
          return;
        }
        const randomProblemCode = generateRandomId();
        const { teacherId, name } = userDoc.data();
        const formattedDate = formatBookingDate(bookingDate); // Corrected here, use bookingDate
        await firestore().collection('bookings').add({
          problemCode: randomProblemCode, 
          assetName: assetData.assetName,
          imageUrl: assetData.imageUrl,
          bookingDate: formattedDate,
          bookingTime,
          qrCodeValue: assetData.position,
          priority,
          currentTime,
          name,
          teacherId,
          assetCode: assetData.assetCode,
          status: 'Đang xử lý',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
          // Gửi email báo cáo
        //   await fetch('http://192.168.2.8:3001/send-email', {
        //     method: 'POST',
        //     headers: {
        //     'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //     to: 'dongnguyen1589@gmail.com',
        //     subject: 'Báo cáo sự cố mới',
        //     text: `Báo cáo sự cố từ ${name} tài sản ${assetData.assetName} có mã tài sản là ${assetData.assetCode} bị sự cố ${bookingTime} vị trí của tài sản là ${assetData.position}.\nSự cố được ghi nhận vào ${formattedDate} ${currentTime}`,

        //     }),
        // });
        Alert.alert('Thông báo', 'Báo cáo sự cố thành công!');
        navigation.navigate('TabCustomer','AppoitmentCustomer');
      } else {
        Alert.alert('Lỗi', 'Người dùng chưa đăng nhập');
      }
    } catch (error) {
      Alert.alert('Thông báo', 'Báo cáo sự cố thất bại. Vui lòng thử lại sau!');
    }
  };

  // Function to format booking date
  const formatBookingDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };



  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
  
      {assetData.imageUrl && <Image source={{ uri: assetData.imageUrl }} style={styles.image} />}
  
      <View style={styles.formContainer}>
        {/* Tên thiết bị */}
        <View style={styles.row}>
          <Text style={styles.text}>Tên thiết bị</Text>
          <Text style={styles.formText}>{assetData.assetName}</Text>
        </View>
  
        {/* Ngày hiện tại */}
        <View style={styles.row}>
          <Text style={styles.text}>Ngày hiện tại</Text>
          <Text style={styles.formText}>{formatBookingDate(bookingDate) || 'Chọn ngày'}</Text>
        </View>
  
        {/* Thời gian */}
        <View style={styles.row}>
          <Text style={styles.text}>Thời gian</Text>
          <Text style={styles.formText}>{currentTime || 'Thời gian hiện tại'}</Text>
        </View>
  
        {/* Vị trí */}
        <View style={styles.row}>
          <Text style={styles.text}>Vị trí</Text>
          <Text style={styles.formText}>{assetData.position || 'Phòng'}</Text>
        </View>
      </View>
  
      {/* Mô tả sự cố */}
      <TextInput
        style={styles.input}
        placeholder="Mô tả sự cố"
        value={bookingTime}
        onChangeText={setBookingTime}
      />
  
      {/* Mức độ ưu tiên */}
      <RNPickerSelect
        style={pickerStyles}
        placeholder={{ label: 'Chọn mức độ ưu tiên', value: null }}
        value={priority}
        onValueChange={setPriority}
        items={[
          { label: 'Cao', value: 'Cao' },
          { label: 'Trung bình', value: 'Trung bình' },
          { label: 'Thấp', value: 'Thấp' },
        ]}
      />
  
      {/* Nút báo cáo sự cố */}
      <TouchableOpacity style={styles.button} onPress={handleSaveBooking}>
        <Text style={styles.buttonText}>Báo cáo sự cố</Text>
      </TouchableOpacity>
    </View>
  );
}
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    backButton: {
      marginBottom: 20,
    },
    image: {
      width: '90%',
      height: 150,
      borderRadius: 10,
      marginBottom: 20,
      objectFit:"contain"
    },
    text: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    formContainer: {
      marginBottom: 20,
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      padding: 15,
    },
    row: {
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 10, 
    },
    formText: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1, 
      textAlign: 'right', 
    },
    datePickerButton: {
      marginBottom: 10,
    },
    input: {
      height: 60,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    button: {
      backgroundColor: '#1E90FF',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  
  const pickerStyles = {
    inputIOS: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      paddingHorizontal: 10,
      marginBottom: 20,
    },
  };
  
export default BookingAsset;
