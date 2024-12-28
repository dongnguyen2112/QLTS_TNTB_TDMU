import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, Platform, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Import Picker component

const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};


const HistoryRepair = () => {
    const navigation = useNavigation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('Tất cả'); // Default value can be 'Tất cả'
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
                        .where('employeCode', '==', teacherId)
                        .onSnapshot(querySnapshot => {
                            const bookingsData = querySnapshot.docs
                                .map(doc => ({ id: doc.id, ...doc.data() }))
                                .filter(item =>
                                    item.status === 'Đạt Yêu Cầu' || item.status === 'Thay mới' // Lọc trạng thái 'Đạt Yêu Cầu' hoặc 'Thay mới'
                                );
    
                            // Chuyển selectedDate thành định dạng DD/MM/YYYY
                            const selectedDateStr = selectedDate ? formatDate(selectedDate) : null;
    
                            // Lọc bookings theo ngày
                            const filteredBookings = bookingsData.filter(item => {
                                if (!selectedDateStr) return true;
    
                                // Chuyển ngày thành định dạng không có số không
                                const [day, month, year] = selectedDateStr.split('/');
                                const altDateStr = `${parseInt(day)}/${parseInt(month)}/${year}`; // Loại bỏ số không
    
                                const itemDateStr = item.addedDate; // Giả sử `addedDate` có định dạng DD/MM/YYYY
    
                                // Kiểm tra cả hai định dạng
                                return itemDateStr === selectedDateStr || itemDateStr === altDateStr;
                            }).filter(item => {
                                // Lọc theo trạng thái
                                if (selectedStatus === 'Tất cả') {
                                    return true; // Hiển thị tất cả
                                }
                                return item.status === selectedStatus; // Lọc theo trạng thái cụ thể
                            });
    
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
    }, [selectedDate, selectedStatus]); // Thêm selectedStatus vào dependencies
    

    const handleDateChange = (event, date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            setSelectedDate(date);
        }
    };
    

    const showDatePickerHandler = () => {
        setShowDatePicker(true);
    };

    const clearDateFilter = () => {
        setSelectedDate(null);
    };

    if (loading) {
        return <View style={styles.container}><Text style={styles.loadingText}>Đang tải...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                    <Icon name="arrow-left" size={25} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Lịch sử sửa chữa</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.datePickerContainer}>
                    <TouchableOpacity onPress={showDatePickerHandler} style={styles.datePickerButton}>
                        <MaterialCommunityIcons name="calendar" size={24} color="#00B2EE" />
                        <Text style={styles.datePickerText}>
                            {selectedDate ? formatDate(selectedDate) : 'Chọn ngày'}
                        </Text>
                    </TouchableOpacity>
                    {selectedDate && (
                        <TouchableOpacity onPress={clearDateFilter} style={styles.clearFilterButton}>
                            <MaterialCommunityIcons name="close-circle" size={24} color="red" />
                        </TouchableOpacity>
                    )}
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                    />
                )}
                <View style={styles.statusPickerContainer}>
                    <Picker
                        selectedValue={selectedStatus}
                        onValueChange={(itemValue) => setSelectedStatus(itemValue)}
                        style={styles.statusPicker}
                    >
                        <Picker.Item label="Tất cả" value="Tất cả" />
                        <Picker.Item label="Đạt yêu cầu" value="Đạt Yêu Cầu" />
                        <Picker.Item label="Thay mới" value="Thay mới" />
                    </Picker>
                </View>
                {bookings.length === 0 ? (
                    <Text style={styles.noReportsText}>Không có lịch sử sửa chữa nào!</Text>
                ) : (
                    <FlatList
                        style={styles.list}
                        data={bookings}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Details_History', {
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
                                    status: item.status
                                })}>
                                <View style={styles.card}>
                                    <View style={styles.cardContent}>
                                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                                        <View style={styles.textContainer}>
                                            <Text style={[styles.bookingText, { fontSize: 18, fontWeight: 'bold' }]}>{item.assetName}</Text>
                                            <Text style={styles.bookingText}>{item.addedDate} {item.currentTime}</Text>
                                            <Text style={styles.bookingText}>{item.status}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E90FF',
        padding: 15,
        marginBottom: 15
    },
    iconContainer: {
        marginRight: 10,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        textAlign: 'center'
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1.5,
        marginBottom: 20,
        shadowColor: '#CFCFCF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderColor: '#CFCFCF'
    },
    statusPickerContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end', // Căn chỉnh nội dung bên phải
        marginBottom: 20,
        width: '100%',
    },
    statusPicker: {
        height: 50,
        width: 170, // Đặt chiều rộng cho Picker
        justifyContent: 'flex-end', // Căn chỉnh Picker
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    datePickerText: {
        fontSize: 18,
        marginLeft: 10,
        fontWeight: '500',
    },
    clearFilterButton: {
        marginLeft: 10,
    },
    list: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 10,
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
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginLeft:50,
    },
    textContainer: {
        flex: 1,
        marginLeft: 15,
    },
    bookingText: {
        fontSize: 15,
        color: '#555',
        marginBottom: 8,
        lineHeight: 24,
    },
    image: {
        width: 70, // Kích thước phù hợp cho ảnh
        height: 70,
        borderRadius: 5, // Tạo hình tròn
        marginRight: 15,  // Khoảng cách với nội dung
        // borderColor: '#ddd',
        borderWidth: 1,
        backgroundColor: '#f5f5f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    serialNumber: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#FF9966',
        marginLeft: 10,
    },
    noReportsText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        color: '#9C9C9C',
        fontWeight: 'bold',
    },
});

export default HistoryRepair;
