import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const FormProblem = () => {
    const [nameRoom, setRoomCode] = useState('');
    const navigation = useNavigation();
    const currentUser = auth().currentUser; // Lấy thông tin người dùng hiện tại

    const handleCheckRoom = async () => {
        const trimmedRoomName = nameRoom.trim();

        try {
            // Truy vấn Firestore để tìm phòng
            const roomSnapshot = await firestore()
                .collection('rooms')
                .where('nameRoom', '==', trimmedRoomName)
                .get();

            console.log('Số lượng phòng tìm thấy: ', roomSnapshot.size);

            if (!roomSnapshot.empty) {
                const roomData = roomSnapshot.docs[0].data();
                const assets = roomData.assets; // Lấy thông tin tài sản nếu có

                // Lưu thông tin vào collection của người dùng
                if (currentUser) {
                    await firestore()
                        .collection('user')
                        .doc(currentUser.uid)
                        .set(
                            {
                                qrCodeValue: trimmedRoomName,
                            },
                            { merge: true } // Cập nhật nếu đã tồn tại
                        );

                    console.log('Thông tin mã phòng đã được lưu thành công!');
                } else {
                    Alert.alert('Lỗi', 'Không thể xác định người dùng');
                    return;
                }

                // Điều hướng sang HomeCustomer với thông tin phòng và tài sản
                navigation.navigate('HomeCustomer', {
                    qrCodeValue: trimmedRoomName,
                    assets,
                });
            } else {
                Alert.alert('Lỗi', 'Phòng không tồn tại!');
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu phòng: ', error);
            Alert.alert('Lỗi', 'Không thể lấy dữ liệu phòng.');
        }
    };

    return (
        <View style={styles.container}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                    <Icon name="arrow-left" size={25} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Theo dõi sự cố</Text>
            </View>
            <View style={styles.input_form}>
                <Text style={styles.label}>Nhập mã phòng</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Mã phòng"
                    value={nameRoom}
                    onChangeText={setRoomCode}
                />
                <TouchableOpacity style={styles.button} onPress={handleCheckRoom}>
                    <Text style={styles.buttonText}>Kiểm tra phòng</Text>
                </TouchableOpacity>
            </View>
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        height: 80, // Đặt chiều cao cho header
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E90FF', // Màu nền của header
        paddingHorizontal: 20,
    },
    iconContainer: {
        marginRight: 10,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white', // Màu chữ
        flex: 1, // Để text giãn ra nếu cần
        textAlign: 'center',
    },
    input_form: {
        display: 'flex',
        justifyContent: 'center',
        padding: 25,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5, // Để tạo bóng cho Android
        width: '100%',
        maxWidth: 600, // Giới hạn chiều rộng tối đa
        alignSelf: 'center', // Căn giữa form
        flex: 1, // Phần input form chiếm phần còn lại của màn hình
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center', // Căn giữa nhãn
    },
    input: {
        height: 50,
        borderColor: '#DDDDDD',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
        width: '100%', // Đảm bảo chiều rộng là 100%
    },
    button: {
        backgroundColor: '#1E90FF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '70%', // Đảm bảo nút bao phủ chiều rộng của form
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});


export default FormProblem;
