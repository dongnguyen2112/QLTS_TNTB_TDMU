import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert,TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';

const DetailTransferHistory = ({ route }) => {
    const { transferId } = route.params;
    const navigation = useNavigation();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssetDetails = async () => {
            try {
                const transferDoc = await firestore().collection('transfer_history').doc(transferId).get();

                if (!transferDoc.exists) {
                    Alert.alert('Lỗi', 'Không tìm thấy chi tiết chuyển giao');
                    setLoading(false);
                    return;
                }

                const { selectedAssets } = transferDoc.data();
                const assetDetails = await Promise.all(
                    selectedAssets.map(async (assetId) => {
                        const assetDoc = await firestore().collection('asset').doc(assetId).get();
                        if (assetDoc.exists) {
                            return assetDoc.data();
                        }
                        return null;
                    })
                );

                setAssets(assetDetails.filter((asset) => asset !== null));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching asset details: ', error);
                Alert.alert('Lỗi', 'Không thể lấy thông tin tài sản');
                setLoading(false);
            }
        };

        fetchAssetDetails();
    }, [transferId]);

    if (loading) {
        return <View style={styles.container}><Text style={styles.loadingText}>Đang tải chi tiết...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                    <Icon name="arrow-left" size={25} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Lịch sử chuyển giao</Text>
            </View>
            <FlatList
                data={assets}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                key={'two-column-layout'} 
                renderItem={({ item }) => (
                    <View style={styles.assetContainer}>
                        <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        <Text style={styles.assetPrice}>{item.assetCode}</Text>
                        <Text style={styles.assetName}>{item.assetName}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    assetContainer: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 100,
        height: 80,
        borderRadius: 10,
        marginBottom: 10,
        objectFit:'contain'
    },
    assetName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    assetPrice: {
        fontSize: 16,
        color: '#FF8C00',
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

export default DetailTransferHistory;
