import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, ImageBackground } from 'react-native'; // Import ImageBackground
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import MyTabs from './MaterialTop_Tab';
const AppoitmentCustomer = () => {
    const navigation = useNavigation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const currentUser = auth().currentUser;
                
                if (currentUser) {
                    const userDoc = await firestore().collection('user').doc(currentUser.uid).get();
                    
                    if (!userDoc.exists) {
                        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
                        return;
                    }

                    const { teacherId } = userDoc.data();
                    
                    // Theo dõi thay đổi trong collection bookings
                    const unsubscribe = firestore()
                        .collection('bookings')
                        .where('teacherId', '==', teacherId)
                        .onSnapshot(querySnapshot => {
                            const bookingsData = querySnapshot.docs
                                .map(doc => ({ id: doc.id, ...doc.data() }));
                            
                            const filteredBookings = bookingsData.filter(item =>
                                item.status && typeof item.status === 'string' && ['Đang xử lý','Đã tiếp nhận','Đang sửa chữa'].includes(item.status.trim())
                            );
                                // Sắp xếp theo bookingDate và currentTime
                                const sortedBookings = filteredBookings.sort((b, a) => {
                                    // Chuyển đổi bookingDate sang đối tượng Date
                                    const dateA = new Date(a.bookingDate);
                                    const dateB = new Date(b.bookingDate);

                                    // So sánh bookingDate trước
                                    if (dateA - dateB !== 0) {
                                        return dateB - dateA;
                                    }

                                    // Nếu bookingDate giống nhau, so sánh currentTime
                                    const timeA = a.currentTime ? a.currentTime.split(':').map(Number) : [0, 0];
                                    const timeB = b.currentTime ? b.currentTime.split(':').map(Number) : [0, 0];
                                    const [hourA, minuteA] = timeA;
                                    const [hourB, minuteB] = timeB;

                                    // So sánh giờ trước, nếu giống thì so sánh phút
                                    return hourA - hourB || minuteA - minuteB;
                                });

                                setBookings(sortedBookings);
                            setLoading(false); // Cập nhật trạng thái loading sau khi nhận dữ liệu
                        }, error => {
                            console.error('Error fetching bookings: ', error);
                            Alert.alert('Lỗi', 'Không thể lấy thông tin đặt lịch');
                            setLoading(false);
                        });

                    return () => unsubscribe(); // Cleanup listener on component unmount
                } else {
                    Alert.alert('Lỗi', 'Người dùng chưa đăng nhập');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching bookings: ', error);
                Alert.alert('Lỗi', 'Không thể lấy thông tin đặt lịch');
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);
    const handleItemPress = (item) => {
        navigation.navigate('Follow_Problem', {
            imageUrl: item.imageUrl,
            assetCode: item.assetCode,
            assetName: item.assetName,
            employeName: item.employeName,
            bookingDate: item.bookingDate,
            currentTime: item.currentTime,
            addedDate: item.addedDate,
            addedTime: item.addedTime,
            qrCodeValue: item.qrCodeValue,
            remarks: item.remarks,
            status: item.status,
        });
    };
    const deleteBooking = async (id) => {
        try {
await firestore().collection('bookings').doc(id).delete();
            Alert.alert('Thông báo', 'Đặt lịch đã được xoá thành công');
        } catch (error) {
            console.error('Error deleting booking: ', error);
            Alert.alert('Lỗi', 'Không thể xoá đặt lịch');
        }
    };

    if (loading) {
        return <View style={styles.container}><Text>Đang tải...</Text></View>;
    }

    return (
        <View style={styles.container}>
                <View style={styles.content}>
                    <FlatList
                        style={styles.list}
                        data={bookings}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.card}>
                                    <View style={styles.cardContent}>
                                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                                        <View style={styles.textContainer}>
                                            <Text style={[styles.bookingText, { fontSize: 20 }]}>{item.assetName}</Text>
                                            <Text style={styles.bookingText}>{item.bookingDate} {item.currentTime}</Text>
                                            <Text style={styles.bookingText}>{item.employeName ? item.employeName : 'Chưa phân công'}</Text>
                                            <Text style={styles.bookingText}>{item.status}</Text>
                                        </View>
                                        {/* Conditionally render delete button */}
                                        {(item.status === 'Đang xử lý' && !item.employeName) && (
                                            <TouchableOpacity onPress={() => deleteBooking(item.id)} style={styles.deleteButton}>
                                                <MaterialCommunityIcons name="delete-empty-outline" size={30} color="white" />
                                            </TouchableOpacity>
                                        )}
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            {/* </ImageBackground> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 20,
        color:'#1E90FF'
    },
    list: {
        flex: 1,
        width: '100%',
    },
    content: {
        flex: 1,
        padding: 20,
        backgroundColor:'white',
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 22, // Bo tròn góc nhiều hơn
        marginBottom: 12,
        padding: 10,
        elevation: 15, // Bóng đổ cho thẻ
        shadowColor: '#777777',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        overflow: 'hidden',
        borderColor: '#ccc',
        borderWidth: 2,
        transform: [{ scale: 0.98 }],
        display: 'flex',
        flexDirection: 'column',    // Thêm để đảm bảo nội dung bên trong được bố trí theo cột
        justifyContent: 'center',    // Căn giữa theo chiều dọc
        alignItems: 'center',        // Căn giữa theo chiều ngang
        minHeight: 120,  
        maxHeight: 150,           // Thêm chiều cao tối thiểu nếu cần
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    bookingText: {
        fontSize: 15,
        color: '#555',
        marginBottom: 8,
        lineHeight: 24,
        fontWeight:'bold',
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 5,
    },
    image: {
            width: 70, // Kích thước phù hợp cho ảnh
            height: 70,
            // borderRadius: 35, // Tạo hình tròn
            marginRight: 15,  // Khoảng cách với nội dung
            // borderColor: '#ddd',
            borderWidth: 1,
            backgroundColor: '#f5f5f5',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            marginLeft:20,
    },
   
});

export default AppoitmentCustomer;