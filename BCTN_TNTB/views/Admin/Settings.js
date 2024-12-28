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
                        setRole(userData.role)
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

        // Thiết lập lắng nghe thay đổi trạng thái đăng nhập
        const unsubscribe = auth().onAuthStateChanged(async (user) => {
            if (!user) {
                // Nếu người dùng đăng xuất, xóa expoPushToken trên Firestore
                if (userData) {
                    const userDocSnapshot = await firestore()
                        .collection('user')
                        .where('email', '==', userData.email)
                        .get();

                    if (!userDocSnapshot.empty) {
                        const userDocId = userDocSnapshot.docs[0].id;
                        await firestore().collection('user').doc(userDocId).update({
                            expoPushToken: null
                        });
                    }
                }
                // Điều hướng về màn hình đăng nhập
                navigation.navigate('Login');
            }
        });

        // Hủy đăng ký lắng nghe khi component bị hủy
        return () => unsubscribe();
    }, [userData]);

    const handleLogout = async () => {
        try {
            await auth().signOut(); // Gọi signOut để kích hoạt onAuthStateChanged
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
                    <Text style={styles.menuText}>Xem trang cá nhân</Text>
                    <Icon name="chevron-right" size={16} color="#B0B0B0" style={styles.chevron} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History_problem')}>
                    <Icon name="wrench" size={20} color="#4CAF50" style={styles.icon} />
                    <Text style={styles.menuText}>Lịch sử sửa chữa</Text>
                    <Icon name="chevron-right" size={16} color="#B0B0B0" style={styles.chevron} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History_transfer')}>
                    <Icon name="history" size={20} color="#4CAF50" style={styles.icon} />
                    <Text style={styles.menuText}>Lịch sử điều chuyển</Text>
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
        borderRadius: 15, // Bo tròn các góc
        marginHorizontal: 20, // Khoảng cách ngang so với viền màn hình
        elevation: 5,
        marginBottom:10, // Tạo bóng đổ cho phần profileSection
    },
    profileImage: {
        width: 100, // Chiều rộng của ảnh
        height: 100, // Chiều cao của ảnh
        borderRadius: 50, // Bo tròn ảnh
        marginBottom: 10, // Khoảng cách dưới của ảnh
        borderWidth: 3, // Viền cho ảnh
        borderColor: '#FFFFFF', // Màu viền trắng
    },
    profileName: {
        fontSize: 20, // Kích thước chữ tên
        fontWeight: 'bold', // Độ đậm của tên
        color: 'black', // Màu chữ tên
        marginTop: 10, // Thêm khoảng cách phía trên tên
    },
    profileAddress: {
        fontSize: 14, // Kích thước chữ địa chỉ
        color: 'gray', // Màu chữ địa chỉ
    },
    
    menuSection: {
        backgroundColor: '#FFFFFF',
        // marginBottom: 20,
        marginTop:20,
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
