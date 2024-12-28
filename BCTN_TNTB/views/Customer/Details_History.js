import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';

const Details_History = ({ route, navigation }) => {
    const { bookingId, imageUrl, assetCode, assetName, employeName, bookingDate, currentTime, addedDate, addedTime, qrCodeValue, remarks, status } = route.params;

    // State for description and to track current status
    const [description, setDescription] = useState('');
    const [currentStatus, setCurrentStatus] = useState(status);

    const handleStatusUpdate = async (newStatus) => {
        if (description.trim() === '') {
            Alert.alert("Lỗi", "Vui lòng nhập mô tả trước khi xác nhận.");
            return;
        }

        try {
            // Cập nhật status trong Firestore
            await firestore()
                .collection('bookings')
                .doc(bookingId)
                .update({
                    status: newStatus,
                    remarkTeacher: description,  
                });

            setCurrentStatus(newStatus);
            Alert.alert(
                "Nghiệm thu thành công",
                "Cảm ơn bạn!"
              );
             navigation.navigate('StackNavigator');
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            Alert.alert("Lỗi", "Không thể cập nhật trạng thái.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                    <Icon name="arrow-left" size={25} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Chi Tiết Sự Cố</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.detailContainer}>
                    <View style={styles.evidenceContainer}>
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.image} />
                        ) : (
                            <Text style={styles.detailValue}>Chưa có ảnh minh chứng</Text>
                        )}
                    </View>

                    <View style={styles.detailFormContainer}>
                        <Text style={styles.detailText1}>Thông Tin Chi Tiết</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailText}>Mã tài sản:</Text>
                            <Text style={styles.detailValue}>{assetCode}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailText}>Tên tài sản:</Text>
                            <Text style={styles.detailValue}>{assetName}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailText}>Vị trí:</Text>
                            <Text style={styles.detailValue}>{qrCodeValue}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailText}>Ngày báo cáo:</Text>
                            <Text style={styles.detailValue}>{bookingDate} {currentTime}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailText}>Ngày hoàn tất:</Text>
                            <Text style={styles.detailValue}>{addedDate || 'Chưa có'} {addedTime}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailText}>Sửa chữa:</Text>
                            <Text style={styles.detailValue}>{employeName || 'Chưa có'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailText}>Trạng thái:</Text>
                            <Text style={styles.detailValue}>{currentStatus || 'Chưa xác định'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailText}>Mô tả:</Text>
                            <Text style={styles.detailValue}>{remarks || 'Chưa có mô tả'}</Text>
                        </View>
                        {
                            currentStatus !== "Đạt Yêu Cầu" && currentStatus !== "Thay mới" && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập mô tả"
                                        value={description}
                                        onChangeText={setDescription}
                                    />

                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={[styles.button, styles.successButton]}
                                            onPress={() => handleStatusUpdate("Đạt Yêu Cầu")}
                                        >
                                            <Text style={styles.buttonText}>Đạt Yêu Cầu</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, styles.failureButton]}
                                            onPress={() => handleStatusUpdate("Đã tiếp nhận")}
                                        >
                                            <Text style={styles.buttonText}>Chưa Đạt</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )
                        }

                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E90FF',
        padding: 15,
    },
    iconContainer: {
        marginRight: 10,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        textAlign: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    detailContainer: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 10,
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    evidenceContainer: {
        marginBottom: 15,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        width: '60%',
        height: 150,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    detailFormContainer: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        backgroundColor: '#f8f8f8',
        width: '100%',
    },
    detailText1: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    input: {
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 8,
        padding: 10,
        marginTop: 15,
        marginBottom: 20,
        backgroundColor: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    successButton: {
        backgroundColor: '#4CAF50',
        marginRight: 10,
    },
    failureButton: {
        backgroundColor: '#f44336',
        marginLeft: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Details_History;
