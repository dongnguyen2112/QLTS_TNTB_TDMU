import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const HistoryTransfer = () => {
    const navigation = useNavigation();
    const [transfers, setTransfers] = useState([]);
    const [filteredTransfers, setFilteredTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        const fetchTransfers = async () => {
            try {
                const currentUser = auth().currentUser;

                if (currentUser) {
                    const userDoc = await firestore().collection('user').doc(currentUser.uid).get();

                    if (!userDoc.exists) {
                        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
                        return;
                    }

                    const { teacherId } = userDoc.data();

                    const transferSnapshots = await firestore()
                        .collection('transfer_history')
                        .where('senderCode', '==', teacherId)
                        .get();
                    
                    const transfersData = transferSnapshots.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    setTransfers(transfersData);
                    setFilteredTransfers(transfersData); // Initialize filtered transfers
                    setLoading(false);
                } else {
                    Alert.alert('Lỗi', 'Người dùng chưa đăng nhập');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching transfer history: ', error);
                Alert.alert('Lỗi', 'Không thể lấy thông tin chuyển giao');
                setLoading(false);
            }
        };

        fetchTransfers();
    }, []);

    const showDatePickerHandler = () => setShowDatePicker(true);

    const handleDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
            filterTransfersByDate(date);
        }
    };

    const clearDateFilter = () => {
        setSelectedDate(null);
        setFilteredTransfers(transfers); // Reset to all transfers
    };

    const filterTransfersByDate = (date) => {
        const formattedDate = formatDate(date);
        const filtered = transfers.filter(
            (transfer) => transfer.currentDate === formattedDate
        );
        setFilteredTransfers(filtered);
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`; // Format as dd/mm/yyyy
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
                <Text style={styles.headerText}>Lịch sử chuyển giao</Text>
            </View>

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

                    {filteredTransfers.length === 0 ? (
                        <Text style={styles.noHistoryText}>Không có lịch sử điều chuyển nào</Text>
                    ) : (
                        <FlatList
                            data={filteredTransfers}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Detail_transfer_history', { transferId: item.id })}
                                    style={styles.card}
                                >
                                    <Text style={styles.transferText}>ID: {item.transferId}</Text>
                                    <Text style={styles.transferText}>Ngày chuyển: {item.currentDate || 'Không rõ'}</Text>
                                    <Text style={styles.transferText}>Vị trí hiện tại: {item.currentPosition}</Text>
                                    <Text style={styles.transferText}>Vị trí mới: {item.newPosition}</Text>
                                    <Text style={styles.transferText}>Người nhận: {item.receiver}</Text>
                                </TouchableOpacity>
                            )}
                        />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        marginBottom:10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E90FF',
        padding: 15,
        marginBottom: 15,
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        margin: 6,
        shadowColor: '#777777',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
        borderRightWidth: 6,
        borderRightColor: '#87CEFF',
    },
    transferText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 5,
        marginLeft:15,
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        borderColor: '#ccc',
        borderWidth: 1,
        minWidth:250,
    },
    datePickerText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#00B2EE',
    },
    clearFilterButton: {
        marginLeft: 10,
    },
    noHistoryText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        color: '#9C9C9C',
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

export default HistoryTransfer;
