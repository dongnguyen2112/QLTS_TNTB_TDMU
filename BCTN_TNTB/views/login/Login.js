import React, { useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { getExpoPushToken } from '../login/Notifications';  // Import hàm lấy ExpoPushToken
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Image,
    ImageBackground
} from 'react-native';

export default function Login({ navigation }) {
    const [email, setEmail] = useState('dongnguyen2002@gmail.com');
    const [password, setPassword] = useState('123456789');
    const [showPassword, setShowPassword] = useState(false); 
    const [loading, setLoading] = useState(false);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const checkCredentials = async () => {
        if (!isValidEmail(email)) {
            Alert.alert('Email không hợp lệ', 'Vui lòng nhập địa chỉ email hợp lệ.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Mật khẩu không hợp lệ', 'Mật khẩu phải có ít nhất 6 kí tự.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            const userSnapshot = await firestore().collection('user').where('email', '==', email).get();

            if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();

                if (userData.status === 'Khóa tài khoản') {
                    Alert.alert('Tài khoản của bạn đã bị vô hiệu hóa!');
                    setLoading(false);
                    return;
                }

                // Lấy Expo Push Token sau khi đăng nhập thành công
                const expoPushToken = await getExpoPushToken();

                // Lưu Expo Push Token vào Firestore
                if (expoPushToken) {
                    await firestore()
                        .collection('user')
                        .doc(userSnapshot.docs[0].id)
                        .update({ expoPushToken });
                }

                // Điều hướng đến màn hình khác tùy theo role
                if (userData.role === 'Nhân viên') {
                    navigation.navigate('Tab', { userName: email });
                } else if (userData.role === 'Giảng viên') {
                    navigation.navigate('TabC', { userName: email });
                }
            } else {
                Alert.alert('Không tìm thấy thông tin người dùng');
            }
        } catch (error) {
            Alert.alert('Tên đăng nhập hoặc mật khẩu không đúng');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigation.navigate('ForgotPassword');
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground
                source={require('../../image/background.jpg')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.container}>
                        <View style={styles.avatarContainer}>
                            <Image
                                style={styles.avatar}
                                source={require('../../image/TDMU _header.png')}
                            />
                        </View>

                        <View style={styles.form}>
                            <View style={styles.input}>
                                <MaterialCommunityIcons name="email-outline" size={24} color="#999" style={styles.inputIconRight} />
                                <TextInput
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    clearButtonMode="while-editing"
                                    keyboardType="email-address"
                                    onChangeText={setEmail}
                                    placeholder="Nhập email"
                                    placeholderTextColor="#999"
                                    style={styles.inputControl}
                                    value={email}
                                />
                            </View>

                            <View style={styles.input}>
                                <View style={styles.passwordContainer}>
                                    <MaterialCommunityIcons name="lock-outline" size={24} color="#999" style={styles.inputIconRight} />
                                    <TextInput
                                        autoCorrect={false}
                                        clearButtonMode="while-editing"
                                        onChangeText={setPassword}
                                        placeholder="Nhập mật khẩu"
                                        placeholderTextColor="#999"
                                        style={styles.inputControl}
                                        secureTextEntry={!showPassword}
                                        value={password}
                                    />
                                    <TouchableOpacity onPress={toggleShowPassword} style={styles.passwordToggle}>
                                        <MaterialCommunityIcons
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={24}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity onPress={checkCredentials} disabled={loading} style={styles.btn}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.btnText}>Đăng nhập</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleForgotPassword}>
                                <Text style={styles.formLink}>Quên mật khẩu?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center', 
    },
    container: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    avatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 3,
        height: 300,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', 
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    inputIconRight: {
        marginLeft: 10, 
        marginTop: 20,
    },
    inputControl: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
        color: '#333',
        marginLeft: 12,
        marginTop: 20,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordToggle: {
        marginLeft: 10,
    },
    btn: {
        backgroundColor: '#4A90E2',
        paddingVertical: 10,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    formLink: {
        color: '#4A90E2',
        textAlign: 'center',
        marginTop: 10,
    },
});
