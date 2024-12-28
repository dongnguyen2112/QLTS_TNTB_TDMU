import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const Profile = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth().currentUser;

                if (user) {
                    const userQuerySnapshot = await firestore()
                        .collection('user')
                        .where('email', '==', user.email)
                        .get();

                    if (!userQuerySnapshot.empty) {
                        const userData = userQuerySnapshot.docs[0].data();
                        setUserData(userData);
                        setName(userData.name);
                    }
                }
            } catch (error) {
                console.error('Lỗi', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Không được để trống tên người dùng.');
            return;
        }

        setUpdating(true);
        try {
            const user = auth().currentUser;

            if (user) {
                const userDoc = await firestore()
                    .collection('user')
                    .doc(user.uid);

                await userDoc.update({
                    name,
                });

                Alert.alert('Thành công', 'Tên người dùng đã được cập nhật!');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin tài khoản.');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                <Icon name="arrow-left" size={25} color="black" />
            </TouchableOpacity>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1E90FF" />
                ) : (
                    <>
                        <Text style={styles.title}>Thông tin tài khoản</Text>
                        
                        <View style={styles.card}>
                            <Text style={styles.text}>Email: {userData?.email}</Text>
                            <Text style={styles.text}>Quyền: {userData?.role}</Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.inputLabel}>Tên người dùng</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                            />

                            <TouchableOpacity
                                onPress={handleUpdateProfile}
                                style={styles.button}
                                disabled={updating}
                            >
                                {updating ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Cập nhật</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    iconContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#FF9966',
    },
    card: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 15,
        width: '100%',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
        color: '#333',
        fontWeight:"bold",
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        marginBottom: 8,
    },
    input: {
        height: 50,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
        width: '100%',
    },
    button: {
        backgroundColor: '#00CCCC',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
        marginTop: 20,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFF99',
    },
});

export default Profile;
