import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import HeaderCustomer from '../Customer/HeaderCustomer';

const AssetTransfer = () => {
  const [transferId, setTransferId] = useState(generateRandomId());
  const [currentDate] = useState(new Date().toLocaleDateString("vi-VN"));
  const [currentPosition, setCurrentPosition] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [assets, setAssets] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [users, setUsers] = useState({ sender: '', receiver: '' });
  const [senderCode, setSenderCode] = useState(''); // Tạo trạng thái riêng cho senderCode
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [noAssetsMessage, setNoAssetsMessage] = useState('');
  
  
  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await firestore().collection('user').get();
      const usersData = usersSnapshot.docs.map(doc => doc.data());
      setUsersList(usersData); // Lưu dữ liệu vào state usersList
    };
  
    fetchUsers();
  }, []);
  
  useEffect(() => {
    const unsubscribeAssets = firestore()
      .collection('asset')
      .onSnapshot(snapshot => {
        const assetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAssets(assetsData);
      });

    const unsubscribeRooms = firestore()
      .collection('rooms')
      .onSnapshot(snapshot => {
        const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRooms(roomsData);
      });

    return () => {
      unsubscribeAssets();
      unsubscribeRooms();
    };
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userId = auth().currentUser.uid;
      const userDoc = await firestore().collection('user').doc(userId).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        setUsers(prevUsers => ({
          ...prevUsers,
          sender: userData.name,
        }));
        setSenderCode(userData.teacherId); // Lưu teacherId vào trạng thái senderCode riêng biệt
      } else {
        console.error("User document not found!");
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentPosition) {
      const currentRoom = rooms.find(room => room.nameRoom === currentPosition);
      if (currentRoom && (!currentRoom.assets || currentRoom.assets.length === 0)) {
        setNoAssetsMessage(`Phòng ${currentPosition} chưa có tài sản nào.`);
      } else {
        setNoAssetsMessage('');
      }
    } else {
      setNoAssetsMessage('');
    }
  }, [currentPosition, rooms]);

  const handleAssetSelection = (assetId) => {
    setSelectedAssets(prevSelected =>
      prevSelected.includes(assetId)
        ? prevSelected.filter(id => id !== assetId)
        : [...prevSelected, assetId]
    );
  };

  const handleTransferAssets = async () => {
    if (!newPosition || selectedAssets.length === 0 || !users.receiver) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const transferDoc = {
        transferId,
        currentDate,
        currentPosition,
        senderCode,
        newPosition,
        selectedAssets,
        senderCode, // Sử dụng trạng thái senderCode riêng biệt
        sender: users.sender, // Lưu trực tiếp sender
        receiver: users.receiver, // Lưu trực tiếp receiver
        notes,
      };

      // Xóa tài sản khỏi phòng hiện tại và cập nhật vị trí tài sản mới
      for (const assetId of selectedAssets) {
        const assetRef = firestore().collection('asset').doc(assetId);

        // Cập nhật phòng hiện tại và phòng mới trong Firestore
        const currentRoom = rooms.find(room => room.nameRoom === currentPosition);
        const newRoom = rooms.find(room => room.nameRoom === newPosition);

        if (currentRoom) {
          const updatedCurrentRoomRef = firestore().collection('rooms').doc(currentRoom.id);
          await updatedCurrentRoomRef.update({
            assets: firestore.FieldValue.arrayRemove(assetId),
          });
        }

        if (newRoom) {
          const updatedNewRoomRef = firestore().collection('rooms').doc(newRoom.id);
          await updatedNewRoomRef.update({
            assets: firestore.FieldValue.arrayUnion(assetId),
          });
        }

        // Cập nhật vị trí mới của tài sản trong collection asset
        await assetRef.update({ position: newPosition });
      }

      // Thêm tài liệu vào lịch sử chuyển giao
      await firestore().collection('transfer_history').add(transferDoc);

      Alert.alert('Thành công', 'Điều chuyển tài sản thành công!');
      setTransferId(generateRandomId());
      setNewPosition('');
      setSelectedAssets([]);
      setUsers({ ...users, receiver: '' });
      setNotes('');
      setSearchTerm('');
    } catch (error) {
      console.error('Error transferring assets: ', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi điều chuyển tài sản.');
    }
  };

  const filteredAssets = assets.filter(asset => 
    asset.assetName.toLowerCase().includes(searchTerm.toLowerCase())
    && (currentPosition === 'Tài sản mới' ? asset.position === 'Tài sản mới' : rooms.find(room => room.nameRoom === currentPosition)?.assets?.includes(asset.id))
  );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Điều Chuyển Tài Sản</Text> */}
      <HeaderCustomer/>
      <View style={styles.form}>
        <Picker
          selectedValue={newPosition}
          onValueChange={value => setNewPosition(value)}
          style={styles.picker}
        >
          <Picker.Item label="Chọn vị trí chuyển" value="" />
          {rooms.map(room => (
            <Picker.Item key={room.id} label={room.nameRoom} value={room.nameRoom} />
          ))}
        </Picker>
        <Picker
          selectedValue={currentPosition}
          onValueChange={value => setCurrentPosition(value)}
          style={styles.picker}
        >
          <Picker.Item label="Chọn vị trí hiện tại" value="" />
          {rooms.map(room => (
            <Picker.Item key={room.id} label={room.nameRoom} value={room.nameRoom} />
          ))}
        </Picker>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tài sản..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.headerColumn}>Chọn</Text>
          <Text style={styles.headerColumn}>Mã Tài Sản</Text>
          <Text style={styles.headerColumn}>Tên Tài Sản</Text>
        </View>
        <View style={styles.tableContainer}>
          <FlatList
            data={filteredAssets}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <TouchableOpacity onPress={() => handleAssetSelection(item.id)}>
                  <Text style={styles.checkbox}>{selectedAssets.includes(item.id) ? '✔️' : '◻️'}</Text>
                </TouchableOpacity>
                <Text style={styles.tableColumn}>{item.assetCode}</Text>
                <Text style={styles.tableColumn_1}>{item.assetName}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.noAssetsText}>{noAssetsMessage || 'Không có tài sản nào.'}</Text>}
          />
        </View>

        <View style={styles.form}>
        <Picker
            selectedValue={users.receiver}
            onValueChange={value => setUsers(prevUsers => ({ ...prevUsers, receiver: value }))}
            style={styles.picker}
          >
            <Picker.Item label="Chọn người nhận" value="" />
            {usersList.map((user, index) => (
              <Picker.Item key={index} label={user.name} value={user.name} />
            ))}
        </Picker>

          <TextInput
            style={styles.input}
            placeholder="Ghi Chú"
            value={notes}
            onChangeText={setNotes}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleTransferAssets}>
          <Text style={styles.buttonText}>Điều Chuyển</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
  
