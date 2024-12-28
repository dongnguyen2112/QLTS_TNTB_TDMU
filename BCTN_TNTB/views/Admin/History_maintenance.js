import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const History_maintenance = ({ route, navigation }) => {
    const { maintenanceItem } = route.params;

    const imgmaintenance = maintenanceItem.imgmaintenance || null;
    const formatDate = (dateString) => {
        if (!dateString) return ''; // Kiểm tra giá trị null hoặc undefined
        const [year, month, day] = dateString.split('-'); // Tách chuỗi ngày
        return `${day}/${month}/${year.slice(-2)}`; // Trả về chuỗi theo định dạng dd/mm/yy
    };
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                <Icon name="arrow-left" size={25} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Chi tiết bảo trì</Text>

            <View style={styles.detailContainer}>
                <View style={styles.imageContainer}>
                    {imgmaintenance ? (
                        <Image source={{ uri: imgmaintenance }} style={styles.assetImage} />
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
                        <Text style={styles.detailLabel}>Ngày phân công</Text>
                        <Text style={styles.detailValue}>{maintenanceItem.maintenanceDay}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.detailLabel}>Ngày bảo trì</Text>
                        <Text style={styles.detailValue}>{formatDate(maintenanceItem.completionDate)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.detailLabel}>Tình trạng</Text>
                        <Text style={styles.detailValue}>{maintenanceItem.percentage}%</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.detailLabel}>Mô tả</Text>
                        <Text style={styles.detailValue}>{maintenanceItem.notes}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.detailLabel}>Trạng thái</Text>
                        <Text style={styles.detailValue}>{maintenanceItem.maintenanceStatus}</Text>
                    </View>
                </View>
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
        borderColor: '#D3D3D3',
        borderRadius: 10,
        padding: 15,
        backgroundColor: 'white',
        alignItems: 'center',
        marginTop:20,
    },
    imageContainer: {
        marginBottom: 30,
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
});

export default History_maintenance;
