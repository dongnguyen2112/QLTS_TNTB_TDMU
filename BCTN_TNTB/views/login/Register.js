import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // Nhập Firebase Authentication
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Register({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repassword, setRepassword] = useState('');
    const [name, setName] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [validCodes, setValidCodes] = useState([]);

    // Lấy mã hợp lệ từ Firestore
    useEffect(() => {
        const fetchCodes = async () => {
            try {
                const snapshot = await firestore().collection('code_password').get();
                const codes = snapshot.docs.map(doc => doc.data().code);
                setValidCodes(codes);
            } catch (error) {
                console.error('Lỗi khi lấy mã:', error);
            }
        };

        fetchCodes();
    }, []);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidCode = (code) => {
        return validCodes.includes(code);
    };

    const handleRegister = async () => {
        if (!isValidEmail(email)) {
            Alert.alert('Email không hợp lệ', 'Vui lòng nhập địa chỉ email hợp lệ.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Mật khẩu không hợp lệ', 'Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (password !== repassword) {
            Alert.alert('Mật khẩu và mật khẩu nhập lại không khớp');
            return;
        }

        if (teacherId.length !== 6 || isNaN(teacherId) || !isValidCode(teacherId)) {
            Alert.alert('Mã giáo viên không hợp lệ', 'Vui lòng nhập mã giáo viên chính xác gồm 6 chữ số.');
            return;
        }

        setLoading(true);

        try {
            // Tạo người dùng với email và mật khẩu
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);

            // Lấy id của người dùng
            const { uid } = userCredential.user;

            // Thêm thông tin người dùng vào Firestore
            await firestore()
                .collection('user')
                .doc(uid) // Sử dụng id người dùng làm id tài liệu
                .set({
                    email: email,
                    name: name,
                    password: password,
                    role: 'Giảng viên',
                    teacherId: teacherId  // Lưu mã giáo viên
                });

            Alert.alert('Đăng ký thành công');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Lỗi đăng ký', error);
            Alert.alert('Đã có lỗi xảy ra khi đăng ký', error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleResetShowPassword = () => {
        setShowResetPassword(!showResetPassword);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled">
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Image
                            resizeMode="contain"
                            style={styles.headerImg}
                            source={require('../../image/logo.png')} />
                        <Text style={styles.title}>
                            <Text style={{ color: '#FF9966', fontSize: 50 }}>Đăng Ký</Text>
                        </Text>
                    </View>
                    
                    <View style={styles.form}>
                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Họ và tên</Text>
                            <TextInput
                                autoCapitalize="words"
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                onChangeText={setName}
                                placeholder="Nguyen An Phu Dong"
                                placeholderTextColor="#6b7280"
                                style={styles.inputControl}
                                value={name} />
                        </View>

                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Mã giáo viên</Text>
                            <TextInput
                                autoCapitalize="none"
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                keyboardType="numeric"
                                maxLength={6}
                                onChangeText={setTeacherId}
                                placeholder="123456"
                                placeholderTextColor="#6b7280"
                                style={styles.inputControl}
                                value={teacherId} />
                        </View>

                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Địa chỉ email</Text>
                            <TextInput
                                autoCapitalize="none"
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                keyboardType="email-address"
                                onChangeText={setEmail}
                                placeholder="dongnguyen1589@example.com"
                                placeholderTextColor="#6b7280"
                                style={styles.inputControl}
                                value={email} />
                        </View>

                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Mật khẩu</Text>
                            <TextInput
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                onChangeText={setPassword}
                                placeholder="********"
                                placeholderTextColor="#6b7280"
                                style={styles.inputControl}
                                secureTextEntry={!showPassword}
                                value={password} />
                            <TouchableOpacity onPress={toggleShowPassword} style={styles.passwordToggle}>
                                <MaterialCommunityIcons
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={25}
                                        color="black"
                                        style={styles.eyeIcon}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Nhập lại mật khẩu</Text>
                            <TextInput
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                onChangeText={setRepassword}
                                placeholder="********"
                                placeholderTextColor="#6b7280"
                                style={styles.inputControl}
                                secureTextEntry={!showResetPassword}
                                value={repassword} />
                            <TouchableOpacity onPress={toggleResetShowPassword} style={styles.passwordToggle}>
                                <MaterialCommunityIcons
                                        name={showResetPassword ? 'eye-off' : 'eye'}
                                        size={25}
                                        color="black"
                                        style={styles.eyeIcon}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={handleRegister} disabled={loading}>
                            <View style={styles.btn}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.btnText}>Đăng ký</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 0,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 31,
        fontWeight: '700',
        color: '#FFC0CB',
        marginBottom: 6,
    },
    /** Header */
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 36,
    },
    headerImg: {
        width: 500,
        height: 150,
        alignSelf: 'center',
        marginTop: -30
    },
    /** Form */
    form: {
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    formLink: {
        fontSize: 16,
        fontWeight: '600',
        color: '#075eec',
        textAlign: 'center',
        marginTop: 12,
    },
    formFooter: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
        textAlign: 'center',
        letterSpacing: 0.15,
    },
    /** Input */
    input: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#222',
        marginBottom: 8,
    },
    inputControl: {
        height: 50,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
        borderWidth: 1,
        borderColor: '#C9D3DB',
        borderStyle: 'solid',
    },
    passwordToggle: {
        position: 'absolute',
        right: 10,
        top: 14,
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        top: 14,
    },
    btn: {
        backgroundColor: '#FF9966',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
});
