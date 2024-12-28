import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import HeaderCustomer from './HeaderCustomer';

const ProgressPageCustomer = () => {
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
                    
                    const unsubscribe = firestore()
                        .collection('bookings')
                        .where('teacherId', '==', teacherId)
                        .onSnapshot(querySnapshot => {
                            const bookingsData = querySnapshot.docs
                                .map(doc => ({ id: doc.id, ...doc.data() }));
                            
                            const filteredBookings = bookingsData.filter(item =>
                                item.status && typeof item.status === 'string' && 
                                ["Hoàn tất"].includes(item.status.trim())
                            );

                            setBookings(filteredBookings);
                            setLoading(false);
                        }, error => {
                            console.error('Error fetching bookings: ', error);
                            Alert.alert('Lỗi', 'Không thể lấy thông tin đặt lịch');
                            setLoading(false);
                        });

                    return () => unsubscribe();
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
        navigation.navigate('Details_History', {
            bookingId: item.id,
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
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.card}>
                            <View style={styles.cardContent}>
                                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                                <View style={styles.textContainer}>
                                    <Text style={[styles.bookingText, { fontSize: 20 }]}>{item.assetName}</Text>
                                    <Text style={styles.bookingText}>{item.bookingDate} {item.currentTime}</Text>
                                    <Text style={styles.bookingText}>{item.status}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 22,
        marginBottom: 12,
        padding: 10,
        elevation: 15,
        shadowColor: '#777777',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        overflow: 'hidden',
        borderColor: '#ccc',
        borderWidth: 2,
        transform: [{ scale: 0.98 }],
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 100,  
        maxHeight: 130,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 20
    },
    bookingText: {
        fontSize: 15,
        color: '#555',
        marginBottom: 8,
        lineHeight: 24,
        fontWeight:'bold',
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
        resizeMode:"cover"
    },
});

export default ProgressPageCustomer;
