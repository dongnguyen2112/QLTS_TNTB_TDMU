import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; 

const Maintenance = ({ navigation }) => {
    const [maintenanceAssets, setMaintenanceAssets] = useState([]);
    const [teacherId, setTeacherId] = useState('');

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
        fetchUser();
    }, []);

    useEffect(() => {
        if (teacherId) {
            const unsubscribe = firestore()
                .collection('maintenance')
                .where('teacherId', '==', teacherId)
                .onSnapshot(snapshot => {
                    const maintenanceData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    const filteredData = maintenanceData.filter(item => item.maintenanceStatus === 'Hoàn tất bảo trì');
                        // Sắp xếp theo maintenanceDay (từ thấp đến cao)
                    const sortedData = filteredData.sort((a, b) => {
                        const [dayA, monthA, yearA] = a.maintenanceDay.split('/').map(Number); // Tách chuỗi ngày
                        const [dayB, monthB, yearB] = b.maintenanceDay.split('/').map(Number);
                        const dateA = new Date(2000 + yearA, monthA - 1, dayA); // Tạo đối tượng Date
                        const dateB = new Date(2000 + yearB, monthB - 1, dayB);
                        return dateA - dateB; // Sắp xếp tăng dần
                    });
                setMaintenanceAssets(sortedData);
                }, error => {
                    console.error('Error: ', error);
                });
            return () => unsubscribe();
        }
    }, [teacherId]);

    const handleAccept = (item) => {
        navigation.navigate('History_maintenance', { maintenanceItem: item });
    };

    return (
        <View style={styles.container}>
            <View style={styles.listContainer}>
                <FlatList
                    data={maintenanceAssets}
                    renderItem={({ item, index }) => (
                        <Animated.View style={styles.card}>
                            <TouchableOpacity
                                onPress={() => handleAccept(item)}
                                style={styles.cardButton}
                                activeOpacity={0.85}>
                                <View style={styles.itemContent}>
                                    {item.imgasset && (
                                        <Image source={{ uri: item.imgasset }} style={styles.assetImage} />
                                    )}
                                    <View style={styles.textContainer}>
                                        <Text style={[styles.bookingText,{ fontSize: 18,  fontWeight:'bold'}]}>{item.assetName}</Text>
                                        <Text style={styles.bookingText}>{item.position}</Text>
                                        <Text style={styles.bookingText}>{item.maintenanceDay}</Text>
                                    </View>
                                    
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.flatListContent}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 10,
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
    cardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginLeft:50,
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
    },
    textContainer: {
        flex: 1,
        marginLeft:22,
    },
    bookingText: {
        fontSize: 15,
        color: '#555',
        marginBottom: 8,
        lineHeight: 24,
       
    },
    assetName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2b2b2b',
    },
      flatListContent: {
        paddingBottom: 20,
    },
});

export default Maintenance;
