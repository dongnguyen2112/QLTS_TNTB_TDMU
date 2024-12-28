import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'react-native-image-picker';

const ProfileCustomer = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);
    const [name, setName] = useState('');  // State lưu tên mới
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);

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
                        setName(userData.name);  // Cập nhật tên hiện tại từ Firestore
                        setAvatarUrl(userData.avatarUrl);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
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
                    avatarUrl,
                });

                Alert.alert('Thành công', 'Tên người dùng đã được cập nhật!');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin tài khoản.');
        } finally {
            setUpdating(false);
        }
    };

    const handleChooseAvatar = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo' }, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
                return;
            }

            if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorCode);
                return;
            }

            const source = response.assets[0];
            const fileName = source.fileName || `avatar_${Date.now()}.jpg`;

            if (!source.uri) {
                console.error('No file URI found in the response.');
                Alert.alert('Lỗi', 'Không tìm thấy ảnh để tải lên.');
                return;
            }

            try {
                const user = auth().currentUser;

                if (user) {
                    const reference = storage().ref(`avatars/${user.uid}/${fileName}`);

                    await reference.putFile(source.uri);

                    const url = await reference.getDownloadURL();

                    setAvatarUrl(url);
                    Alert.alert('Thông báo', 'Ảnh đại diện đã được cập nhật!');

                    const userDoc = firestore().collection('user').doc(user.uid);
                    await userDoc.update({
                        avatarUrl: url,
                    });
                }
            } catch (error) {
                console.error('Error uploading image: ', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải ảnh lên.');
            }
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconContainer}>
                <Icon name="arrow-left" size={25} color="black" />
            </TouchableOpacity>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        {/* Avatar section */}
                        <View style={styles.avatarContainer}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                            ) : (
                                <Text style={styles.avatarPlaceholder}>Chọn ảnh đại diện</Text>
                            )}
                            <TouchableOpacity onPress={handleChooseAvatar} style={styles.editIcon}>
                                <Icon name="pencil" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Title - Changeable Name */}
                        <TextInput
                            style={styles.title}
                            value={name}
                            onChangeText={setName}
                        />

                       

                        {/* Form fields */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Mã người dùng</Text>
                            <View style={styles.inputWrapper}>
                                <Icon name="id-card-o" size={20} color="#999" />
                                <TextInput
                                    value={userData?.teacherId}
                                    editable={false}
                                    style={styles.input}
                                />
                            </View>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <Icon name="envelope" size={20} color="#999" />
                                <TextInput
                                    value={userData?.email}
                                    editable={false}
                                    style={styles.input}
                                />
                            </View>
                            <Text style={styles.inputLabel}>Chức vụ</Text>
                            <View style={styles.inputWrapper}>
                                <Icon name="user" size={20} color="#999" />
                                <TextInput
                                    value={userData?.role || '+93123135'}
                                    editable={false}
                                    style={styles.input}
                                />
                            </View>
                            
                        </View>
                        
                         <TouchableOpacity onPress={handleUpdateProfile} style={styles.updateButton}>
                            {updating ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.updateButtonText}>Cập nhật</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 20,
    },
    iconContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#EAEAEA',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        lineHeight: 120,
        color: '#999',
    },
    editIcon: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#1E90FF',
        borderRadius: 20,
        padding: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginBottom: 20,
    },
    updateButton: {
        backgroundColor: '#1E90FF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 20,
        marginTop:15,
        borderRadius: 20,
    },
    updateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight:'900'
    },
    inputContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#999',
        marginBottom: 5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        marginBottom: 15,
    },
    input: {
        flex: 1,
        height: 50,
        marginLeft: 10,
        color: '#333',
    },
});

export default ProfileCustomer;
