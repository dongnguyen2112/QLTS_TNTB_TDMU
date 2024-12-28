import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; 

const ProblemScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [assets, setAssets] = useState([]);
    const [teacherId, setTeacherId] = useState('');

    // Fetch user and assets
    useEffect(() => {
        const fetchUser = async () => {
            const user = auth().currentUser;
            if (user) {
                const userDoc = await firestore().collection('user').doc(user.uid).get();
                if (userDoc.exists) {
                    setTeacherId(userDoc.data().teacherId);
                }
            }
        };

        const fetchAssets = async () => {
            try {
                const assetsSnapshot = await firestore().collection('asset').get();
                const assetsData = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAssets(assetsData);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu tài sản:", error);
            }
        };

        fetchUser();
        fetchAssets();
    }, []);

    useEffect(() => {
        if (teacherId) {
            const unsubscribe = firestore()
                .collection('bookings')
                .where('employeCode', '==', teacherId)
                .where('status', '==', 'Đang xử lý') 
                .onSnapshot(snapshot => {
                    const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                 // Sắp xếp theo bookingDate và currentTime
                const sortedBookings = bookingsData.sort((a, b) => {
                    // Chuyển đổi bookingDate sang đối tượng Date
                    const dateA = new Date(a.bookingDate);
                    const dateB = new Date(b.bookingDate);

                    // So sánh bookingDate trước
                    if (dateA - dateB !== 0) {
                        return dateA - dateB;
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
                }, error => {
                    console.error('Lỗi: ', error);
                });
    
            return () => unsubscribe();
        }
    }, [teacherId]);
    

    const findAssetImage = (assetName) => {
        const asset = assets.find(a => a.assetName === assetName);
        return asset ? asset.imageUrl : null;
    };

    const handleAccept = (item) => {
        navigation.navigate('ProgressPage', { booking: item });
    };

    return (
        <View style={styles.container}>
            <View style={styles.listContainer}>
                <FlatList
                    data={bookings}
                    renderItem={({ item, index }) => {
                        const assetImage = findAssetImage(item.assetName);
                        return (
                            <Animated.View style={styles.card}>
                                <View style={styles.itemContent}>
                                    {/* Hình ảnh bên trái */}
                                    {assetImage && (
                                        <Image source={{ uri: assetImage }} style={styles.assetImage} resizeMode="cover" />
                                    )}
                                    {/* Nội dung bên phải */}
                                    <View style={styles.textContainer}>
                                        <Text style={[styles.bookingText, { fontSize: 18 }]}>{item.assetName}</Text>
                                        <Text style={styles.bookingText}>{item.qrCodeValue}</Text>
                                        <Text style={styles.bookingText}>{item.bookingDate} {item.currentTime}</Text>
                                        {/* <Text style={styles.bookingText}>{item.priority}</Text> */}
                                    </View>
                                    {/* Các nút hành động */}
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            onPress={() => handleAccept(item)}
                                            style={[styles.button, styles.acceptButton]}
                                            activeOpacity={0.7}
                                        >
                                            <MaterialCommunityIcons name="check-circle-outline" size={30} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Animated.View>
                        );
                    }}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.flatListContent}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginVertical: 20,
        alignSelf: 'center',
        color: '#3498db',
        textShadowColor: '#d1d1d1',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 10,
        position: 'relative',
        marginTop:25,
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
        minHeight: 100,  
        maxHeight: 130,           // Thêm chiều cao tối thiểu nếu cần
    },
    
    itemContent: {
        display: 'flex',
        flexDirection: 'row', // Bố cục hàng ngang
        alignItems: 'center', // Căn giữa theo trục dọc
        marginVertical: 10,   // Khoảng cách dọc giữa các thẻ
        width: '100%', 
        
    },
    assetImage: {
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
        marginLeft:30,
    },
    textContainer: {
        flex: 1, 
        marginLeft:25,
    },
    bookingText: {
        fontSize: 15,
        color: '#555',
        marginBottom: 8,
        lineHeight: 24,
        fontWeight:'bold',
    },
    actionButtons: {
        marginBottom:20, 
    },
    
    acceptButton: {
        backgroundColor: '#43CD80',
        borderRadius: 25,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        position: 'absolute', 
        top: '50%', // Canh giữa theo chiều dọc
        right: 0, // Canh sát cạnh phải
        transform: [{ translateY: -25 }], // Điều chỉnh để canh giữa nút
    },
    flatListContent: {
        paddingBottom: 20,
    },
});

export default ProblemScreen;
