import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage'; // Import Firebase Storage
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchCamera } from 'react-native-image-picker'; // Import camera package

const MaintenanceDetail = ({ route, navigation }) => {
    const { maintenanceItem } = route.params;

    const [notes, setNotes] = useState('');
    const [percentage, setPercentage] = useState('');
    const [imageUri, setImageUri] = useState(maintenanceItem.imgasset || null); // To hold image URI

    const handleSave = async () => {
        const parsedPercentage = parseInt(percentage, 10);

        // Kiểm tra trường ghi chú và phần trăm tài sản
        if (!notes.trim()) {
            Alert.alert('Thông báo', 'Ghi chú không được để trống.');
            return;
        }

        if (parsedPercentage < 10 || parsedPercentage > 100 || isNaN(parsedPercentage)) {
            Alert.alert('Thông báo', 'Phần trăm tài sản phải nằm trong khoảng từ 10 đến 100.');
            return;
        }

        // Mở camera để chụp ảnh
        launchCamera({ mediaType: 'photo', cameraType: 'back' }, async (response) => {
            if (response.didCancel) {
                Alert.alert('Thông báo', 'Cập nhật thất bại do chưa chụp ảnh minh chứng.');
                return;
            }

            if (response.errorCode) {
                Alert.alert('Thông báo', 'Lỗi khi mở camera. Vui lòng thử lại.');
                return;
            }

            const uri = response.assets[0].uri;
            setImageUri(uri);

            try {
                // Upload image to Firebase Storage
                const fileName = `assets/${new Date().getTime()}.jpg`; // Generate a unique file name
                const reference = storage().ref(fileName);
                await reference.putFile(uri); // Upload the image
                const imageUrl = await reference.getDownloadURL(); // Get the URL of the uploaded image

                // Lấy thông tin asset từ collection 'asset' dựa trên assetCode
                const assetSnapshot = await firestore()
                    .collection('asset')
                    .where('assetCode', '==', maintenanceItem.assetCode)
                    .get();

                if (!assetSnapshot.empty) {
                    const assetDoc = assetSnapshot.docs[0];
                    const assetRef = firestore().collection('asset').doc(assetDoc.id);

                    // Lấy ngày giờ hiện tại và định dạng completionDate và maintenanceDay
                    const now = new Date();
                    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    const formattedTime = now.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    });

                    // Cập nhật maintenanceDay và maintenanceTime trong collection asset
                    await assetRef.update({
                        maintenanceDay: formattedDate,
                        maintenanceTime: formattedTime,
                    });

                    // Tạo một đối tượng cho HistoryMaintenance
                    const historyData = {
                        addedDate: maintenanceItem.addedDate,
                        assetCode: maintenanceItem.assetCode,
                        assetName: maintenanceItem.assetName,
                        maintenanceDay: maintenanceItem.maintenanceDay,
                        completionDate: formattedDate,
                        employeeName: maintenanceItem.employeeName,
                        maintenanceStatus: 'Hoàn tất bảo trì',
                        notes: notes,
                        percentage: parsedPercentage,
                        position: maintenanceItem.position,
                        teacherId: maintenanceItem.teacherId,
                        imgmaintenance: imageUrl, 
                    };

                    // Truy xuất dữ liệu hiện có trong HistoryMaintenance, nếu có
                    const deviceSnapshot = await assetRef.get();
                    let updatedHistory = [];

                    if (deviceSnapshot.exists) {
                        const deviceData = deviceSnapshot.data();
                        if (Array.isArray(deviceData.HistoryMaintenance)) {
                            // Nếu HistoryMaintenance đã là mảng, giữ lại các mục cũ
                            updatedHistory = deviceData.HistoryMaintenance;
                        }
                    }

                    // Thêm historyData vào mảng HistoryMaintenance
                    updatedHistory.push(historyData);

                    // Lưu mảng HistoryMaintenance cập nhật lại vào Firestore
                    await assetRef.set({
                        HistoryMaintenance: updatedHistory
                    }, { merge: true });

                    // Cập nhật trạng thái trong collection maintenance
                    const maintenanceRef = firestore().collection('maintenance').doc(maintenanceItem.id);
                    await maintenanceRef.update({
                        maintenanceStatus: 'Hoàn tất bảo trì',
                        notes: notes,
                        percentage: parsedPercentage,
                        completionDate: formattedDate,
                        imgmaintenance: imageUrl, // Lưu URL ảnh vào maintenanceRef
                    });

                    Alert.alert('Thành công', 'Thông tin đã được lưu thành công!');

                    // Quay lại màn hình Maintenance
                    navigation.goBack();
                } else {
                    Alert.alert('Thông báo', 'Không tìm thấy tài sản với mã tài sản này.');
                }
            } catch (error) {
                console.log("Error saving data:", error);
                Alert.alert('Có lỗi xảy ra', 'Vui lòng thử lại.');
            }
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                <Icon name="arrow-left" size={25} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Chi tiết bảo trì</Text>

            <View style={styles.detailContainer}>
                <View style={styles.imageContainer}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.assetImage} />
                    ) : (
                        <Text style={styles.noImageText}>Chưa có ảnh minh chứng</Text>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>Thông tin tài sản</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.detailLabel}>Mã tài sản</Text>
                        <Text style={styles.detailValue}>{maintenanceItem.assetCode}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.detailLabel}>Tên tài sản</Text>
                        <Text style={styles.detailValue}>{maintenanceItem.assetName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.detailLabel}>Vị trí</Text>
                        <Text style={styles.detailValue}>{maintenanceItem.position}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.detailLabel}>Hạn bảo trì</Text>
                        <Text style={styles.detailValue}>{maintenanceItem.maintenanceDay}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.detailLabel}>Trạng thái</Text>
                        <Text style={styles.detailValue}>{maintenanceItem.maintenanceStatus}</Text>
                    </View>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Nhập ghi chú"
                    value={notes}
                    onChangeText={setNotes}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Nhập phần trăm tài sản (10-100)"
                    value={percentage}
                    onChangeText={setPercentage}
                    keyboardType="numeric"
                />

                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Lưu</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: 'white',
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
    detailContainer: {
        marginBottom: 5,
        // borderWidth: 2,
        borderColor: '#D3D3D3',
        borderRadius: 10,
        padding: 15,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    imageContainer: {
        marginBottom: 15,
        // borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 20,
        padding: 5,
        backgroundColor: '#fff',
        width: '70%',
        height: 150,
    },
    assetImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        objectFit:"contain"
    },
    noImageText: {
        textAlign: 'center',
        color: '#aaa',
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    infoContainer: {
        marginBottom: 15,
        width: '100%',
        padding: 10,
        backgroundColor: '#E8E8E8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    detailValue: {
        fontSize: 16,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        width: '100%',
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MaintenanceDetail;
