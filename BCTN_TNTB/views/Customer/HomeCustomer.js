import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Image, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreenCustomer = ({ navigation, route }) => {
    const [assets, setAssets] = useState([]); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [filteredAssets, setFilteredAssets] = useState([]); 
    const qrCodeValue = route.params?.qrCodeValue; 
    const assetIds = route.params?.assets; 
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                if (assetIds && assetIds.length > 0) {
                    const assetPromises = assetIds.map(async (assetId) => {
                        const assetSnapshot = await firestore().collection('asset').doc(assetId).get();
                        return { id: assetSnapshot.id, ...assetSnapshot.data() };
                    });

                    const assetsData = await Promise.all(assetPromises);
                    setAssets(assetsData);
                    setFilteredAssets(assetsData);
                } else {
                    console.log('Không có tài sản nào để hiển thị.');
                }
            } catch (error) {
                console.error('Lỗi khi lấy thông tin tài sản từ Firestore:', error);
            }
        };

        fetchAssets();
    }, [assetIds]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = assets.filter(asset =>
                asset.assetName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredAssets(filtered);
        } else {
            setFilteredAssets(assets);
        }
    }, [searchQuery, assets]);

    const handleAssetPress = (asset) => {
        navigation.navigate('Booking', {
            assetName: asset.assetName,
            assetCode: asset.assetCode,
            imageUrl: asset.imageUrl,
            qrCodeValue: qrCodeValue
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleAssetPress(item)}>
  <View style={styles.card}>
    {/* Phần ảnh */}
    <Image source={{ uri: item.imageUrl }} style={styles.image} />

    {/* Phần văn bản */}
    <View style={styles.textContainer}>
      <Text style={styles.title}>{item.assetName}</Text>
      <Text style={styles.subtitle}>{item.position}</Text>
    </View>
  </View>
</TouchableOpacity>



    );

return (
    <>
    <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
            <Icon name="arrow-left" size={25} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Danh sách tài sản</Text>
    </View>
    <View style={styles.container}>
        <View style={styles.searchBarContainer}>
            <MaterialCommunityIcons name="magnify" size={30} color="#888" style={styles.icon} />
            <TextInput
                style={styles.searchBar}
                placeholder="Tìm kiếm tài sản "
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        <FlatList
            data={filteredAssets}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.flatListContainer}
        />
    </View>
</>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E90FF', // Màu nền của header
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    iconContainer: {
        marginRight: 10,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white', // Màu chữ
        flex: 1,
        textAlign: 'center',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    searchBar: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 0,
        marginLeft: 8, // Thêm khoảng cách giữa icon và TextInput
    },
    icon: {
        marginRight: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        margin: 8, // Giảm margin giữa các item
        minWidth: 180, // Chiều rộng tối thiểu cho mỗi item
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        display:'flex',
        gap:12,
        height: 235,
        overflow: 'hidden', // Đảm bảo các phần tử con nằm trong bo góc của card
    },
    image: {
        marginTop: 10,
        width: '90%',
        height: 120,
        resizeMode: 'contain',
    },
    textContainer: {
        width: '100%',
        padding: 15,
        backgroundColor: '#EEEEEE', // Màu nền xám nhạt cho phần text
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center', 
        marginTop: 10,
    },
    subtitle: {
        fontSize: 14,
        color: 'gray',
        textAlign: 'center',
        marginTop: 10,
    },
    flatListContainer: {
        paddingBottom: 10,
        justifyContent: 'space-between', // Căn đều các item trong hàng
    },
});


export default HomeScreenCustomer;
