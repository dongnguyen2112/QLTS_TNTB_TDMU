import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, ImageBackground,TouchableOpacity } from 'react-native';
import { Button, TextInput, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleSendEmail = () => {
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email.');
      return;
    }

    auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert('Thành công', 'Đã gửi link reset password đến email của bạn!');
        setEmail(''); // Reset trường email sau khi gửi thành công
        navigation.goBack(); // Quay lại màn hình đăng nhập sau khi gửi email
      })
      .catch((error) => Alert.alert('Lỗi', error.message));
  };

  return (
    <ImageBackground
      source={require('../../image/background.jpg')}  // Update with your actual image path
      style={styles.backgroundImage}
      resizeMode="cover"
    > 
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
        <Icon name="arrow-left" size={25} color="white" />
      </TouchableOpacity>
      <View style={styles.overlay}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Quên Mật Khẩu</Text>
            <TextInput
              label="Nhập Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              theme={{ colors: { primary: '#00CCCC' } }}
            />
            <Button mode="contained" onPress={handleSendEmail} style={styles.button}>
              <Text style={styles.buttonText}>Gửi</Text>
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  card: {
    width: '90%', 
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'blue',
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'white',
   
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
});

export default ForgotPassword;
