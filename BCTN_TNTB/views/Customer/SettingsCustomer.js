import React, { useEffect, useState } from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Text,
    Image,
    ActivityIndicator
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth().currentUser;

        if (user) {
            // Sử dụng onSnapshot để lắng nghe các thay đổi
            const unsubscribe = firestore()
                .collection('user')
                .where('email', '==', user.email)
                .onSnapshot((querySnapshot) => {
                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        setUserData(userData);
                        setName(userData.name);
                        setRole(userData.role);
                        setAvatarUrl(userData.avatarUrl);
                    } else {
                        setName('Unknown');
                        setRole('Unknown');
                        setAvatarUrl(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error('Error fetching user data:', error);
                    setLoading(false);
                });

            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogout = async () => {
        try {
            const user = auth().currentUser;
            if (user && userData) {
                // Lấy ID của tài liệu người dùng
                const userDocSnapshot = await firestore()
                    .collection('user')
                    .where('email', '==', user.email)
                    .get();

                if (!userDocSnapshot.empty) {
                    const userDocId = userDocSnapshot.docs[0].id;
                    // Cập nhật expoPushToken thành null
                    await firestore().collection('user').doc(userDocId).update({
                        expoPushToken: null
                    });
                }
            }

            // Đăng xuất người dùng và điều hướng đến màn hình đăng nhập
            await auth().signOut();
            navigation.navigate('Login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}> 
                <Text style={styles.title}>Thông tin tài khoản</Text>
            </View>
            
            {/* Profile Info */}
            <View style={styles.profileSection}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        <Image
                            source={{ uri: avatarUrl }}
                            style={styles.profileImage}
                        />
                        <Text style={styles.profileName}>{name || 'Unknown'}</Text>
                        <Text style={styles.profileAddress}>{role || 'Unknown'}</Text>
                    </>
                )}
            </View>

            {/* Menu Options */}
            <View style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ProfileCustomer')}>
                    <Icon name="user" size={20} color="#4CAF50" style={styles.icon} />
                    <Text style={styles.menuText}>Chỉnh sửa thông Tin</Text>
                    <Icon name="chevron-right" size={16} color="#B0B0B0" style={styles.chevron} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HistoryCustomer')}>
                    <Icon name="history" size={20} color="#4CAF50" style={styles.icon} />
                    <Text style={styles.menuText}>Lịch sử báo hỏng</Text>
                    <Icon name="chevron-right" size={16} color="#B0B0B0" style={styles.chevron} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePassword')}>
                    <Icon name="unlock" size={20} color="#4CAF50" style={styles.icon} />
                    <Text style={styles.menuText}>Đổi mật khẩu</Text>
                    <Icon name="chevron-right" size={16} color="#B0B0B0" style={styles.chevron} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Icon name="sign-out" size={20} color="#4CAF50" style={styles.icon} />
                    <Text style={styles.menuText}>Đăng xuất</Text>
                    <Icon name="chevron-right" size={16} color="#B0B0B0" style={styles.chevron} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};
;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: '#1E90FF', 
        height: 180, 
        alignItems: 'center', 
        borderBottomLeftRadius: 15, 
        borderBottomRightRadius: 15, 
    },
    title: {
        color: 'white', 
        fontSize: 25, 
        fontWeight: '900', 
        marginTop: 20, 
    },
    profileSection: {
        alignItems: 'center', 
        backgroundColor: '#FFFFFF', 
        paddingVertical: 20, 
        marginTop: -70, 
        borderRadius: 15,
        marginHorizontal: 20,
        elevation: 5,
        marginBottom: 10,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 10,
    },
    profileAddress: {
        fontSize: 14,
        color: 'gray',
    },
    
    menuSection: {
        backgroundColor: '#FFFFFF',
        marginTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E4E8F1',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: 'black',
    },
    icon: {
        marginRight: 10,
    },
    chevron: {
        marginLeft: 'auto',
    },
});

export default ProfileScreen;
