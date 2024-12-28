import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; 

const Maintenance = ({ navigation }) => {
    const [maintenanceAssets, setMaintenanceAssets] = useState([]);
    const [teacherId, setTeacherId] = useState('');

    // Fetch user information
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

    // Fetch maintenance data based on teacherId
useEffect(() => {
    if (teacherId) {
        const unsubscribe = firestore()
            .collection('maintenance')
            .where('teacherId', '==', teacherId) // Fetch data based on teacherId
            .onSnapshot(snapshot => {
                const maintenanceData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                // Filter only assets with 'Đã phân công' status
                const filteredData = maintenanceData.filter(item => item.maintenanceStatus === 'Đã phân công');
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
        navigation.navigate('Maintenance_Detail', { maintenanceItem: item });
    };

    return (
        <View style={styles.container}>
            <View style={styles.listContainer}>
                <FlatList
                    data={maintenanceAssets} // Use maintenanceAssets
                    renderItem={({ item, index }) => (
                        <Animated.View style={styles.card}>
                            <View style={styles.itemContent}>
                                {item.imgasset && (
                                    <Image source={{ uri: item.imgasset }} style={styles.assetImage} />
                                )}
                                <View style={styles.textContainer}>
                                    <Text style={[styles.bookingText,{ fontSize: 20 }]}>{item.assetName}</Text>
                                    <Text style={styles.bookingText}>{item.position}</Text>
                                    <Text style={styles.bookingText}>{item.maintenanceDay}</Text>
                                </View>
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
                    )}
                    keyExtractor={(item) => item.id} // Use id as key
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
        marginTop: 25,
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

export default Maintenance;
