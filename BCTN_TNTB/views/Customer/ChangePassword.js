// ChangePassword.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ChangePassword = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const toggleShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
    const toggleShowNewPassword = () => setShowNewPassword(!showNewPassword);
    const toggleShowConfirmNewPassword = () => setShowConfirmNewPassword(!showConfirmNewPassword);

    const reauthenticate = (currentPassword) => {
        var user = auth().currentUser;
        var cred = auth.EmailAuthProvider.credential(user.email, currentPassword);
        return user.reauthenticateWithCredential(cred);
    }

    const updatePasswordInFirestore = async (userId, newPassword) => {
        const userDoc = firestore().collection('user').doc(userId);
        const doc = await userDoc.get();

        if (doc.exists) {
            await userDoc.update({
                password: newPassword,
            });
        } else {
            await userDoc.set({
                password: newPassword,
            });
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới không khớp.');
            return;
        }

        setLoading(true);
        try {
            await reauthenticate(currentPassword);
            var user = auth().currentUser;
            await user.updatePassword(newPassword);
            await updatePasswordInFirestore(user.uid, newPassword);
            Alert.alert('Thành công', 'Mật khẩu đã được thay đổi thành công.');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Lỗi đổi mật khẩu', error.message);
            Alert.alert('Lỗi', 'Vui lòng nhập đúng mật khẩu cũ!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đổi mật khẩu</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu cũ"
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />
                <TouchableOpacity onPress={toggleShowCurrentPassword} style={styles.passwordToggle}>
                    <MaterialCommunityIcons
                        name={showCurrentPassword ? 'eye-off' : 'eye'}
                        size={25}
                        color="black"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu mới"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={toggleShowNewPassword} style={styles.passwordToggle}>
                    <MaterialCommunityIcons
                        name={showNewPassword ? 'eye-off' : 'eye'}
                        size={25}
                        color="black"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu mới"
                    secureTextEntry={!showConfirmNewPassword}
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                />
                <TouchableOpacity onPress={toggleShowConfirmNewPassword} style={styles.passwordToggle}>
                    <MaterialCommunityIcons
                        name={showConfirmNewPassword ? 'eye-off' : 'eye'}
                        size={25}
                        color="black"
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={handleChangePassword}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đổi mật khẩu</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F0F4F8',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#FF9966',
    },
    input: {
        height: 50,
        borderColor: '#00CCCC',
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        flex: 1,
    },
    button: {
        height: 50,
        backgroundColor: '#00CCCC',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#FFFF99',
        fontSize: 18,
        fontWeight: '600',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    passwordToggle: {
        position: 'absolute',
        right: 15,
        top: 13,
    },
});

export default ChangePassword;