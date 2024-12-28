import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Follow_Problem = ({ route, navigation }) => {
    const { imageUrl, assetCode, assetName, employeName, bookingDate, currentTime, addedDate, addedTime, qrCodeValue, remarks, status } = route.params;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                    <Icon name="arrow-left" size={25} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Theo dõi sự cố</Text>
            </View>

            {/* ScrollView for other content */}
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
                        <Text style={styles.detailText}>Sửa chữa:</Text>
                        <Text style={styles.detailValue}>{employeName || 'Chưa có'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailText}>Trạng thái:</Text>
                        <Text style={styles.detailValue}>{status || 'Chưa xác định'}</Text>
                    </View>
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
        backgroundColor: '#1E90FF', // Màu nền của header
        padding: 15,
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
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center', // Căn giữa theo chiều dọc
        alignItems: 'center', // Căn giữa theo chiều ngang
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
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5, // Để tạo bóng cho Android
        width: '100%', // Chiếm toàn bộ chiều rộng
        maxWidth: 600, // Giới hạn chiều rộng tối đa
      },
      evidenceContainer: {
        marginBottom: 15,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        width: '100%', // Đặt lại chiều rộng để chiếm toàn bộ không gian
        height: 150, // Tăng chiều cao để phù hợp với hình ảnh
        overflow: 'hidden', // Đảm bảo bo góc hình ảnh
      },
      image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // Sử dụng 'contain' để hình ảnh không bị cắt
      },
      detailFormContainer: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        backgroundColor: '#f8f8f8',
        width: '100%', // Chiếm toàn bộ chiều rộng của detailContainer
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
        color: '#555', // Thay đổi màu sắc để dễ đọc hơn
      },
      detailValue: {
        fontSize: 16,
        color: '#333',
        flex: 1, // Để giá trị có thể giãn nở
        textAlign: 'right', // Căn phải cho giá trị
      },
});

export default Follow_Problem;