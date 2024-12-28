import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert,TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // Import Firebase Auth

export default function QRCodeScanScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Chưa quét');
  const [scannerKey, setScannerKey] = useState(0); // Thêm state cho key của scanner
  const currentUser = auth().currentUser; // Lấy người dùng hiện tại

  const askForCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    askForCameraPermission();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);  // Đánh dấu đã quét
    const trimmedData = data.trim();
    console.log("Giá trị mã QR đã quét: ", trimmedData);
    setText(trimmedData);

    // Kiểm tra nếu mã QR có định dạng 'TS_xxxxxx'
    if (trimmedData.startsWith('TS_')) {
      try {
        // Tìm tài sản (asset) với mã QR đã quét
        const assetSnapshot = await firestore()
          .collection('asset')
          .where('assetCode', '==', trimmedData)
          .get();

        if (!assetSnapshot.empty) {
          const assetData = assetSnapshot.docs[0].data();

          // Điều hướng đến trang Booking và truyền thông tin cần thiết
          navigation.navigate('BookingAsset', { assetData });
        } else {
          Alert.alert('Lỗi', 'Tài sản không tồn tại!');
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tài sản: ", error);
        Alert.alert('Lỗi', 'Không thể lấy dữ liệu tài sản');
      }
    } else {
      try {
        // Xử lý các mã QR khác (ví dụ: phòng)
        const roomSnapshot = await firestore()
          .collection('rooms')
          .where('nameRoom', '==', trimmedData)
          .get();

        console.log("Số lượng phòng tìm thấy: ", roomSnapshot.size);

        if (!roomSnapshot.empty) {
          const roomData = roomSnapshot.docs[0].data();
          const assets = roomData.assets;

          // Lưu mã QR vào collection của người dùng hiện tại
          if (currentUser) {
            await firestore()
              .collection('user') // Chọn collection của user
              .doc(currentUser.uid) // Xác định người dùng hiện tại
              .set(
                {
                  qrCodeValue: trimmedData, // Lưu mã QR đã quét
                },
                { merge: true } // Cập nhật thông tin nếu đã tồn tại
              );

            console.log('Thông tin mã QR đã được lưu thành công!');
          } else {
            Alert.alert('Lỗi', 'Không thể xác định người dùng');
          }

          // Điều hướng sang trang HomeCustomer
          navigation.navigate('HomeCustomer', { qrCodeValue: trimmedData, assets });
        } else {
          Alert.alert('Lỗi', 'Phòng không tồn tại!');
          console.log("Không tìm thấy phòng cho mã QR: ", trimmedData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu phòng: ", error);
        Alert.alert('Lỗi', 'Không thể lấy dữ liệu phòng');
      }
    }
  };

  useEffect(() => {
    if (scanned) {
      // Reset trạng thái quét lại sau khi quét xong
      setText('Chưa quét');
    }
  }, [scanned]);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Đang yêu cầu quyền truy cập camera</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>Không có quyền truy cập camera</Text>
        <Button title={'Cho phép camera'} onPress={askForCameraPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        key={scannerKey}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.centeredBox}>
        <View style={styles.scanBox}>
          {/* Optional: Add corner markers here for a more visual scan box */}
        </View>
      </View>
      <Text style={styles.instructionText}>
        Vui lòng quét mã Barcode hoặc QR code để báo hỏng tài sản
      </Text>
      <Text style={styles.maintext}>{text}</Text>
      {scanned && (
        <Button
          title={'Quét lại !'}
          onPress={() => {
            setScanned(false);
            setText('Chưa quét');
            setScannerKey(prevKey => prevKey + 1);
          }}
          color='#1E90FF'
        />
      )}
      <View style={styles.reportButton}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Form_Problem')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Theo mã phòng</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredBox: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: '30%',
    width: '100%',
  },
  scanBox: {
    height: 250,
    width: 250,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    position: 'absolute',
    top: '10%',
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    paddingHorizontal: 50,
  },
  maintext: {
    position: 'absolute',
    bottom: '19%',
    fontSize: 16,
    color: '#FFF',
  },
  reportButton: {
    position: 'absolute',
    bottom: '12%',
    width: '50%',
    alignItems: 'center', // Đảm bảo nút được căn giữa
  },
  button: {
    backgroundColor: '#FF6347', // Màu nền của nút
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10, // Bo tròn nút
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