const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
};

const styles = StyleSheet.create({
  container: { 
    // padding: 15, 
    backgroundColor: 'white', 
    flex: 1 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign:"center",
  },
  form: { 
    padding:10,
  },
  text: { 
    fontSize: 16, 
    marginBottom: 10 
  },
  input: { 
    borderColor: '#ddd', 
    borderWidth: 1, 
    padding: 10, 
    marginBottom: 10,
    borderRadius:10,
  },
  picker: {
    borderColor: '#ddd',
    borderWidth: 1, 
    marginBottom: 5 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  headerColumn: { 
    flex: 1, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  tableContainer: { 
    height: 150, 
    maxHeight: 200 
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableColumn: { 
    flex: 1, 
    textAlign: 'left', 
    marginLeft: 85 
  },
  tableColumn_1: { 
    flex: 1, 
    textAlign: 'left', 
    marginLeft: 30 
  },
  checkbox: { 
    textAlign: 'center', 
    fontSize: 18, 
    marginLeft: 50 
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 10, 
    maxWidth:300,
    
  },
  button: { 
    backgroundColor: '#1E90FF', 
    padding: 10, 
    alignItems: 'center',
    borderRadius: 20,
    height:40,
    width:200,
    marginLeft:90,
  },
  buttonText: { color: 'white', fontWeight: '900',textAlign:'center'},
  noAssetsText: { textAlign: 'center', marginTop: 20, color: 'red' }, 
});

export default AssetTransfer;
