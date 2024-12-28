import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, TextInput,ScrollView  } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SEND_EMAIL_URL } from '@env';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import RNPickerSelect from 'react-native-picker-select';

const Booking = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { assetName, imageUrl, assetCode } = route.params; 
    const [bookingDate, setBookingDate] = useState(new Date());
    const [bookingTime, setBookingTime] = useState('');
    const [priority, setPriority] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [roomInfo, setRoomInfo] = useState(''); 

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
                        setRoomInfo(qrCodeValue || 'Không có thông tin phòng');
                    } else {
                        setRoomInfo('Không có thông tin phòng');
                    }
                }
            } catch (error) {
                setRoomInfo('Không có thông tin phòng');
            }
        };

        fetchUserQRCodeValue(); 
    }, []);
    const generateRandomId = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };
    
    const formatBookingDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`;
    };

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
                const formattedDate = formatBookingDate(bookingDate);
                await firestore().collection('bookings').add({
                    problemCode: randomProblemCode, 
                    assetName,
                    imageUrl,
                    bookingDate: formattedDate,
                    bookingTime,
                    qrCodeValue: roomInfo, 
                    priority,
                    currentTime,
                    name,
                    teacherId,
                    assetCode,
                    status: "Đang xử lý",
                    createdAt: firestore.FieldValue.serverTimestamp(),
                                });
                // // Gửi email báo cáo
                // await fetch('http://192.168.2.8:3001/send-email', {
                //     method: 'POST',
                //     headers: {
                //     'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify({
                //     to: 'dongnguyen1589@gmail.com',
                //     subject: 'Báo cáo sự cố mới',
                //     text: `Báo cáo sự cố từ ${name} tài sản ${assetName} có mã tài sản là ${assetCode} bị sự cố ${bookingTime} vị trí của tài sản là ${roomInfo}.\nSự cố được ghi nhận vào ${formattedDate} ${currentTime}`,
                
                //     }),
                // });
                Alert.alert('Thông báo', 'Báo cáo sự cố thành công!');
                navigation.navigate('HomeCustomer');
            } else {
                Alert.alert('Lỗi', 'Người dùng chưa đăng nhập');
            }
        } catch (error) {
            Alert.alert('Thông báo', 'Báo cáo sự cố thất bại. Vui lòng thử lại sau!');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                <Icon name="arrow-left" size={25} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Báo cáo sự cố</Text>
            
            <ScrollView style={styles.container}>
            <View style={styles.imageContainer}>
                {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
            </View>

            {/* Form thông tin */}
            <View style={styles.infoForm}>
                <Text style={styles.infoHeader}>Thông tin</Text>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Mã tài sản:</Text>
                    <Text style={styles.infoText}>{assetCode}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Tài sản:</Text>
                    <Text style={styles.infoText}>{assetName}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Vị trí:</Text>
                    <Text style={styles.infoText}>{roomInfo}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Ngày hiện tại:</Text>
                    <Text style={styles.infoText}>{formatBookingDate(bookingDate)} {currentTime}</Text>
                </View>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Mô tả sự cố"
                value={bookingTime}
                onChangeText={setBookingTime}
            />
            <RNPickerSelect
                style={pickerStyles}
                placeholder={{ label: "Chọn mức độ ưu tiên", value: null }}
                value={priority}
                onValueChange={(value) => setPriority(value)}
                items={[
                    { label: 'Cao', value: 'Cao' },
                    { label: 'Trung bình', value: 'Trung bình' },
                    { label: 'Thấp', value: 'Thấp' },
                ]}
            />

            <TouchableOpacity style={styles.button} onPress={handleSaveBooking}>
                <Text style={styles.buttonText}>Báo cáo</Text>
            </TouchableOpacity>
        </ScrollView>
        </View>
    );
};

const pickerStyles = StyleSheet.create({
    inputIOS: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#00796b',
        borderRadius: 10,
        marginTop: 20,
        fontWeight: 'bold',
        color: '#00796b',
    },
    inputAndroid: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#00796b',
        borderRadius: 10,
        marginTop: 20,
        fontWeight: 'bold',
        color: '#00796b',
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    backButton: {
        marginBottom: 20,
    },
    iconContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: '35%', // Sử dụng tỷ lệ phần trăm để giữ cho hình ảnh linh hoạt
        height: undefined,
        aspectRatio: 1, // Tỷ lệ khung hình 1:1
        borderRadius: 15,
        resizeMode: 'contain',
    },
    infoForm: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoHeader: {
        fontSize: 19,
        fontWeight: '900',
        marginBottom: 10,
        textAlign: 'center',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 17,
        fontWeight: 'bold',
        width: '40%',
    },
    infoText: {
        fontSize: 16,
        color: '#000',
        width: '55%',
        textAlign: 'right',
    },
    input: {
        height: 55,
        borderColor: '#DDDDDD',
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
        width: '80%',
        alignSelf: 'center',
        height: 50,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
});

export default Booking;
