import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchCamera } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import { SEND_INCIDENT_NOTIFICATION_URL } from '@env';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { PermissionsAndroid } from 'react-native';

const ProgressPage = ({ route, navigation }) => {
    const { booking } = route.params;
    const [status, setStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [imageUri, setImageUri] = useState(null);

    useEffect(() => {
        if (booking) {
            const unsubscribe = firestore()
                .collection('bookings')
                .doc(booking.id)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const updatedBooking = doc.data();
                        setStatus(updatedBooking.status || 'Đang xử lý');
                        setRemarks(updatedBooking.remarks || '');
                        setImageUri(updatedBooking.imageUrl || null);
                    }
                });
            return () => unsubscribe();
        }
    }, [booking]);

    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const resizeImage = async (uri) => {
        try {
            const resizedImage = await ImageResizer.createResizedImage(uri, 800, 600, 'JPEG', 80);
            return resizedImage.uri;
        } catch (err) {
            console.error('Lỗi khi nén ảnh: ', err);
            throw err;
        }
    };

    const uploadImageToFirebase = async (imageUri) => {
        const filename = uuidv4() + '.jpg';
        const storageRef = storage().ref(`images/${filename}`);
        const task = storageRef.putFile(imageUri);

        task.on('state_changed', (taskSnapshot) => {
            console.log(`${taskSnapshot.bytesTransferred} bytes transferred out of ${taskSnapshot.totalBytes}`);
        });

        try {
            await task;
            return await storageRef.getDownloadURL();
        } catch (e) {
            console.error('Error uploading image: ', e);
            throw e;
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!booking) return;
    
        try {
            const currentDate = new Date();
            const addedDate = currentDate.toLocaleDateString('vi-VN'); // Format as "dd-MM-yyyy"
            const addedTime = currentDate.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            }); // Format as "HH:mm"
            if (newStatus === 'Thay mới') {
                try {
                    // Bước 1: Truy vấn documentID của tài sản từ collection 'asset'
                    const assetQuery = await firestore()
                        .collection('asset')
                        .where('assetCode', '==', booking.assetCode)
                        .get();
            
                    if (!assetQuery.empty) {
                        const assetDoc = assetQuery.docs[0]; // Lấy document đầu tiên
                        const assetDocId = assetDoc.id; // Lấy documentID
            
                        // Bước 2: Cập nhật position của tài sản thành "Sửa chữa"
                        await firestore().collection('asset').doc(assetDocId).update({
                            position: 'Sửa chữa',
                        });
            
                        // Bước 3: Thêm documentID vào mảng assets trong room có nameRoom "Sửa chữa"
                        const repairRoomQuery = await firestore()
                            .collection('rooms')
                            .where('nameRoom', '==', 'Sửa chữa')
                            .get();
            
                        if (!repairRoomQuery.empty) {
                            const repairRoomDoc = repairRoomQuery.docs[0]; // Lấy document đầu tiên
                            const repairRoomDocId = repairRoomDoc.id; // Lấy documentID của room
            
                            await firestore().collection('rooms').doc(repairRoomDocId).update({
                                assets: firestore.FieldValue.arrayUnion(assetDocId),
                            });
                        } else {
                            // Nếu room "Sửa chữa" chưa tồn tại, tạo mới
                            await firestore().collection('rooms').add({
                                nameRoom: 'Sửa chữa',
                                assets: [assetDocId],
                            });
                        }
            
                        // Bước 4: Xóa documentID khỏi các room khác
                        const otherRoomsQuery = await firestore()
                            .collection('rooms')
                            .where('nameRoom', '!=', 'Sửa chữa') // Lọc các room không phải "Sửa chữa"
                            .get();
            
                        if (!otherRoomsQuery.empty) {
                            for (const roomDoc of otherRoomsQuery.docs) {
                                const roomDocId = roomDoc.id;
                                const roomData = roomDoc.data();
            
                                if (roomData.assets && roomData.assets.includes(assetDocId)) {
                                    await firestore().collection('rooms').doc(roomDocId).update({
                                        assets: firestore.FieldValue.arrayRemove(assetDocId),
                                    });
                                }
                            }
                        }
            
                        Alert.alert('Thành công', 'Tài sản đã được cập nhật và chuyển vào phòng "Sửa chữa".');
                    } else {
                        Alert.alert('Lỗi', 'Không tìm thấy tài sản tương ứng để thay mới.');
                    }
                } catch (error) {
                    console.error('Lỗi khi xử lý Thay mới: ', error);
                    Alert.alert('Lỗi', 'Không thể xử lý yêu cầu Thay mới.');
                }
            }
            
            if (newStatus === 'Hoàn tất') {
                const hasCameraPermission = await requestCameraPermission();
                if (!hasCameraPermission) {
                    Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập camera.');
                    return;
                }
    
                const result = await launchCamera({ mediaType: 'photo', saveToPhotos: true });
                if (result.didCancel || result.errorCode) {
                    Alert.alert('Lỗi', 'Chụp ảnh thất bại.');
                    return;
                }
    
                const resizedUri = await resizeImage(result.assets[0].uri);
                const downloadURL = await uploadImageToFirebase(resizedUri);
    
                await firestore().collection('bookings').doc(booking.id).update({
                    status: newStatus,
                    remarks: remarks,
                    proofphoto: downloadURL,
                    addedDate: addedDate,
                    addedTime: addedTime
                });
                setImageUri(resizedUri);
    
                const assetQuery = await firestore().collection('asset')
                    .where('assetCode', '==', booking.assetCode)
                    .get();
    
                if (!assetQuery.empty) {
                    const assetDoc = assetQuery.docs[0];
                    await firestore().collection('asset').doc(assetDoc.id).update({
                        'history': firestore.FieldValue.arrayUnion({
                            assetName: booking.assetName,
                            qrCodeValue: booking.qrCodeValue,
                            bookingDate: booking.bookingDate,
                            bookingTime: booking.bookingTime,
                            assetCode: booking.assetCode,
                            employeeName: booking.employeName || 'Không xác định',
                            remarks: remarks,
                            proofImage: downloadURL,
                            addedDate: addedDate,
                            addedTime: addedTime
                        })
                    });
                    Alert.alert('Thành công', 'Trạng thái và lịch sử đã được cập nhật!');
                } else {
                    Alert.alert('Lỗi', 'Không tìm thấy thiết bị tương ứng để cập nhật lịch sử.');
                }
            } else {
                await firestore().collection('bookings').doc(booking.id).update({
                    status: newStatus,
                    remarks: remarks,
                    addedDate: addedDate,
                    addedTime: addedTime
                });
                setStatus(newStatus);
                Alert.alert('Thành công', 'Trạng thái đã được cập nhật!');
            }
      
            // Kiểm tra trạng thái và teacherId
            if (booking.teacherId) {
                try {
                // Truy vấn Firestore để tìm người dùng có teacherId khớp
                const userQuery = await firestore()
                    .collection('user')
                    .where('teacherId', '==', booking.teacherId)
                    .get();
            
                // Kiểm tra nếu không tìm thấy người dùng với teacherId
                if (userQuery.empty) {
                    console.log('Không tìm thấy người dùng với teacherId:', booking.teacherId);
                } else {
                    // Lấy dữ liệu người dùng từ document đầu tiên
                    const userData = userQuery.docs[0].data();
                    const expoPushToken = userData?.expoPushToken;
            
                    if (expoPushToken) {
                        let title = '';
                        let body = '';

                        if (newStatus === 'Đã tiếp nhận') {
                            title = 'Thông báo tiếp nhận';
                            body = `${newStatus} sự cố ${booking.assetName} tại phòng ${booking.qrCodeValue} của bạn. Vui lòng theo dõi trong ứng dụng!`;
                        } else if (newStatus === 'Đang sửa chữa') {
                            title = 'Thông báo sửa chữa';
                            body = `Sự cố ${booking.assetName} tại phòng ${booking.qrCodeValue} hiện đang được sửa chữa. Vui lòng theo dõi tiến trình trong ứng dụng.`;
                        } else if (newStatus === 'Thay mới') {
                            title = 'Thông báo thay mới';
                            body = `Sự cố ${booking.assetName} tại phòng ${booking.qrCodeValue} đã thay thế tài sản mới.`;
                        } 
                        else if (newStatus === 'Hoàn tất') {
                            title = 'Thông báo hoàn tất sửa chữa';
                            body = `Sự cố ${booking.assetName} của bạn đã hoàn tất sửa chữa tại phòng ${booking.qrCodeValue}. Vui lòng vào nghiệm thu!`;
                        }

                        // Gửi thông báo qua API 
                        const response = await fetch('https://exp.host/--/api/v2/push/send', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                to: expoPushToken,
                                title,
                                body,
                            }),
                        });

                        const result = await response.json();
                        if (response.ok) {
                            console.log('Thông báo đã được gửi thành công.');
                        } else {
                            console.log('Lỗi khi gửi thông báo:', result);
                        }
                    } else {
                        console.log('Không tìm thấy expoPushToken cho giáo viên.');
                    }
                }
            } catch (error) {
                console.error('Lỗi khi gửi thông báo hoặc truy vấn Firestore:', error);
            }
        } else {
            console.log('Trạng thái không hợp lệ hoặc thiếu teacherId.');
        }
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái: ', error);
        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái!');
    }
};
    

    if (!booking) {
        return <View style={styles.container}><Text>Đang tải dữ liệu...</Text></View>;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                <Icon name="arrow-left" size={25} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Chi Tiết Sự Cố</Text>

            <View style={styles.detailContainer}>
                <View style={styles.evidenceContainer}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    ) : (
                        <Text style={styles.detailValue}>Chưa có ảnh minh chứng</Text>
                    )}
                </View>

                <View style={styles.detailFormContainer}>
                    <Text style={styles.detailText1}>Thông Tin Tài Sản</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Mã tài sản:</Text>
                        <Text style={styles.detailValue}>{booking.assetCode}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Tên tài sản:</Text>
                        <Text style={styles.detailValue}>{booking.assetName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Vị trí:</Text>
                        <Text style={styles.detailValue}>{booking.qrCodeValue}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Ngày báo cáo:</Text>
                        <Text style={styles.detailValue}>{booking.bookingDate} {booking.currentTime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Ngày hoàn tất:</Text>
                        <Text style={styles.detailValue}>{booking.addedDate} {booking.addedTime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Mô tả:</Text>
                        <Text style={styles.detailValue}>{booking.bookingTime}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Mức độ:</Text>
                        <Text style={styles.detailValue}>{booking.priority}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Trạng thái:</Text>
                        <Text style={styles.detailValue}>{status}</Text>
                    </View>
                </View>
            </View>

            <TextInput
                style={[
                    styles.remarksInput, 
                    { display: status === 'Hoàn tất'||status === 'Thay mới' ? 'none' : 'flex' }
                ]}
                placeholder="Nhập mô tả sửa chữa"
                value={remarks}
                onChangeText={setRemarks}
                multiline
            />
            <View style={styles.buttonsContainer}>
                {status !== 'Hoàn tất' && (
                    <>
                        {status === 'Đang xử lý' && (
                            <TouchableOpacity 
                                onPress={() => handleStatusChange('Đã tiếp nhận')} 
                                style={[styles.button, styles.checkButton]}>
                                <Text style={styles.buttonText}>Tiếp nhận</Text>
                            </TouchableOpacity>
                        )}
                        {status === 'Đã tiếp nhận' && (
                            <>
                                <TouchableOpacity 
                                    onPress={() => handleStatusChange('Đang sửa chữa')} 
                                    style={[styles.button, styles.processButton]}>
                                    <Text style={styles.buttonText}>Sửa chữa</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => handleStatusChange('Thay mới')} 
                                    style={[styles.button, styles.completeButton]}>
                                    <Text style={styles.buttonText}>Thay mới</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {status === 'Đang sửa chữa' && (
                            <TouchableOpacity 
                                onPress={() => handleStatusChange('Hoàn tất')} 
                                style={[styles.button, styles.completeButton]}>
                                <Text style={styles.buttonText}>Hoàn tất</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    detailContainer: { 
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#D3D3D3',
        borderRadius: 20,
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center', 
    },
    iconContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
    },
    evidenceContainer: {
        marginBottom: 15,
        // borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 20,
        // padding: 2,
        backgroundColor: '#fff',
        width: '70%',
        height: 150,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
        resizeMode:'contain',
    },
    detailFormContainer: {
        marginBottom: 3,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#E8E8E8',
        alignItems: 'center', // Căn giữa tất cả các phần tử trong form
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        width: '100%', // Đảm bảo chiều rộng đầy đủ
        paddingHorizontal: 10, // Khoảng cách hai bên
    },
    detailText1: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    detailText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'left', // Căn trái cho nhãn
        width: '50%', // Đặt chiều rộng để căn giữa
    },
    detailValue: {
        fontSize: 16,
        textAlign: 'right',
        fontWeight:'400', // Căn phải cho giá trị
        width: '50%', // Đặt chiều rộng để căn giữa
    },
    remarksInput: {
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        height: 80,
        marginBottom: 15,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        padding: 10,
        borderRadius: 5,
        width: '30%',
    },
    checkButton: {
        backgroundColor: '#4CAF50', // Green
    },
    processButton: {
        backgroundColor: '#FFA500', // Orange
    },
    completeButton: {
        backgroundColor: '#F44336', // Red
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight:'900'
    },
});

export default ProgressPage;
